"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, Gavel, Heart, Leaf, MessageCircle, ShieldCheck, Star, Users } from "lucide-react";

const initialBids = [
  { name: "Marina L.", value: 286, time: "agora", avatar: "MA" },
  { name: "Bia M.", value: 278, time: "há 20s", avatar: "BI" },
  { name: "Marina L.", value: 270, time: "há 41s", avatar: "MA" },
  { name: "Luiza F.", value: 262, time: "há 1min", avatar: "LU" },
];

export default function AuctionRoomPage() {
  const [bid, setBid] = useState(286);
  const [bids, setBids] = useState(initialBids);
  const [notice, setNotice] = useState("");
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const placeBid = () => {
    const next = bid + 8;
    setBid(next);
    setBids([{ name: "Você", value: next, time: "agora", avatar: "VC" }, ...bids.map((item, index) => index === 0 ? { ...item, time: "há poucos segundos" } : item)]);
    setNotice("Seu lance está na liderança!");
  };

  return <main className="auction-room-page">
    <header className="auction-room-header"><a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a><a href="/leiloes"><ArrowLeft /> Voltar aos leilões</a><span className="room-live">● AO VIVO</span></header>
    <div className="auction-room">
      <section className="auction-stage">
        <div className="auction-stage-photo"><img src="/images/bolsa-sapato.png" alt="Bolsa vintage em couro" /><span className="room-live">● AO VIVO</span><button aria-label="Favoritar leilão"><Heart /></button><div className="viewer-count"><Users /> 128 assistindo</div></div>
        <div className="auction-host"><span>CA</span><div><strong>Camila R. <CheckCircle2 /></strong><small>Rio Verde, GO · 4,9 <Star /></small></div><button><MessageCircle /> Conversar</button></div>
        <div className="auction-description"><p className="eyebrow">Lote 3 de 8</p><h1>Bolsa vintage em couro</h1><p>Couro legítimo oliva, ferragens douradas e forro íntegro. Pequenas marcas naturais de uso, mostradas nas fotos.</p><div><span>Condição<strong>Muito boa</strong></span><span>Marca<strong>Vintage</strong></span><span>Procedência<strong>Verificada</strong></span></div></div>
      </section>

      <aside className="bidding-panel">
        <div className="bid-clock"><span><Clock3 /> Termina em</span><strong>08:42</strong><small>O cronômetro aumenta se houver lance nos últimos segundos.</small></div>
        <div className="current-bid"><span>Lance atual</span><strong>R$ {bid}</strong><small>{bids.length + 14} lances</small></div>
        {notice && <div className="bid-notice"><CheckCircle2 /> {notice}<a href="/checkout">Ver checkout demonstrativo</a></div>}
        <label className="auction-rules-check"><input type="checkbox" checked={rulesAccepted} onChange={event => setRulesAccepted(event.target.checked)} /><span>Li e aceito as <a href="/politicas#leiloes">Regras dos leilões</a>. Entendo que o lance representa compromisso de compra se eu vencer.</span></label>
        <button className="place-bid" disabled={!rulesAccepted} onClick={placeBid}><Gavel /> Dar lance de R$ {bid + 8}</button>
        <p className="bid-agreement">Sem multa pelo exercício regular do direito de arrependimento. Não pagamento abusivo pode suspender a participação em leilões.</p>
        <div className="bid-history"><div><h2>Últimos lances</h2><span>Atualiza ao vivo</span></div><ol>{bids.slice(0, 5).map((item, index) => <li className={item.name === "Você" ? "my-bid" : ""} key={`${item.name}-${item.value}`}><span>{item.avatar}</span><p><strong>{item.name}</strong><small>{item.time}</small></p><b>R$ {item.value}</b>{index === 0 && <i>Líder</i>}</li>)}</ol></div>
        <div className="room-protection"><ShieldCheck /><span><strong>Compra protegida</strong><small>Pagamento seguro e liberação após o recebimento.</small></span><a href="/perfil/carteira">Minha carteira</a></div>
      </aside>
    </div>
  </main>;
}
