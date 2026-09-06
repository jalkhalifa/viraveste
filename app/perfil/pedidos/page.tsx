"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronRight, CreditCard, Download, FileCheck2, Gavel, Leaf, MapPin, MessageCircle, Package, PackageCheck, Printer, RotateCcw, Settings, ShoppingBag, Truck, UserRound } from "lucide-react";

type View = "compras" | "vendas";

export default function OrdersPage() {
  const [view, setView] = useState<View>("compras");
  const [received, setReceived] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [labelReady, setLabelReady] = useState(false);
  const [posted, setPosted] = useState(false);

  return <main className="wallet-page orders-page">
    <header className="wallet-header">
      <a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a>
      <a href="/perfil"><ArrowLeft /> Voltar ao perfil</a><div><span>CA</span><strong>Camila</strong></div>
    </header>

    <div className="wallet-shell">
      <aside className="profile-menu">
        <div className="profile-menu-user"><span>CA</span><div><strong>Camila R.</strong><small>Rio Verde, GO</small></div></div>
        <nav><a href="/perfil"><UserRound /> Visão geral</a><a href="/armario/camila"><ShoppingBag /> Meu perfil público</a><a className="active" href="/perfil/pedidos"><Package /> Compras e vendas</a><a href="/perfil#leiloes"><Gavel /> Meus leilões</a><a href="/perfil/carteira"><CreditCard /> Cartões</a><a href="/perfil#verificacoes"><FileCheck2 /> Verificações</a><a href="/perfil#configuracoes"><Settings /> Configurações</a></nav>
        <div className="profile-safety"><FileCheck2 /><p><strong>Transação protegida</strong><span>O pagamento fica protegido até a conclusão do pedido.</span></p></div>
      </aside>

      <section className="orders-content">
        <div className="orders-heading"><div><p className="eyebrow">Meus pedidos</p><h1>Compras e vendas</h1><p>Acompanhe cada etapa, do pagamento até a conclusão.</p></div><span><CheckCircle2 /> Ambiente demonstrativo</span></div>
        <div className="orders-tabs" role="tablist" aria-label="Tipo de pedido"><button role="tab" aria-selected={view === "compras"} className={view === "compras" ? "active" : ""} onClick={() => setView("compras")}><ShoppingBag /> Minhas compras <b>2</b></button><button role="tab" aria-selected={view === "vendas"} className={view === "vendas" ? "active" : ""} onClick={() => setView("vendas")}><PackageCheck /> Minhas vendas <b>1</b></button></div>

        {view === "compras" ? <>
          <article className="order-detail-card">
            <div className="order-topline"><div><span className={received ? "status-pill complete" : "status-pill transit"}>{received ? "Pedido concluído" : "Em trânsito"}</span><small>Pedido #VV-1048 · Compra em 2 de setembro</small></div><a href="#">Falar com a vendedora <MessageCircle /></a></div>
            <div className="order-detail-product"><img src="/images/vestido-terracota.png" alt="Vestido midi de linho" /><div><h2>Vestido midi de linho</h2><p>Amissima · Tamanho M · Excelente</p><span>Vendido por Marina Lopes</span></div><strong>R$ 219,84<small>total com envio e proteção</small></strong></div>
            <div className="order-timeline"><div className="done"><span><Check /></span><p><strong>Pagamento aprovado</strong><small>2 de setembro, 14:32</small></p></div><i></i><div className="done"><span><Check /></span><p><strong>Pedido postado</strong><small>3 de setembro, 10:18</small></p></div><i className={received ? "done" : "active"}></i><div className={received ? "done" : "current"}><span>{received ? <Check /> : <Truck />}</span><p><strong>{received ? "Entrega confirmada" : "Em trânsito"}</strong><small>{received ? "Confirmado agora" : "Previsão: 7 de setembro"}</small></p></div><i className={received ? "done" : ""}></i><div className={received ? "done" : ""}><span>{received ? <Check /> : <Package />}</span><p><strong>Concluído</strong><small>{received ? "Valor liberado" : "Após sua confirmação"}</small></p></div></div>
            <div className="tracking-box"><MapPin /><div><strong>Objeto encaminhado para Rio Verde – GO</strong><p>Código de rastreio: VVBR1048GO · Atualizado hoje às 08:21</p></div><button>Ver rastreamento <ChevronRight /></button></div>
            {!received ? <div className="buyer-actions"><button className="secondary" onClick={() => setIssueOpen(!issueOpen)}><AlertTriangle /> Tenho um problema</button><button onClick={() => setReceived(true)}><CheckCircle2 /> Confirmar recebimento</button></div> : <div className="order-success"><CheckCircle2 /><p><strong>Recebimento confirmado</strong><span>O pagamento pode ser liberado para a vendedora. Obrigada por movimentar esse armário!</span></p></div>}
            {issueOpen && !received && <div className="issue-panel"><AlertTriangle /><div><strong>O que aconteceu?</strong><p>Você poderá informar atraso, dano, item diferente do anúncio ou suspeita de falsificação. O pagamento ficará suspenso durante a análise.</p><div><button onClick={() => setIssueOpen(false)}>Cancelar</button><a href="/politicas#devolucoes">Continuar contestação</a></div></div></div>}
          </article>
          <article className="order-compact"><img src="/images/bolsa-sapato.png" alt="Bolsa vintage em couro" /><div><span>Pagamento aprovado</span><strong>Bolsa vintage em couro</strong><p>Pedido #VV-1052 · Aguardando postagem</p></div><b>R$ 329,09</b><button>Ver detalhes</button></article>
        </> : <>
          <article className="order-detail-card sale-order">
            <div className="order-topline"><div><span className={posted ? "status-pill transit" : "status-pill waiting"}>{posted ? "Pedido postado" : "Aguardando envio"}</span><small>Venda #VV-1052 · Pagamento aprovado</small></div><a href="#">Falar com a compradora <MessageCircle /></a></div>
            <div className="order-detail-product"><img src="/images/bolsa-sapato.png" alt="Bolsa vintage em couro" /><div><h2>Bolsa vintage em couro</h2><p>Vintage · Peça única · Muito boa</p><span>Comprado por Ana Clara</span></div><strong>R$ 294,00<small>valor da venda</small></strong></div>
            <div className="seller-deadline"><Truck /><div><strong>{posted ? "Postagem informada com sucesso" : "Envie até 8 de setembro"}</strong><p>{posted ? "A compradora já pode acompanhar o rastreamento." : "Embale a peça com cuidado e utilize a etiqueta gerada pela ViraVeste."}</p></div></div>
            {!posted && <div className="shipping-label"><div><span><Printer /></span><p><strong>Etiqueta de envio</strong><small>{labelReady ? "Etiqueta pronta para imprimir · PDF demonstrativo" : "Os dados da compradora ficam protegidos na etiqueta."}</small></p></div>{labelReady ? <button><Download /> Baixar etiqueta</button> : <button onClick={() => setLabelReady(true)}>Gerar etiqueta</button>}</div>}
            <div className="seller-actions"><a href="/politicas#vendas">Regras de envio</a><button disabled={!labelReady || posted} onClick={() => setPosted(true)}><PackageCheck /> {posted ? "Postagem confirmada" : "Já postei o pedido"}</button></div>
            {posted && <div className="order-success"><CheckCircle2 /><p><strong>Envio registrado</strong><span>O rastreamento foi compartilhado com a compradora. O valor será liberado após o recebimento.</span></p></div>}
          </article>
          <aside className="seller-payment-summary"><div><p className="eyebrow">Resumo financeiro</p><h2>Valor a receber</h2></div><dl><div><dt>Valor da venda</dt><dd>R$ 294,00</dd></div><div><dt>Taxa da plataforma</dt><dd>− R$ 23,52</dd></div><div><dt>Seu recebimento</dt><dd>R$ 270,48</dd></div></dl><p><RotateCcw /> Liberação após a confirmação do recebimento.</p></aside>
        </>}
      </section>
    </div>
  </main>;
}
