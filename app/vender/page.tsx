"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  FileCheck2,
  Gavel,
  ImagePlus,
  Leaf,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Tag,
  Upload,
  X,
} from "lucide-react";

type SaleMode = "fixed" | "auction";

const steps = ["Fotos", "Detalhes", "Venda", "Revisão"];

export default function SellPage() {
  const [step, setStep] = useState(1);
  const [published, setPublished] = useState(false);
  const [photos, setPhotos] = useState<Array<{ file: File; url: string }>>([]);
  const [mode, setMode] = useState<SaleMode>("fixed");
  const [title, setTitle] = useState("Vestido midi de linho");
  const [category, setCategory] = useState("Vestidos");
  const [otherCategory, setOtherCategory] = useState("");
  const [luxuryDocuments, setLuxuryDocuments] = useState<File[]>([]);
  const [brand, setBrand] = useState("Amissima");
  const [size, setSize] = useState("M");
  const [dimensions, setDimensions] = useState("");
  const [color, setColor] = useState("Terracota");
  const [condition, setCondition] = useState("Excelente");
  const [description, setDescription] = useState("Vestido usado apenas duas vezes, sem manchas, rasgos ou ajustes.");
  const [price, setPrice] = useState("189,00");
  const [startingBid, setStartingBid] = useState("80,00");
  const [duration, setDuration] = useState("24 horas");
  const [sellerPolicyAccepted, setSellerPolicyAccepted] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 5 - photos.length);
    setPhotos(current => [...current, ...files.map(file => ({ file, url: URL.createObjectURL(file) }))]);
    event.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos(current => { URL.revokeObjectURL(current[index].url); return current.filter((_, photoIndex) => photoIndex !== index); });
  }

  function addLuxuryDocuments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 5 - luxuryDocuments.length);
    setLuxuryDocuments(current => [...current, ...files]);
    event.target.value = "";
  }

  function removeLuxuryDocument(index: number) {
    setLuxuryDocuments(current => current.filter((_, documentIndex) => documentIndex !== index));
  }

  function next(event: FormEvent) {
    event.preventDefault();
    setStep(current => Math.min(4, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previous() {
    setStep(current => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function publish() {
    setPublishError("");
    if (!photos.length) { setPublishError("Adicione pelo menos uma foto antes de publicar."); setStep(1); return; }
    if (category === "Peças de luxo" && !luxuryDocuments.length) { setPublishError("Anexe a documentação obrigatória da peça de luxo."); setStep(2); return; }
    setPublishing(true);
    const form = new FormData();
    form.set("title", title); form.set("category", category); form.set("otherCategory", otherCategory); form.set("brand", brand); form.set("size", size); form.set("dimensions", dimensions); form.set("color", color); form.set("condition", condition); form.set("description", description); form.set("mode", mode); form.set("price", price); form.set("startingBid", startingBid);
    form.set("durationHours", duration === "1 hora" ? "1" : duration === "6 horas" ? "6" : duration === "3 dias" ? "72" : "24");
    photos.forEach(photo => form.append("photos", photo.file)); luxuryDocuments.forEach(document => form.append("documents", document));
    try {
      const response = await fetch("/api/listings", { method: "POST", body: form });
      const result = await response.json() as { error?: string };
      if (response.status === 401) { window.location.href = "/entrar"; return; }
      if (!response.ok) throw new Error(result.error || "Não foi possível publicar o anúncio.");
      setPublished(true);
    } catch (error) { setPublishError(error instanceof Error ? error.message : "Não foi possível publicar o anúncio."); }
    finally { setPublishing(false); }
  }

  const usesDimensions = ["Objetos e decoração", "Casa, mesa e banho", "Móveis", "Antiguidades e colecionáveis", "Livros", "Arte e artesanato", "Outro"].includes(category);
  const numericPrice = Number(price.replace(/\./g, "").replace(",", "."));
  const sellerReceives = Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice * 0.9 : 0;
  const sellerReceivesLabel = sellerReceives.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (published) {
    return (
      <main className="sell-success-page">
        <a className="sell-brand" href="/"><Leaf /> ViraVeste</a>
        <section className="sell-success">
          <span><Check /></span>
          <p className="eyebrow">Tudo certo</p>
          <h1>Seu anúncio está pronto!</h1>
          <p>O anúncio foi salvo com segurança e já pode aparecer no catálogo do ViraVeste.</p>
          <div>
            <a className="success-primary" href="/">Voltar para a vitrine</a>
            <button onClick={() => { setPublished(false); setStep(1); }}>Criar outro anúncio</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="sell-page">
      <header className="sell-header">
        <a className="sell-brand" href="/"><Leaf /> ViraVeste</a>
        <a className="sell-exit" href="/"><X /> Sair</a>
      </header>

      <div className="sell-shell">
        <aside className="sell-sidebar">
          <p className="eyebrow">Novo anúncio</p>
          <h1>Coloque uma peça em movimento.</h1>
          <ol>
            {steps.map((label, index) => {
              const number = index + 1;
              return <li className={number === step ? "active" : number < step ? "done" : ""} key={label}>
                <span>{number < step ? <Check /> : number}</span>
                <div><strong>{label}</strong><small>{number < step ? "Concluído" : number === step ? "Preenchendo agora" : "Próxima etapa"}</small></div>
              </li>;
            })}
          </ol>
          <div className="sell-tip"><Sparkles /><p><strong>Uma boa foto vende melhor.</strong> Use luz natural e mostre qualquer sinal de uso.</p></div>
        </aside>

        <section className="sell-workspace">
          <div className="sell-progress"><span style={{ width: `${step * 25}%` }} /></div>

          {step === 1 && <form onSubmit={next} className="sell-step">
            <div className="step-heading"><p>Etapa 1 de 4</p><h2>Adicione as fotos da peça</h2><span>Você pode incluir até 5 fotos. A primeira será a capa do anúncio.</span></div>
            <div className="photo-uploader">
              {photos.map((photo, index) => <figure key={photo.url} className="uploaded-photo">
                <img src={photo.url} alt={`Foto ${index + 1} da peça`} />
                {index === 0 && <figcaption>Capa</figcaption>}
                <button type="button" onClick={() => removePhoto(index)} aria-label={`Remover foto ${index + 1}`}><X /></button>
              </figure>)}
              {photos.length < 5 && <label className="upload-slot">
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} />
                <ImagePlus /><strong>Adicionar fotos</strong><small>JPG, PNG ou WEBP</small>
              </label>}
            </div>
            <div className="photo-guidance">
              <div><Camera /><span><strong>Mostre a peça inteira</strong><small>Fotografe frente, costas e detalhes.</small></span></div>
              <div><ShieldCheck /><span><strong>Seja transparente</strong><small>Inclua marcas de uso e pequenos defeitos.</small></span></div>
            </div>
            <nav className="sell-navigation"><a href="/"><ArrowLeft /> Cancelar</a><button type="submit">Continuar <ArrowRight /></button></nav>
          </form>}

          {step === 2 && <form onSubmit={next} className="sell-step">
            <div className="step-heading"><p>Etapa 2 de 4</p><h2>Conte os detalhes da peça</h2><span>Informações claras ajudam quem está comprando a decidir com segurança.</span></div>
            <div className="sell-fields">
              <label className="field-wide"><span>Título do anúncio</span><input required value={title} onChange={event => setTitle(event.target.value)} /></label>
              <label><span>Categoria</span><select value={category} onChange={event => setCategory(event.target.value)}><optgroup label="Moda"><option>Vestidos</option><option>Blusas</option><option>Calças</option><option>Casacos</option><option>Bolsas</option><option>Calçados</option><option>Acessórios</option><option>Peças de luxo</option></optgroup><optgroup label="Casa e objetos"><option>Objetos e decoração</option><option>Casa, mesa e banho</option><option>Móveis</option></optgroup><optgroup label="Especiais"><option>Antiguidades e colecionáveis</option><option>Livros</option><option>Arte e artesanato</option><option>Outro</option></optgroup></select></label>
              {category === "Outro" && <label><span>Qual categoria?</span><input required value={otherCategory} onChange={event => setOtherCategory(event.target.value)} placeholder="Escreva a categoria" /></label>}
              <label><span>Marca</span><input required value={brand} onChange={event => setBrand(event.target.value)} /></label>
              {usesDimensions ? <label><span>Dimensões</span><input required value={dimensions} onChange={event => setDimensions(event.target.value)} placeholder="Ex.: 30 × 20 × 12 cm" /></label> : <label><span>Tamanho</span><select value={size} onChange={event => setSize(event.target.value)}><option>PP</option><option>P</option><option>M</option><option>G</option><option>GG</option><option>Único</option></select></label>}
              <label><span>Cor predominante</span><input required value={color} onChange={event => setColor(event.target.value)} placeholder="Ex.: terracota" /></label>
              <label><span>Estado de conservação</span><select value={condition} onChange={event => setCondition(event.target.value)}><option>Novo com etiqueta</option><option>Como novo</option><option>Excelente</option><option>Bom estado</option></select></label>
              <label className="field-wide"><span>Descrição</span><textarea required rows={5} value={description} onChange={event => setDescription(event.target.value)} /><small>{description.length}/500 caracteres</small></label>
              {category === "Peças de luxo" && <section className="luxury-documents field-wide">
                <div className="luxury-doc-heading"><FileCheck2 /><span><strong>Documentação obrigatória</strong><small>Anexe nota fiscal, certificado de autenticidade ou outro comprovante de procedência.</small></span></div>
                <label className="document-upload"><Upload /><span><strong>Anexar documentação</strong><small>PDF, JPG ou PNG · até 5 arquivos</small></span><input required={luxuryDocuments.length === 0} type="file" accept=".pdf,image/jpeg,image/png" multiple onChange={addLuxuryDocuments} /></label>
                {luxuryDocuments.length > 0 && <ul>{luxuryDocuments.map((document, index) => <li key={`${document.name}-${index}`}><FileCheck2 /><span>{document.name}</span><button type="button" onClick={() => removeLuxuryDocument(index)} aria-label={`Remover ${document.name}`}><X /></button></li>)}</ul>}
                <p><LockKeyhole /> Os documentos serão usados somente para análise de autenticidade e não ficarão visíveis publicamente.</p>
              </section>}
            </div>
            <nav className="sell-navigation"><button type="button" className="back" onClick={previous}><ArrowLeft /> Voltar</button><button type="submit">Continuar <ArrowRight /></button></nav>
          </form>}

          {step === 3 && <form onSubmit={next} className="sell-step">
            <div className="step-heading"><p>Etapa 3 de 4</p><h2>Como você quer vender?</h2><span>Escolha uma modalidade para este anúncio. Ela poderá ser alterada antes da primeira compra ou lance.</span></div>
            <div className="mode-options">
              <button type="button" className={mode === "fixed" ? "selected" : ""} onClick={() => setMode("fixed")}>
                <span className="mode-icon"><Tag /></span><div><strong>Preço fixo</strong><small>A pessoa compra pelo valor definido ou envia uma proposta.</small></div><i>{mode === "fixed" && <Check />}</i>
              </button>
              <button type="button" className={mode === "auction" ? "selected" : ""} onClick={() => setMode("auction")}>
                <span className="mode-icon auction"><Gavel /></span><div><strong>Leilão</strong><small>Os compradores disputam a peça por lances durante um período.</small></div><i>{mode === "auction" && <Check />}</i>
              </button>
            </div>
            {mode === "fixed" ? <div className="pricing-card">
              <label><span>Preço da peça</span><div className="money-input"><b>R$</b><input required value={price} onChange={event => setPrice(event.target.value)} inputMode="decimal" /></div></label>
              <div className="price-summary"><span>Você receberá</span><strong>{sellerReceivesLabel}</strong><small>Estimativa após a tarifa de venda de 10%.</small></div>
            </div> : <div className="pricing-card auction-card">
              <label><span>Lance inicial</span><div className="money-input"><b>R$</b><input required value={startingBid} onChange={event => setStartingBid(event.target.value)} inputMode="decimal" /></div></label>
              <label><span>Duração do leilão</span><select value={duration} onChange={event => setDuration(event.target.value)}><option>1 hora</option><option>6 horas</option><option>24 horas</option><option>3 dias</option></select></label>
              <p><Clock3 /> O leilão começará quando você confirmar a publicação.</p>
            </div>}
            <nav className="sell-navigation"><button type="button" className="back" onClick={previous}><ArrowLeft /> Voltar</button><button type="submit">Revisar anúncio <ArrowRight /></button></nav>
          </form>}

          {step === 4 && <section className="sell-step">
            <div className="step-heading"><p>Etapa 4 de 4</p><h2>Revise antes de publicar</h2><span>Confira os dados e volte a qualquer etapa se precisar corrigir algo.</span></div>
            <div className="review-card">
              <div className="review-photo">{photos[0] ? <img src={photos[0].url} alt="Capa escolhida para o anúncio" /> : <span><ImagePlus /><small>Sem foto</small></span>}</div>
              <div className="review-copy"><span className="review-mode">{mode === "fixed" ? <><Tag /> Preço fixo</> : <><Gavel /> Leilão</>}</span><h3>{title}</h3><p>{category === "Outro" ? otherCategory || "Outro" : category} · {brand} · {usesDimensions ? dimensions || "Dimensões não informadas" : `Tamanho ${size}`} · {color} · {condition}</p><strong>{mode === "fixed" ? `R$ ${price}` : `Lance inicial: R$ ${startingBid}`}</strong>{mode === "auction" && <small>Duração: {duration}</small>}</div>
              <button onClick={() => setStep(2)}>Editar <ChevronRight /></button>
            </div>
            {category === "Peças de luxo" && <div className="luxury-review"><FileCheck2 /><span><strong>Documentação anexada</strong><small>{luxuryDocuments.length} {luxuryDocuments.length === 1 ? "arquivo enviado" : "arquivos enviados"} para verificação de autenticidade.</small></span></div>}
            <div className="review-details"><div><PackageCheck /><span><strong>Envio após a venda</strong><small>Você receberá uma etiqueta e as instruções de postagem.</small></span></div><div><ShieldCheck /><span><strong>Pagamento protegido</strong><small>O valor é liberado após a confirmação do recebimento.</small></span></div></div>
            <label className="sell-agreement"><input type="checkbox" checked={sellerPolicyAccepted} onChange={event => setSellerPolicyAccepted(event.target.checked)} /><span>{category === "Peças de luxo" ? "Declaro que as informações e os documentos enviados são autênticos, que a peça está disponível e que aceito a Política de Anúncios e Vendas." : "Declaro que as informações são verdadeiras, que a peça está disponível e que aceito a Política de Anúncios e Vendas."} <a href="/politicas#vendas">Ler política</a></span></label>
            {publishError && <p className="sell-publish-error">{publishError}</p>}
            <nav className="sell-navigation"><button type="button" className="back" onClick={previous}><ArrowLeft /> Voltar</button><button type="button" disabled={!sellerPolicyAccepted || publishing} onClick={publish}>{publishing ? "Publicando..." : "Publicar anúncio"} <Check /></button></nav>
          </section>}
        </section>
      </div>
    </main>
  );
}
