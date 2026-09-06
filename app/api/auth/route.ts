import { env } from "cloudflare:workers";

type AuthAction = "login" | "signup" | "recover" | "logout";
type Session = { access_token?: string; refresh_token?: string; expires_in?: number };

function runtimeConfig() {
  const runtime = env as unknown as Record<string, string | undefined>;
  return { baseUrl: runtime.SUPABASE_URL, apiKey: runtime.SUPABASE_PUBLISHABLE_KEY };
}
function json(data: unknown, status = 200, headers?: Headers) {
  const responseHeaders = headers ?? new Headers(); responseHeaders.set("content-type", "application/json");
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}
function sessionHeaders(session: Session, clear = false) {
  const headers = new Headers(); const age = clear ? 0 : Math.max(Number(session.expires_in ?? 3600), 60);
  headers.append("set-cookie", `vv_access_token=${clear ? "" : session.access_token ?? ""}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${age}`);
  headers.append("set-cookie", `vv_refresh_token=${clear ? "" : session.refresh_token ?? ""}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=${clear ? 0 : 2592000}`);
  return headers;
}
function cookie(request: Request, name: string) {
  const match = request.headers.get("cookie")?.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
function messageFor(error: unknown) {
  const text = typeof error === "string" ? error : "Não foi possível concluir a solicitação.";
  if (text.includes("Invalid login")) return "E-mail ou senha incorretos.";
  if (text.includes("already registered")) return "Este e-mail já está cadastrado.";
  if (text.includes("Password should")) return "A senha precisa ter pelo menos 8 caracteres.";
  if (text.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  return text;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const action = body.action as AuthAction;
    if (action === "logout") return json({ ok: true }, 200, sessionHeaders({}, true));
    const { baseUrl, apiKey } = runtimeConfig();
    if (!baseUrl || !apiKey) return json({ error: "A conexão de acesso ainda não está configurada." }, 503);
    const email = String(body.email ?? "").trim().toLowerCase(); const password = String(body.password ?? "");
    if (!email) return json({ error: "Informe um e-mail válido." }, 400);
    let endpoint = `${baseUrl}/auth/v1/`; let payload: Record<string, unknown> = { email };
    if (action === "login") { endpoint += "token?grant_type=password"; payload.password = password; }
    else if (action === "signup") { endpoint += "signup"; payload = { email, password, data: body.profile ?? {} }; }
    else if (action === "recover") endpoint += "recover"; else return json({ error: "Ação inválida." }, 400);
    const response = await fetch(endpoint, { method: "POST", headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json() as Record<string, unknown> & Session;
    if (!response.ok) return json({ error: messageFor(result.msg ?? result.message ?? result.error_description) }, response.status);
    if (result.access_token && result.refresh_token) return json({ ok: true }, 200, sessionHeaders(result));
    return json({ ok: true, confirmationRequired: action === "signup" });
  } catch { return json({ error: "Não foi possível conectar ao serviço de acesso." }, 500); }
}

export async function GET(request: Request) {
  const { baseUrl, apiKey } = runtimeConfig(); const refreshToken = cookie(request, "vv_refresh_token");
  const requestUrl = new URL(request.url); const requested = requestUrl.searchParams.get("returnTo") ?? "/perfil";
  const returnTo = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/perfil";
  if (!baseUrl || !apiKey || !refreshToken) return Response.redirect(new URL("/entrar?erro=sessao", request.url), 303);
  try {
    const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ refresh_token: refreshToken }) });
    const result = await response.json() as Session;
    if (!response.ok || !result.access_token || !result.refresh_token) return Response.redirect(new URL("/entrar?erro=sessao", request.url), 303);
    const headers = sessionHeaders(result); headers.set("location", new URL(returnTo, request.url).toString());
    return new Response(null, { status: 303, headers });
  } catch { return Response.redirect(new URL("/entrar?erro=conexao", request.url), 303); }
}
