import { env } from "cloudflare:workers";

type AddressInput = Record<string, unknown>;

function cookie(request: Request, name: string) { const match = request.headers.get("cookie")?.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`)); return match ? decodeURIComponent(match.slice(name.length + 1)) : null; }
function config() { const runtime = env as unknown as Record<string, string | undefined>; return { baseUrl: runtime.SUPABASE_URL, apiKey: runtime.SUPABASE_PUBLISHABLE_KEY }; }
function output(data: unknown, status = 200) { return Response.json(data, { status }); }
async function currentUser(baseUrl: string, apiKey: string, token: string) { const response = await fetch(`${baseUrl}/auth/v1/user`, { headers: { apikey: apiKey, Authorization: `Bearer ${token}` }, cache: "no-store" }); if (!response.ok) return null; return response.json() as Promise<{ id: string }>; }
function clean(body: AddressInput) {
  return {
    label: String(body.label ?? "Casa").trim().slice(0, 30),
    recipient_name: String(body.recipient_name ?? "").trim().slice(0, 120),
    postal_code: String(body.postal_code ?? "").replace(/\D/g, "").slice(0, 8),
    street: String(body.street ?? "").trim().slice(0, 150),
    number: String(body.number ?? "").trim().slice(0, 20),
    complement: String(body.complement ?? "").trim().slice(0, 100) || null,
    neighborhood: String(body.neighborhood ?? "").trim().slice(0, 100),
    city: String(body.city ?? "").trim().slice(0, 100),
    state: String(body.state ?? "").trim().toUpperCase().slice(0, 2),
    is_default: Boolean(body.is_default),
  };
}
async function session(request: Request) { const { baseUrl, apiKey } = config(); const token = cookie(request, "vv_access_token"); if (!baseUrl || !apiKey || !token) return null; const user = await currentUser(baseUrl, apiKey, token); return user ? { baseUrl, apiKey, token, user } : null; }
function headers(apiKey: string, token: string, extra: Record<string, string> = {}) { return { apikey: apiKey, Authorization: `Bearer ${token}`, ...extra }; }

export async function GET(request: Request) {
  const auth = await session(request); if (!auth) return output({ error: "Sessão expirada." }, 401);
  const response = await fetch(`${auth.baseUrl}/rest/v1/addresses?select=id,label,recipient_name,postal_code,street,number,complement,neighborhood,city,state,country_code,is_default&order=is_default.desc,created_at.asc`, { headers: headers(auth.apiKey, auth.token), cache: "no-store" });
  if (!response.ok) return output({ error: "Não foi possível carregar seus endereços." }, response.status);
  return output({ addresses: await response.json() });
}

export async function POST(request: Request) {
  const auth = await session(request); if (!auth) return output({ error: "Sessão expirada." }, 401);
  const address = clean(await request.json() as AddressInput);
  if (!address.recipient_name || address.postal_code.length !== 8 || !address.street || !address.number || !address.neighborhood || !address.city || address.state.length !== 2) return output({ error: "Preencha todos os campos obrigatórios do endereço." }, 400);
  const response = await fetch(`${auth.baseUrl}/rest/v1/addresses`, { method: "POST", headers: headers(auth.apiKey, auth.token, { "content-type": "application/json", Prefer: "return=representation" }), body: JSON.stringify({ ...address, user_id: auth.user.id }) });
  if (!response.ok) return output({ error: "Não foi possível cadastrar o endereço." }, response.status);
  const rows = await response.json() as unknown[]; return output({ address: rows[0] }, 201);
}

export async function PATCH(request: Request) {
  const auth = await session(request); if (!auth) return output({ error: "Sessão expirada." }, 401);
  const body = await request.json() as AddressInput; const id = String(body.id ?? ""); const address = clean(body);
  if (!id || !address.recipient_name || address.postal_code.length !== 8 || !address.street || !address.number || !address.neighborhood || !address.city || address.state.length !== 2) return output({ error: "Confira os dados do endereço." }, 400);
  const response = await fetch(`${auth.baseUrl}/rest/v1/addresses?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: headers(auth.apiKey, auth.token, { "content-type": "application/json", Prefer: "return=representation" }), body: JSON.stringify(address) });
  if (!response.ok) return output({ error: "Não foi possível atualizar o endereço." }, response.status);
  const rows = await response.json() as unknown[]; return output({ address: rows[0] });
}

export async function DELETE(request: Request) {
  const auth = await session(request); if (!auth) return output({ error: "Sessão expirada." }, 401);
  const id = new URL(request.url).searchParams.get("id"); if (!id) return output({ error: "Endereço não informado." }, 400);
  const response = await fetch(`${auth.baseUrl}/rest/v1/addresses?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: headers(auth.apiKey, auth.token) });
  if (!response.ok) return output({ error: "Não foi possível excluir o endereço." }, response.status);
  return output({ success: true });
}
