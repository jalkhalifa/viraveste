import { env } from "cloudflare:workers";

export async function GET(request:Request){
 const runtime=env as unknown as Record<string,string|undefined>;const baseUrl=runtime.SUPABASE_URL,apiKey=runtime.SUPABASE_PUBLISHABLE_KEY;if(!baseUrl||!apiKey)return Response.json({error:"Conexão não configurada."},{status:503});const id=new URL(request.url).searchParams.get("id")||"";if(!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:"Vendedor inválido."},{status:400});const response=await fetch(`${baseUrl}/rest/v1/public_seller_profiles?select=id,display_name,city,state,avatar_url,member_since&id=eq.${encodeURIComponent(id)}`,{headers:{apikey:apiKey,Authorization:`Bearer ${apiKey}`},cache:"no-store"});if(!response.ok)return Response.json({error:"Não foi possível carregar o perfil."},{status:response.status});const rows=await response.json() as unknown[];return rows.length?Response.json({seller:rows[0]}):Response.json({error:"Perfil não encontrado."},{status:404});
}
