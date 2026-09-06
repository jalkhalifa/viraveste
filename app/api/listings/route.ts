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

export async function GET(request: Request) {
  const runtime = config();
  if (!runtime) return Response.json({ error: "A conexão com o catálogo ainda não está configurada." }, { status: 503 });
  const requestUrl = new URL(request.url); const mine = requestUrl.searchParams.get("mine") === "1"; const listingId = requestUrl.searchParams.get("id");
  const user = mine ? await userFor(request, runtime) : null;
  if (mine && !user) return Response.json({ error: "Sua sessão expirou." }, { status: 401 });
  const fields = "id,title,description,category,brand,size,dimensions,color,item_condition,sale_mode,price,starting_bid,auction_ends_at,image_urls,luxury_document_count,status,created_at";
  if (listingId && !/^[0-9a-f-]{36}$/i.test(listingId)) return Response.json({ error: "Anúncio inválido." }, { status: 400 });
  const filter = mine ? `seller_id=eq.${user!.id}${listingId?`&id=eq.${encodeURIComponent(listingId)}`:""}` : listingId ? `id=eq.${encodeURIComponent(listingId)}&status=eq.published` : "status=eq.published";
  const response = await fetch(`${runtime.baseUrl}/rest/v1/listings?select=${fields}&${filter}&order=created_at.desc`, { headers: authHeaders(runtime.apiKey, user?.token), cache: "no-store" });
  if (!response.ok) return Response.json({ error: "Não foi possível carregar os anúncios." }, { status: response.status });
  const rows = await response.json() as unknown[];
  if (listingId) return rows.length ? Response.json({ listing: rows[0] }) : Response.json({ error: "Anúncio não encontrado ou indisponível." }, { status: 404 });
  return Response.json({ listings: rows });
}

export async function PATCH(request: Request) {
  const runtime = config(); if (!runtime) return Response.json({ error: "Conexão não configurada." }, { status: 503 });
  const user = await userFor(request, runtime); if (!user) return Response.json({ error: "Sua sessão expirou." }, { status: 401 });
  const body = await request.json() as { id?: string; status?: string }; const id = String(body.id ?? ""); const status = String(body.status ?? "");
  if (!id || !["published","paused"].includes(status)) return Response.json({ error: "Alteração inválida." }, { status: 400 });
  const response = await fetch(`${runtime.baseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(id)}&seller_id=eq.${user.id}`, { method:"PATCH", headers:authHeaders(runtime.apiKey,user.token,{"content-type":"application/json",Prefer:"return=representation"}), body:JSON.stringify({status}) });
  if (!response.ok) return Response.json({ error: "Não foi possível alterar o anúncio." }, { status: response.status });
  const rows = await response.json() as unknown[]; if (!rows.length) return Response.json({ error: "Anúncio não encontrado." }, { status: 404 });
  return Response.json({ listing: rows[0] });
}

export async function DELETE(request: Request) {
  const runtime = config(); if (!runtime) return Response.json({ error: "Conexão não configurada." }, { status: 503 });
  const user = await userFor(request, runtime); if (!user) return Response.json({ error: "Sua sessão expirou." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id") ?? ""; if (!id) return Response.json({ error: "Anúncio não informado." }, { status: 400 });
  const response = await fetch(`${runtime.baseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(id)}&seller_id=eq.${user.id}`, { method:"DELETE", headers:authHeaders(runtime.apiKey,user.token,{Prefer:"return=representation"}) });
  if (!response.ok) return Response.json({ error: "Não foi possível excluir o anúncio." }, { status: response.status });
  const rows = await response.json() as unknown[]; if (!rows.length) return Response.json({ error: "Anúncio não encontrado." }, { status: 404 });
  return Response.json({ success:true });
}

export async function PUT(request: Request) {
  const runtime = config(); if (!runtime) return Response.json({ error: "Conexão não configurada." }, { status: 503 });
  const user = await userFor(request, runtime); if (!user) return Response.json({ error: "Sua sessão expirou." }, { status: 401 });
  try {
    const form = await request.formData(); const id = text(form,"id",36);
    if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error:"Anúncio inválido." }, { status:400 });
    const currentResponse = await fetch(`${runtime.baseUrl}/rest/v1/listings?select=id,status,image_urls,luxury_document_count&id=eq.${encodeURIComponent(id)}&seller_id=eq.${user.id}`, { headers:authHeaders(runtime.apiKey,user.token), cache:"no-store" });
    const currentRows = currentResponse.ok ? await currentResponse.json() as Array<{status:string;image_urls:string[];luxury_document_count:number}> : [];
    const current = currentRows[0]; if (!current) return Response.json({ error:"Anúncio não encontrado." }, { status:404 });
    if (!["published","paused","draft"].includes(current.status)) return Response.json({ error:"Este anúncio não pode mais ser editado." }, { status:409 });
    const title=text(form,"title",120),description=text(form,"description",1000),category=text(form,"category",100),otherCategory=text(form,"otherCategory",100),brand=text(form,"brand",100),size=text(form,"size",30),dimensions=text(form,"dimensions",100),color=text(form,"color",60),condition=text(form,"condition",40),mode=text(form,"mode",10);
    const usesDimensions=["Objetos e decoração","Casa, mesa e banho","Móveis","Antiguidades e colecionáveis","Livros","Arte e artesanato","Outro"].includes(category); const isLuxury=category==="Peças de luxo";
    const fixedPrice=money(text(form,"price",30)),startingBid=money(text(form,"startingBid",30)),durationHours=Number(text(form,"durationHours",4));
    if(title.length<3||description.length<10||!category||!condition||!color||(usesDimensions&&!dimensions))return Response.json({error:"Confira os campos obrigatórios."},{status:400});
    if((mode==="fixed"&&!fixedPrice)||(mode==="auction"&&(!startingBid||!durationHours)))return Response.json({error:"Informe um valor válido."},{status:400});
    const photos=form.getAll("photos").filter((item):item is File=>item instanceof File&&item.size>0); const documents=form.getAll("documents").filter((item):item is File=>item instanceof File&&item.size>0);
    if(photos.length>5||photos.some(file=>file.size>10*1024*1024||!["image/jpeg","image/png","image/webp"].includes(file.type)))return Response.json({error:"Use até 5 fotos JPG, PNG ou WEBP com 10 MB cada."},{status:400});
    if(isLuxury&&!current.luxury_document_count&&!documents.length)return Response.json({error:"Peças de luxo precisam de documentação."},{status:400});
    if(documents.some(file=>file.size>10*1024*1024||!["application/pdf","image/jpeg","image/png"].includes(file.type)))return Response.json({error:"Use documentos PDF, JPG ou PNG com até 10 MB."},{status:400});
    let imageUrls=current.image_urls;
    if(photos.length){imageUrls=[];for(const [index,file] of photos.entries()){const path=`${user.id}/${id}/${safeFileName(file,index)}`;const upload=await fetch(`${runtime.baseUrl}/storage/v1/object/listing-images/${path}`,{method:"POST",headers:authHeaders(runtime.apiKey,user.token,{"content-type":file.type,"x-upsert":"false"}),body:file});if(!upload.ok)throw new Error("PHOTO_UPLOAD");imageUrls.push(publicUrl(runtime.baseUrl,path));}}
    for(const [index,file] of documents.entries()){const path=`${user.id}/${id}/${safeFileName(file,index)}`;const upload=await fetch(`${runtime.baseUrl}/storage/v1/object/luxury-documents/${path}`,{method:"POST",headers:authHeaders(runtime.apiKey,user.token,{"content-type":file.type,"x-upsert":"false"}),body:file});if(!upload.ok)throw new Error("DOCUMENT_UPLOAD");}
    const record={title,description,category:category==="Outro"?otherCategory:category,other_category:category==="Outro"?otherCategory:null,brand:brand||null,size:usesDimensions?null:size||null,dimensions:usesDimensions?dimensions:null,color,item_condition:condition,sale_mode:mode,price:mode==="fixed"?fixedPrice:null,starting_bid:mode==="auction"?startingBid:null,auction_ends_at:mode==="auction"?new Date(Date.now()+durationHours*3600000).toISOString():null,image_urls:imageUrls,is_luxury:isLuxury,luxury_document_count:Number(current.luxury_document_count||0)+documents.length};
    const save=await fetch(`${runtime.baseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(id)}&seller_id=eq.${user.id}`,{method:"PATCH",headers:authHeaders(runtime.apiKey,user.token,{"content-type":"application/json",Prefer:"return=representation"}),body:JSON.stringify(record)});if(!save.ok)throw new Error("LISTING_UPDATE");const rows=await save.json() as unknown[];return Response.json({listing:rows[0]});
  } catch(error){console.error("Listing update failed",error);return Response.json({error:"Não foi possível salvar as alterações agora."},{status:500});}
}

export async function POST(request: Request) {
  const runtime = config();
  if (!runtime) return Response.json({ error: "A conexão com o catálogo ainda não está configurada." }, { status: 503 });
  const user = await userFor(request, runtime);
  if (!user) return Response.json({ error: "Sua sessão expirou. Entre novamente para publicar." }, { status: 401 });
  try {
    const form = await request.formData();
    const title = text(form, "title", 120); const description = text(form, "description", 1000); const category = text(form, "category", 100); const brand = text(form, "brand", 100); const size = text(form, "size", 30); const dimensions = text(form, "dimensions", 100); const color = text(form, "color", 60); const condition = text(form, "condition", 40); const mode = text(form, "mode", 10);
    const photos = form.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
    const documents = form.getAll("documents").filter((item): item is File => item instanceof File && item.size > 0);
    const isLuxury = category === "Peças de luxo";
    const usesDimensions = ["Objetos e decoração","Casa, mesa e banho","Móveis","Antiguidades e colecionáveis","Livros","Arte e artesanato","Outro"].includes(category);
    const fixedPrice = money(text(form,"price",30)); const startingBid = money(text(form,"startingBid",30)); const durationHours = Number(text(form,"durationHours",4));
    if (title.length < 3 || description.length < 10 || !category || !condition || !color) return Response.json({ error: "Confira os detalhes obrigatórios do anúncio." }, { status: 400 });
    if (usesDimensions && !dimensions) return Response.json({ error: "Informe as dimensões do objeto." }, { status: 400 });
    if ((mode === "fixed" && !fixedPrice) || (mode === "auction" && (!startingBid || !durationHours))) return Response.json({ error: "Informe um valor válido para a venda." }, { status: 400 });
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
    const record = { id:listingId, seller_id:user.id, title, description, category:category === "Outro" ? text(form,"otherCategory",100) : category, other_category:category === "Outro" ? text(form,"otherCategory",100) : null, brand:brand||null, size:usesDimensions?null:size||null, dimensions:usesDimensions?dimensions:null, color, item_condition:condition, sale_mode:mode, price:mode === "fixed" ? fixedPrice : null, starting_bid:mode === "auction" ? startingBid : null, auction_ends_at:mode === "auction" ? new Date(Date.now()+durationHours*3600000).toISOString() : null, image_urls:imageUrls, is_luxury:isLuxury, luxury_document_count:documents.length, status:"published" };
    const save = await fetch(`${runtime.baseUrl}/rest/v1/listings`, { method:"POST", headers:authHeaders(runtime.apiKey,user.token,{"content-type":"application/json",Prefer:"return=representation"}), body:JSON.stringify(record) });
    if (!save.ok) { const detail = await save.text(); console.error("Listing insert failed", detail); throw new Error("LISTING_SAVE"); }
    const rows = await save.json() as Array<{id:string}>;
    return Response.json({ listing: rows[0] }, { status:201 });
  } catch (error) {
    console.error("Listing publication failed", error);
    return Response.json({ error: "Não foi possível publicar agora. Seus dados continuam na tela para tentar novamente." }, { status:500 });
  }
}
