import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("vv_access_token")?.value;
  if (!token) redirect("/entrar");
  const runtime = env as unknown as Record<string, string | undefined>;
  const baseUrl = runtime.SUPABASE_URL;
  const apiKey = runtime.SUPABASE_PUBLISHABLE_KEY;
  if (!baseUrl || !apiKey) redirect("/entrar?erro=configuracao");
  let valid = false;
  try {
    const response = await fetch(`${baseUrl}/auth/v1/user`, { headers: { apikey: apiKey, Authorization: `Bearer ${token}` }, cache: "no-store" });
    valid = response.ok;
  } catch { valid = false; }
  if (!valid) redirect("/api/auth?returnTo=/perfil");
  return children;
}
