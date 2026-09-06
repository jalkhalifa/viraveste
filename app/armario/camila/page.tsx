import {
  Bell,
  CheckCircle2,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Star,
  UserPlus,
} from "lucide-react";

const closetProducts = [
  { name: "Vestido midi de linho", brand: "Amissima", size: "M", price: "R$ 189", state: "Excelente", image: "/images/vestido-terracota.png", href: "/produto/vestido-midi-linho" },
  { name: "Colete de linho natural", brand: "Farm", size: "M", price: "R$ 129", state: "Como novo", image: "/images/editorial-verere.png", href: "#" },
  { name: "Bolsa hobo oliva", brand: "Couro & Co.", size: "Único", price: "R$ 245", state: "Como nova", image: "/images/bolsa-sapato.png", href: "#" },
  { name: "Conjunto em tons naturais", brand: "Mixed", size: "P", price: "R$ 320", state: "Excelente", image: "/images/editorial-verere.png", href: "#" },
  { name: "Vestido terracota", brand: "Ateliê local", size: "G", price: "R$ 145", state: "Muito bom", image: "/images/vestido-terracota.png", href: "#" },
  { name: "Slingback em couro areia", brand: "Arezzo", size: "37", price: "R$ 159", state: "Bom estado", image: "/images/bolsa-sapato.png", href: "#" },
];

export default function ClosetPage() {
  return (
    <main>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a>
          <form className="top-search"><Search /><input aria-label="Buscar" placeholder="Buscar peças, marcas ou armários" /></form>
          <nav className="header-links"><a href="/#produtos">Comprar</a><a href="/#armarios">Armários</a><a href="/#seguranca">Como funciona</a></nav>
          <div className="top-actions"><button className="bare" aria-label="Notificações"><Bell /></button><button className="bare desktop-only" aria-label="Mensagens"><MessageCircle /></button><button className="login desktop-only">Entrar</button><a className="sell desktop-only" href="/vender"><Plus /> Vender</a></div>
        </div>
      </header>

      <div className="closet-page">
        <section className="closet-profile">
          <div className="closet-cover"><img src="/images/editorial-verere.png" alt="Seleção de moda do armário de Camila" /></div>
          <div className="closet-identity">
            <span className="closet-avatar">CA</span>
            <div className="closet-name"><div><h1>Camila R.</h1><CheckCircle2 /></div><p><MapPin /> Rio Verde, GO · Na ViraVeste desde 2026</p></div>
            <div className="closet-profile-actions"><button className="follow"><UserPlus /> Seguir</button><button className="message"><MessageCircle /> Conversar</button></div>
          </div>
          <div className="closet-bio"><p>Moda leve, linho e peças que merecem viver novas histórias. Tudo bem cuidado e enviado com carinho. 🌿</p><dl><div><dt>46</dt><dd>Peças vendidas</dd></div><div><dt>312</dt><dd>Seguidores</dd></div><div><dt>4,9</dt><dd><Star /> Avaliação</dd></div></dl></div>
        </section>

        <nav className="closet-tabs"><a className="active" href="#pecas">Peças <span>12</span></a><a href="#avaliacoes">Avaliações <span>38</span></a><a href="#sobre">Sobre</a></nav>

        <div className="closet-content">
          <section className="closet-listings" id="pecas">
            <div className="closet-section-heading"><div><p className="eyebrow">Disponíveis agora</p><h2>Peças do armário</h2></div><select aria-label="Ordenar peças"><option>Mais recentes</option><option>Menor preço</option><option>Maior preço</option></select></div>
            <div className="closet-product-grid">
              {closetProducts.map((product, index) => <article className="closet-product" key={product.name}>
                <a className="closet-product-image" href={product.href}><img className={`closet-crop-${index}`} src={product.image} alt={product.name} /><span>{product.state}</span><button aria-label={`Favoritar ${product.name}`}><Heart /></button></a>
                <div><p>{product.brand} · Tam. {product.size}</p><h3>{product.name}</h3><strong>{product.price}</strong></div>
              </article>)}
            </div>
          </section>

          <aside className="closet-aside">
            <section className="closet-trust-card"><h2>Vendedora confiável</h2><ul><li><ShieldCheck /><span><strong>Identidade verificada</strong><small>Perfil confirmado pela ViraVeste.</small></span></li><li><PackageCheck /><span><strong>Envio rápido</strong><small>Normalmente posta em até 2 dias.</small></span></li><li><MessageCircle /><span><strong>Responde rápido</strong><small>Geralmente em poucas horas.</small></span></li></ul></section>
            <section className="closet-review" id="avaliacoes"><div><span>MA</span><p><strong>Marina Lopes</strong><small><Star /><Star /><Star /><Star /><Star /></small></p></div><blockquote>“A peça chegou impecável, cheirosa e exatamente como nas fotos.”</blockquote><time>Há 5 dias</time><a href="#">Ver todas as avaliações</a></section>
          </aside>
        </div>
      </div>

      <footer><div><a className="footer-brand" href="/">ViraVeste</a><p>Seu armário em movimento.</p></div><nav><a href="/politicas">Políticas</a><a href="/politicas#devolucoes">Devoluções</a><a href="/politicas#privacidade">Privacidade</a><a href="/politicas#leiloes">Leilões</a></nav><span>© 2026 ViraVeste</span></footer>
    </main>
  );
}
