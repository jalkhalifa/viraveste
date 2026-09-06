"use client";

import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, CreditCard, FileCheck2, Gavel, Info, Leaf, LockKeyhole, Plus, ShieldCheck, Smartphone, Trash2, UserRound } from "lucide-react";

export default function WalletPage() {
  const [showForm, setShowForm] = useState(false);
  const [added, setAdded] = useState(false);
  const [limit, setLimit] = useState(300);

  function addDemoCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdded(true);
    setShowForm(false);
  }

  return <main className="wallet-page">
    <header className="wallet-header">
      <a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a>
      <a href="/"><ArrowLeft /> Voltar para a ViraVeste</a>
      <div><span>CA</span><strong>Camila</strong></div>
    </header>

    <div className="wallet-shell">
      <aside className="profile-menu">
        <div className="profile-menu-user"><span>CA</span><div><strong>Camila R.</strong><small>Rio Verde, GO</small></div></div>
        <nav><a href="/perfil"><UserRound /> Visão geral</a><a href="/armario/camila"><UserRound /> Meu perfil público</a><a className="active" href="/perfil/carteira"><CreditCard /> Carteira</a><a href="/perfil#leiloes"><Gavel /> Meus leilões</a><a href="/perfil#verificacoes"><FileCheck2 /> Verificações</a></nav>
        <div className="profile-safety"><ShieldCheck /><p><strong>Ambiente protegido</strong><span>Seus dados de pagamento são processados pelo parceiro financeiro.</span></p></div>
      </aside>

      <div className="wallet-content">
        <section className="wallet-title"><div><p className="eyebrow">Pagamentos e leilões</p><h1>Carteira ViraVeste</h1><p>Gerencie seus cartões e confira até quanto você pode dar lances.</p></div><span className="eligible"><CheckCircle2 /> Liberada para leilões</span></section>

        <section className="auction-access-card">
          <div className="access-status"><span><Gavel /></span><div><small>Seu limite de participação</small><strong>Até R$ {limit.toLocaleString("pt-BR")}</strong><p>Você pode participar de leilões com arremate previsto dentro desse valor.</p></div></div>
          <div className="access-requirements"><strong>Requisitos concluídos</strong><ul><li><Check /> Identidade e CPF verificados</li><li><Check /> Celular e e-mail confirmados</li><li><Check /> Cartão válido cadastrado</li></ul></div>
          <button onClick={() => setLimit(limit === 300 ? 1000 : 300)}>{limit === 300 ? "Solicitar limite maior" : "Voltar ao limite básico"}</button>
        </section>

        <div className="wallet-columns">
          <section className="payment-methods">
            <div className="wallet-section-title"><div><p className="eyebrow">Formas de pagamento</p><h2>Cartões cadastrados</h2></div><button onClick={() => setShowForm(!showForm)}><Plus /> Adicionar cartão</button></div>

            <article className="saved-card"><div className="card-brand">VISA</div><div><strong>Visa final 4821</strong><p>Crédito · Principal</p><span><CheckCircle2 /> Cartão verificado</span></div><button aria-label="Remover cartão"><Trash2 /></button></article>
            {added && <article className="saved-card new-card"><div className="card-brand">••••</div><div><strong>Cartão de demonstração</strong><p>Crédito · Adicionado agora</p><span><CheckCircle2 /> Validação simulada</span></div><button aria-label="Remover cartão" onClick={() => setAdded(false)}><Trash2 /></button></article>}

            {showForm && <form className="demo-card-form" onSubmit={addDemoCard}>
              <div className="demo-warning"><Info /><p><strong>Demonstração</strong><span>Não informe dados reais. Esta tela ainda não está conectada a uma empresa de pagamentos.</span></p></div>
              <label><span>Número do cartão</span><input required inputMode="numeric" maxLength={19} placeholder="0000 0000 0000 0000" /></label>
              <div><label><span>Validade</span><input required placeholder="MM/AA" maxLength={5} /></label><label><span>Código de segurança</span><input required inputMode="numeric" placeholder="CVV" maxLength={4} /></label></div>
              <label><span>Nome impresso</span><input required placeholder="NOME DE DEMONSTRAÇÃO" /></label>
              <div className="demo-form-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button type="submit"><LockKeyhole /> Simular validação</button></div>
            </form>}
          </section>

          <aside className="wallet-rules">
            <p className="eyebrow">Como funciona</p><h2>Proteção nos leilões</h2>
            <ol><li><span>1</span><div><strong>Cartão validado</strong><p>Uma pequena autorização temporária confirma que o cartão está ativo.</p></div></li><li><span>2</span><div><strong>Limite por faixa</strong><p>Leilões de maior valor podem exigir uma reserva temporária de segurança.</p></div></li><li><span>3</span><div><strong>Cobrança após vencer</strong><p>O valor do arremate é cobrado automaticamente no cartão escolhido.</p></div></li></ol>
            <div className="temporary-hold"><CreditCard /><p><strong>Reserva temporária</strong><span>Não é uma taxa. O valor é liberado se você não vencer o leilão.</span></p></div>
            <a className="wallet-policy-link" href="/politicas#leiloes">Consultar regras dos leilões</a>
          </aside>
        </div>
      </div>
    </div>
  </main>;
}
