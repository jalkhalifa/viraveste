import { env } from "cloudflare:workers";

function cookie(request: Request, name: string) { const match = request.headers.get("cookie")?.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`)); return match ? decodeURIComponent(match.slice(name.length + 1)) : null; }
function config() { const runtime = env as unknown as Record<string, string | undefined>; return { baseUrl: runtime.SUPABASE_URL, apiKey: runtime.SUPABASE_PUBLISHABLE_KEY }; }
function output(data: unknown, status = 200) { return Response.json(data, { status }); }
async function currentUser(baseUrl: string, apiKey: string, token: string) { const response = await fetch(`${baseUrl}/auth/v1/user`, { headers: { apikey: apiKey, Authorization: `Bearer ${token}` }, cache: "no-store" }); if (!response.ok) return null; return response.json() as Promise<{ id: string; email?: string }>; }

export async function GET(request: Request) {
  const { baseUrl, apiKey } = config(); const token = cookie(request, "vv_access_token");
  if (!baseUrl || !apiKey || !token) return output({ error: "Sessão não encontrada." }, 401);
  const user = await currentUser(baseUrl, apiKey, token); if (!user) return output({ error: "Sessão expirada." }, 401);
  const response = await fetch(`${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=full_name,phone,city,state,wants_to_buy,wants_to_sell,account_status`, { headers: { apikey: apiKey, Authorization: `Bearer ${token}`, Accept: "application/vnd.pgrst.object+json" }, cache: "no-store" });
  if (!response.ok) return output({ error: "Não foi possível carregar o perfil." }, response.status);
  return output({ profile: await response.json(), email: user.email ?? "" });
}

export async function PATCH(request: Request) {
  const { baseUrl, apiKey } = config(); const token = cookie(request, "vv_access_token");
  if (!baseUrl || !apiKey || !token) return output({ error: "Sessão não encontrada." }, 401);
  const user = await currentUser(baseUrl, apiKey, token); if (!user) return output({ error: "Sessão expirada." }, 401);
  const body = await request.json() as Record<string, unknown>;
  const profile = { full_name: String(body.full_name ?? "").trim().slice(0, 120), phone: String(body.phone ?? "").trim().slice(0, 30), city: String(body.city ?? "").trim().slice(0, 100), state: String(body.state ?? "").trim().slice(0, 30), wants_to_buy: Boolean(body.wants_to_buy), wants_to_sell: Boolean(body.wants_to_sell) };
  if (!profile.full_name) return output({ error: "Informe seu nome." }, 400);
  const response = await fetch(`${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`, { method: "PATCH", headers: { apikey: apiKey, Authorization: `Bearer ${token}`, "content-type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(profile) });
  if (!response.ok) return output({ error: "Não foi possível salvar o perfil." }, response.status);
  const rows = await response.json() as unknown[]; return output({ profile: rows[0] ?? profile });
}
