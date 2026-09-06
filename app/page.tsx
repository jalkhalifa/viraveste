import { Bell, ChevronDown, Heart, Home, Leaf, Menu, MessageCircle, Plus, Search, ShieldCheck, Tag, UserRound } from "lucide-react";

const closets=[
 {name:"Camila",initials:"CA",tone:"#f05a47",pieces:"12 peças"},
 {name:"Marina",initials:"MA",tone:"#4d7c6b",pieces:"8 peças"},
 {name:"Luiza",initials:"LU",tone:"#d9a928",pieces:"Novo armário"},
 {name:"Ana Clara",initials:"AC",tone:"#294c73",pieces:"15 peças"},
 {name:"Beatriz",initials:"BE",tone:"#a94d65",pieces:"6 peças"},
 {name:"Sofia",initials:"SO",tone:"#2d7d79",pieces:"Novo armário"},
];
const products=[
 {seller:"Camila R.",city:"Rio Verde, GO",avatar:"CA",tone:"#f05a47",name:"Vestido midi de linho",brand:"Amissima",size:"M",state:"Excelente",price:"R$ 189",likes:24,image:"/images/vestido-terracota.png"},
 {seller:"Marina Lopes",city:"Goiânia, GO",avatar:"MA",tone:"#4d7c6b",name:"Bolsa hobo oliva",brand:"Couro & Co.",size:"Único",state:"Como nova",price:"R$ 245",likes:41,image:"/images/bolsa-sapato.png"},
 {seller:"Luiza Freitas",city:"Brasília, DF",avatar:"LU",tone:"#d9a928",name:"Slingback em couro areia",brand:"Arezzo",size:"37",state:"Bom estado",price:"R$ 159",likes:18,image:"/images/bolsa-sapato.png"},
 {seller:"Ana Clara",city:"Rio Verde, GO",avatar:"AC",tone:"#294c73",name:"Conjunto em tons naturais",brand:"Mixed",size:"P",state:"Excelente",price:"R$ 320",likes:33,image:"/images/editorial-verere.png"},
 {seller:"Beatriz M.",city:"Uberlândia, MG",avatar:"BE",tone:"#a94d65",name:"Vestido terracota",brand:"Ateliê local",size:"G",state:"Muito bom",price:"R$ 145",likes:12,image:"/images/vestido-terracota.png"},
 {seller:"Sofia Nunes",city:"São Paulo, SP",avatar:"SO",tone:"#2d7d79",name:"Bolsa oliva minimalista",brand:"Vintage",size:"Único",state:"Bom estado",price:"R$ 198",likes:29,image:"/images/bolsa-sapato.png"},
 {seller:"Camila R.",city:"Rio Verde, GO",avatar:"CA",tone:"#f05a47",name:"Colete de linho natural",brand:"Farm",size:"M",state:"Como novo",price:"R$ 129",likes:16,image:"/images/editorial-verere.png"},
 {seller:"Marina Lopes",city:"Goiânia, GO",avatar:"MA",tone:"#4d7c6b",name:"Scarpin areia clássico",brand:"Schutz",size:"36",state:"Excelente",price:"R$ 210",likes:27,image:"/images/bolsa-sapato.png"},
];
const categories=["Novidades","Roupas","Bolsas","Calçados","Acessórios","Luxo","Objetos","Casa, mesa e banho","Antiguidades","Outros"];
function Avatar({initials,tone}:{initials:string;tone:string}){return <span className="avatar" style={{background:tone}}>{initials}</span>}

export default function HomePage(){
 return <main>
  <header className="topbar"><div className="topbar-inner">
   <button className="bare mobile-only" aria-label="Abrir menu"><Menu/></button>
   <a className="brand" href="#"><span className="brand-cycle"><Leaf/></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a>
   <form className="top-search" action="/buscar" method="get"><Search/><input name="q" aria-label="Buscar" placeholder="Buscar peças, marcas ou armários"/><button type="submit" aria-label="Pesquisar">Buscar</button></form>
   <nav className="header-links"><a href="#produtos">Comprar</a><a href="/leiloes">Leilões</a><a href="#armarios">Armários</a></nav>
   <div className="top-actions"><button className="bare" aria-label="Notificações"><Bell/></button><button className="bare desktop-only" aria-label="Mensagens"><MessageCircle/></button><a className="login desktop-only" href="/entrar">Entrar</a><a className="sell desktop-only" href="/vender"><Plus/> Vender</a></div>
  </div></header>
  <nav className="category-nav" aria-label="Categorias"><div>{categories.map((c,i)=><a className={i===0?"active":""} href={`/buscar?categoria=${encodeURIComponent(c)}`} key={c}>{c}</a>)}</div></nav>

  <div className="page-shell">
   <section className="intro">
    <div className="intro-copy"><p className="eyebrow">Moda circular entre pessoas</p><h1>Seu próximo achado já teve uma história.</h1><p>Compre peças únicas, descubra novos armários e transforme o que você não usa mais em novas possibilidades.</p><div className="intro-actions"><a href="#produtos">Explorar peças</a><a className="start-selling" href="/vender"><Plus/> Começar a vender</a></div></div>
    <div className="intro-image"><img src="/images/editorial-verere.png" alt="Moda consciente em tons naturais"/><span><strong>Compra protegida</strong> em todas as peças</span></div>
   </section>

   <section className="closets" id="armarios">
    <div className="section-title"><div><p className="eyebrow">Pessoas para descobrir</p><h2>Armários em movimento</h2></div><a href="#">Ver comunidade ↗</a></div>
    <div className="closet-row">
     <button className="closet add-closet"><span><Plus/></span><div><strong>Seu armário</strong><small>Comece agora</small></div></button>
     {closets.map(c=><a className="closet" href={c.name==="Camila"?"/armario/camila":"#"} key={c.name}><Avatar initials={c.initials} tone={c.tone}/><div><strong>{c.name}</strong><small>{c.pieces}</small></div><b>Seguir</b></a>)}
    </div>
   </section>

   <section className="products" id="produtos">
    <div className="section-title product-heading"><div><p className="eyebrow">Escolhidas para você</p><h2>Descubra novas peças</h2></div><div className="view-controls"><button className="selected">Para você</button><button>Mais recentes</button><button className="sort">Filtrar <ChevronDown/></button></div></div>
    <div className="product-grid">
     {products.map((p,index)=><article className="product-card" key={p.seller+p.name}>
      <a className="product-image" href={index===0?"/produto/vestido-midi-linho":"#"}><img className={"crop crop-"+index} src={p.image} alt={p.name}/><button className="favorite" aria-label={"Favoritar "+p.name}><Heart/><span>{p.likes}</span></button><span className="condition">{p.state}</span></a>
      <div className="product-copy"><p>{p.brand} · Tam. {p.size}</p><h3>{p.name}</h3><strong>{p.price}</strong></div>
      <div className="seller-line"><Avatar initials={p.avatar} tone={p.tone}/><div><strong>{p.seller}</strong><span>{p.city}</span></div><button aria-label="Conversar"><MessageCircle/></button></div>
     </article>)}
    </div>
    <a className="load-more" href="/buscar">Ver mais peças</a>
   </section>

   <section className="trust" id="seguranca"><div><ShieldCheck/><span><strong>Compra protegida</strong><small>O valor só é liberado após o recebimento.</small></span></div><div><Tag/><span><strong>Anúncio gratuito</strong><small>Você paga somente quando vender.</small></span></div><a href="/politicas">Entenda como funciona →</a></section>
  </div>
  <footer><div><a className="footer-brand" href="#">ViraVeste</a><p>Seu armário em movimento.</p></div><nav><a href="/politicas">Políticas</a><a href="/politicas#devolucoes">Devoluções</a><a href="/politicas#privacidade">Privacidade</a><a href="/politicas#leiloes">Leilões</a></nav><span>© 2026 ViraVeste</span></footer>
  <nav className="mobile-tabs"><a className="active" href="#"><Home/><span>Início</span></a><a href="/buscar"><Search/><span>Buscar</span></a><a className="create" href="/vender"><i><Plus/></i><b>Vender</b></a><a href="#"><Heart/><span>Favoritos</span></a><a href="/entrar"><UserRound/><span>Entrar</span></a></nav>
 </main>
}
