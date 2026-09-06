import { env } from "cloudflare:workers";

type RuntimeConfig = { baseUrl: string; apiKey: string };

function cookie(request: Request, name: string) {
  const value = request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : null;
}
function config(): RuntimeConfig | null {
  const runtime = env as unknown as Record<string, string | undefined>;
  return runtime.SUPABASE_URL && runtime.SUPABASE_PUBLISHABLE_KEY ? { baseUrl: runtime.SUPABASE_URL, apiKey: runtime.SUPABASE_PUBLISHABLE_KEY } : null;
}
function authHeaders(apiKey: string, token?: string, extra: Record<string,string> = {}) {
  return { apikey: apiKey, Authorization: `Bearer ${token ?? apiKey}`, ...extra };
}
async function userFor(request: Request, runtime: RuntimeConfig) {
  const token = cookie(request, "vv_access_token");
  if (!token) return null;
  const response = await fetch(`${runtime.baseUrl}/auth/v1/user`, { headers: authHeaders(runtime.apiKey, token), cache: "no-store" });
  if (!response.ok) return null;
  const user = await response.json() as { id: string };
  return { token, id: user.id };
}
function text(form: FormData, key: string, max = 1000) { return String(form.get(key) ?? "").trim().slice(0, max); }
function money(value: string) { const amount = Number(value.replace(/\./g, "").replace(",", ".")); return Number.isFinite(amount) && amount > 0 ? amount : null; }
function safeFileName(file: File, index: number) {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  return `${index + 1}-${crypto.randomUUID()}.${extension}`;
}
function publicUrl(baseUrl: string, path: string) { return `${baseUrl}/storage/v1/object/public/listing-images/${path.split("/").map(encodeURIComponent).join("/")}`; }

export async function GET() {
  const runtime = config();
  if (!runtime) return Response.json({ error: "A conexão com o catálogo ainda não está configurada." }, { status: 503 });
  const fields = "id,title,description,category,brand,size,item_condition,sale_mode,price,starting_bid,auction_ends_at,image_urls,created_at";
  const response = await fetch(`${runtime.baseUrl}/rest/v1/listings?select=${fields}&status=eq.published&order=created_at.desc`, { headers: authHeaders(runtime.apiKey), cache: "no-store" });
  if (!response.ok) return Response.json({ error: "Não foi possível carregar os anúncios." }, { status: response.status });
  return Response.json({ listings: await response.json() });
}

export async function POST(request: Request) {
  const runtime = config();
  if (!runtime) return Response.json({ error: "A conexão com o catálogo ainda não está configurada." }, { status: 503 });
  const user = await userFor(request, runtime);
  if (!user) return Response.json({ error: "Sua sessão expirou. Entre novamente para publicar." }, { status: 401 });
  try {
    const form = await request.formData();
    const title = text(form, "title", 120); const description = text(form, "description", 1000); const category = text(form, "category", 100); const brand = text(form, "brand", 100); const size = text(form, "size", 30); const condition = text(form, "condition", 40); const mode = text(form, "mode", 10);
    const photos = form.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
    const documents = form.getAll("documents").filter((item): item is File => item instanceof File && item.size > 0);
    const isLuxury = category === "Peças de luxo";
    if (title.length < 3 || description.length < 10 || !category || !condition) return Response.json({ error: "Confira os detalhes obrigatórios do anúncio." }, { status: 400 });
    if (!photos.length || photos.length > 5) return Response.json({ error: "Adicione de 1 a 5 fotos." }, { status: 400 });
    if (photos.some(file => file.size > 10 * 1024 * 1024 || !["image/jpeg","image/png","image/webp"].includes(file.type))) return Response.json({ error: "Use fotos JPG, PNG ou WEBP com até 10 MB." }, { status: 400 });
    if (isLuxury && !documents.length) return Response.json({ error: "Peças de luxo precisam de documentação." }, { status: 400 });
    if (documents.some(file => file.size > 10 * 1024 * 1024 || !["application/pdf","image/jpeg","image/png"].includes(file.type))) return Response.json({ error: "Use documentos PDF, JPG ou PNG com até 10 MB." }, { status: 400 });
    const listingId = crypto.randomUUID(); const uploaded: Array<{bucket:string;path:string}> = []; const imageUrls: string[] = [];
    for (const [index,file] of photos.entries()) {
      const path = `${user.id}/${listingId}/${safeFileName(file,index)}`;
      const upload = await fetch(`${runtime.baseUrl}/storage/v1/object/listing-images/${path}`, { method:"POST", headers:authHeaders(runtime.apiKey,user.token,{"content-type":file.type,"x-upsert":"false"}), body:file });
      if (!upload.ok) throw new Error("PHOTO_UPLOAD"); uploaded.push({bucket:"listing-images",path}); imageUrls.push(publicUrl(runtime.baseUrl,path));
    }
    for (const [index,file] of documents.entries()) {
      const path = `${user.id}/${listingId}/${safeFileName(file,index)}`;
      const upload = await fetch(`${runtime.baseUrl}/storage/v1/object/luxury-documents/${path}`, { method:"POST", headers:authHeaders(runtime.apiKey,user.token,{"content-type":file.type,"x-upsert":"false"}), body:file });
      if (!upload.ok) throw new Error("DOCUMENT_UPLOAD"); uploaded.push({bucket:"luxury-documents",path});
    }
    const fixedPrice = money(text(form,"price",30)); const startingBid = money(text(form,"startingBid",30)); const durationHours = Number(text(form,"durationHours",4));
    const record = { id:listingId, seller_id:user.id, title, description, category:category === "Outro" ? text(form,"otherCategory",100) : category, other_category:category === "Outro" ? text(form,"otherCategory",100) : null, brand:brand||null, size:size||null, item_condition:condition, sale_mode:mode, price:mode === "fixed" ? fixedPrice : null, starting_bid:mode === "auction" ? startingBid : null, auction_ends_at:mode === "auction" ? new Date(Date.now()+durationHours*3600000).toISOString() : null, image_urls:imageUrls, is_luxury:isLuxury, luxury_document_count:documents.length, status:"published" };
    const save = await fetch(`${runtime.baseUrl}/rest/v1/listings`, { method:"POST", headers:authHeaders(runtime.apiKey,user.token,{"content-type":"application/json",Prefer:"return=representation"}), body:JSON.stringify(record) });
    if (!save.ok) { const detail = await save.text(); console.error("Listing insert failed", detail); throw new Error("LISTING_SAVE"); }
    const rows = await save.json() as Array<{id:string}>;
    return Response.json({ listing: rows[0] }, { status:201 });
  } catch (error) {
    console.error("Listing publication failed", error);
    return Response.json({ error: "Não foi possível publicar agora. Seus dados continuam na tela para tentar novamente." }, { status:500 });
  }
}
