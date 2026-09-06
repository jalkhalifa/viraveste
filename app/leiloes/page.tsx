import { Bell, CalendarDays, Clock3, Flame, Gavel, Heart, Leaf, MessageCircle, Plus, Search, ShieldCheck, Users } from "lucide-react";

const auctions = [
  { title: "Bolsa vintage em couro", seller: "Camila R.", city: "Rio Verde, GO", bid: "R$ 286", bids: 18, time: "08:42", image: "/images/bolsa-sapato.png", live: true, href: "/leilao/bolsa-vintage" },
  { title: "Vestido de linho terracota", seller: "Marina Lopes", city: "Goiânia, GO", bid: "R$ 152", bids: 11, time: "14:18", image: "/images/vestido-terracota.png", live: true, href: "#" },
  { title: "Seleção natural · 4 peças", seller: "Ana Clara", city: "Brasília, DF", bid: "R$ 310", bids: 7, time: "25:06", image: "/images/editorial-verere.png", live: true, href: "#" },
];

const upcoming = [
  { title: "Garimpo premium de Camila", date: "Hoje, 21h", count: "8 peças", image: "/images/editorial-verere.png" },
  { title: "Bolsas e sapatos especiais", date: "Amanhã, 19h", count: "12 peças", image: "/images/bolsa-sapato.png" },
  { title: "Linho, seda e tons quentes", date: "Sábado, 17h", count: "10 peças", image: "/images/vestido-terracota.png" },
];

export default function AuctionsPage() {
  return <main>
    <header className="topbar"><div className="topbar-inner">
      <a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a>
      <form className="top-search"><Search /><input aria-label="Buscar" placeholder="Buscar peças, marcas ou armários" /></form>
      <nav className="header-links"><a href="/#produtos">Comprar</a><a className="nav-auction" href="/leiloes">Leilões</a><a href="/#armarios">Armários</a></nav>
      <div className="top-actions"><button className="bare" aria-label="Notificações"><Bell /></button><button className="bare desktop-only" aria-label="Mensagens"><MessageCircle /></button><button className="login desktop-only">Entrar</button><a className="sell desktop-only" href="/vender"><Plus /> Vender</a></div>
    </div></header>

    <div className="auction-discovery">
      <section className="auction-hero">
        <div><p className="eyebrow"><Flame /> Disputas em tempo real</p><h1>Achados únicos.<br />O lance é seu.</h1><p>Acompanhe os leilões, converse com a comunidade e dê seu lance antes do tempo acabar.</p><a href="#agora"><Gavel /> Ver leilões ao vivo</a></div>
        <div className="hero-auction-card"><img src="/images/bolsa-sapato.png" alt="Bolsa vintage em couro em leilão" /><span className="live-pill">● AO VIVO</span><div><small>Termina em 08:42</small><strong>Bolsa vintage em couro</strong><p>Lance atual <b>R$ 286</b></p></div></div>
      </section>

      <section className="live-auctions" id="agora">
        <div className="section-title"><div><p className="eyebrow">Acontecendo agora</p><h2>Leilões ao vivo</h2></div><span className="watching"><Users /> 327 pessoas acompanhando</span></div>
        <div className="auction-grid">{auctions.map((item, index) => <article className="auction-tile" key={item.title}>
          <a className="auction-tile-image" href={item.href}><img className={`auction-image-${index}`} src={item.image} alt={item.title} /><span className="live-pill">● AO VIVO</span><span className="auction-timer"><Clock3 /> {item.time}</span><button aria-label={`Favoritar ${item.title}`}><Heart /></button></a>
          <div className="auction-tile-copy"><p>{item.seller} · {item.city}</p><h3>{item.title}</h3><div><span>Lance atual<strong>{item.bid}</strong></span><small>{item.bids} lances</small></div><a href={item.href}><Gavel /> Entrar no leilão</a></div>
        </article>)}</div>
      </section>

      <section className="upcoming-auctions">
        <div className="section-title"><div><p className="eyebrow">Programe-se</p><h2>Próximos leilões</h2></div></div>
        <div className="upcoming-grid">{upcoming.map((item, index) => <article key={item.title}><img className={`upcoming-image-${index}`} src={item.image} alt="" /><div><span><CalendarDays /> {item.date}</span><h3>{item.title}</h3><p>{item.count}</p><button>Lembrar-me</button></div></article>)}</div>
      </section>

      <section className="auction-safety"><ShieldCheck /><div><strong>Leilão protegido pela ViraVeste</strong><p>O vencedor paga pela plataforma e o valor só é liberado à pessoa vendedora após a entrega.</p></div><a href="/politicas#leiloes">Conheça as regras →</a></section>
    </div>
    <footer><div><a className="footer-brand" href="/">ViraVeste</a><p>Seu armário em movimento.</p></div><nav><a href="/politicas">Políticas</a><a href="/politicas#devolucoes">Devoluções</a><a href="/politicas#privacidade">Privacidade</a><a href="/politicas#leiloes">Leilões</a></nav><span>© 2026 ViraVeste</span></footer>
  </main>;
}
