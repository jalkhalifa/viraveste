import { env } from "cloudflare:workers";
type Runtime = { baseUrl: string; apiKey: string };
function config(): Runtime | null {
  const r = env as unknown as Record<string, string | undefined>;
  return r.SUPABASE_URL && r.SUPABASE_PUBLISHABLE_KEY
    ? { baseUrl: r.SUPABASE_URL, apiKey: r.SUPABASE_PUBLISHABLE_KEY }
    : null;
}
function tokenFor(request: Request) {
  const p = request.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("vv_access_token="));
  return p ? decodeURIComponent(p.slice("vv_access_token=".length)) : null;
}
function headers(k: string, t?: string, extra: Record<string, string> = {}) {
  return { apikey: k, Authorization: "Bearer " + (t || k), ...extra };
}
async function userId(r: Runtime, t: string) {
  const x = await fetch(r.baseUrl + "/auth/v1/user", {
    headers: headers(r.apiKey, t),
    cache: "no-store",
  });
  return x.ok ? ((await x.json()) as { id: string }).id : null;
}
const valid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);
export async function GET(request: Request) {
  const runtime = config();
  if (!runtime)
    return Response.json(
      { error: "Conexão não configurada." },
      { status: 503 },
    );
  const params = new URL(request.url).searchParams,
    userParam = params.get("user"),
    mine = params.get("mine") === "1";
  let token: string | undefined, user: string | undefined;
  if (mine) {
    token = tokenFor(request) || undefined;
    if (!token)
      return Response.json({ error: "Entre na sua conta." }, { status: 401 });
    user = (await userId(runtime, token)) || undefined;
    if (!user)
      return Response.json({ error: "Sua sessão expirou." }, { status: 401 });
  }
  if (!mine && !valid(String(userParam || "")))
    return Response.json({ error: "Perfil inválido." }, { status: 400 });
  const filter = mine
    ? "reviewer_id=eq." + user
    : "reviewed_user_id=eq." + encodeURIComponent(String(userParam));
  const response = await fetch(
    runtime.baseUrl +
      "/rest/v1/reviews?select=id,order_id,reviewer_id,reviewed_user_id,review_type,rating,comment,created_at&" +
      filter +
      "&order=created_at.desc",
    { headers: headers(runtime.apiKey, token), cache: "no-store" },
  );
  if (!response.ok)
    return Response.json(
      { error: "Não foi possível carregar as avaliações." },
      { status: response.status },
    );
  const reviews = (await response.json()) as Array<Record<string, unknown>>;
  const enriched = await Promise.all(
    reviews.map(async (review) => {
      if (mine) return review;
      const p = await fetch(
        runtime.baseUrl +
          "/rest/v1/public_seller_profiles?select=id,display_name,avatar_url&id=eq." +
          review.reviewer_id,
        { headers: headers(runtime.apiKey), cache: "no-store" },
      );
      const rows = p.ok ? ((await p.json()) as unknown[]) : [];
      return { ...review, reviewer: rows[0] || null };
    }),
  );
  const average = enriched.length
    ? Number(
        (
          enriched.reduce((sum, item) => sum + Number(item.rating), 0) /
          enriched.length
        ).toFixed(1),
      )
    : 0;
  return Response.json({ reviews: enriched, average, total: enriched.length });
}
export async function POST(request: Request) {
  const runtime = config();
  if (!runtime)
    return Response.json(
      { error: "Conexão não configurada." },
      { status: 503 },
    );
  const token = tokenFor(request);
  if (!token)
    return Response.json(
      { error: "Entre na sua conta para avaliar." },
      { status: 401 },
    );
  const user = await userId(runtime, token);
  if (!user)
    return Response.json({ error: "Sua sessão expirou." }, { status: 401 });
  const body = (await request.json()) as {
    orderId?: string;
    rating?: number;
    comment?: string;
  };
  const orderId = String(body.orderId || ""),
    rating = Number(body.rating),
    comment = String(body.comment || "")
      .trim()
      .slice(0, 1000);
  if (
    !valid(orderId) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    (comment && comment.length < 3)
  )
    return Response.json(
      { error: "Confira a nota e o comentário." },
      { status: 400 },
    );
  const response = await fetch(runtime.baseUrl + "/rest/v1/reviews", {
    method: "POST",
    headers: headers(runtime.apiKey, token, {
      "content-type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify({
      order_id: orderId,
      reviewer_id: user,
      reviewed_user_id: user,
      review_type: "buyer_reviews_seller",
      rating,
      comment: comment || null,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    return Response.json(
      {
        error: detail.includes("unique")
          ? "Você já avaliou este pedido."
          : detail.includes("conclusão")
            ? "O pedido precisa estar concluído para ser avaliado."
            : "Não foi possível enviar a avaliação.",
      },
      { status: response.status },
    );
  }
  const rows = (await response.json()) as unknown[];
  return Response.json({ review: rows[0] }, { status: 201 });
}
