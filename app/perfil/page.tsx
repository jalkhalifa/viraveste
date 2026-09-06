"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Check, ChevronRight, CreditCard, FileCheck2, Gavel, Heart, Home, Leaf, LogOut, MapPin, MessageCircle, Package, PackageCheck, Pencil, Plus, Save, Settings, ShoppingBag, Star, Trash2, Truck, UserRound, X } from "lucide-react";

type Profile = { full_name: string; phone: string; city: string; state: string; wants_to_buy: boolean; wants_to_sell: boolean; account_status: string };
type Address = { id?: string; label: string; recipient_name: string; postal_code: string; street: string; number: string; complement: string | null; neighborhood: string; city: string; state: string; country_code?: string; is_default: boolean };
const emptyAddress: Address = { label: "Casa", recipient_name: "", postal_code: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", is_default: false };

const shortcuts = [
  { icon: ShoppingBag, label: "Compras", value: "2", detail: "1 a caminho", tone: "blue" },
  { icon: PackageCheck, label: "Vendas", value: "12", detail: "3 anúncios ativos", tone: "green" },
  { icon: Gavel, label: "Meus leilões", value: "3", detail: "1 lance na liderança", tone: "coral" },
  { icon: Heart, label: "Favoritos", value: "24", detail: "Peças salvas", tone: "yellow" },
];

export default function ProfileOverviewPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Address | null>(null);
  const [addressNotice, setAddressNotice] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  useEffect(() => { fetch("/api/profile").then(async response => { if (response.status === 401) { window.location.href = "/api/auth?returnTo=/perfil"; return; } const result = await response.json(); if (!response.ok) throw new Error(result.error); setProfile(result.profile); setEmail(result.email); }).catch(() => setNotice("Não foi possível carregar seus dados.")); }, []);
  useEffect(() => { loadAddresses(); }, []);
  const displayName = profile?.full_name || "Seu perfil";
  const firstName = displayName.split(" ")[0];
  const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "VV";
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!profile) return; setSaving(true); setNotice(""); const response = await fetch("/api/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(profile) }); const result = await response.json(); if (response.ok) { setProfile(result.profile); setEditing(false); setNotice("Perfil atualizado com sucesso."); } else setNotice(result.error || "Não foi possível salvar."); setSaving(false); }
  async function logout() { await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "logout" }) }); window.location.href = "/"; }
  async function loadAddresses() { const response = await fetch("/api/addresses"); if (response.status === 401) return; const result = await response.json(); if (response.ok) setAddresses(result.addresses); else setAddressNotice(result.error); }
  async function saveAddress(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!addressForm) return; setSavingAddress(true); setAddressNotice(""); const response = await fetch("/api/addresses", { method: addressForm.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(addressForm) }); const result = await response.json(); if (response.ok) { setAddressForm(null); setAddressNotice(addressForm.id ? "Endereço atualizado." : "Endereço cadastrado."); await loadAddresses(); } else setAddressNotice(result.error); setSavingAddress(false); }
  async function removeAddress(id?: string) { if (!id || !window.confirm("Excluir este endereço?")) return; const response = await fetch(`/api/addresses?id=${encodeURIComponent(id)}`, { method: "DELETE" }); const result = await response.json(); if (response.ok) { setAddressNotice("Endereço excluído."); await loadAddresses(); } else setAddressNotice(result.error); }
  return <main className="wallet-page profile-overview-page">
    <header className="wallet-header">
      <a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a>
      <a href="/"><ArrowLeft /> Voltar para a ViraVeste</a>
      <button className="profile-bell" aria-label="Notificações"><Bell /><i>3</i></button>
      <button className="profile-logout" onClick={logout}><LogOut /> Sair</button><div><span>{initials}</span><strong>{firstName}</strong></div>
    </header>

    <div className="wallet-shell">
      <aside className="profile-menu">
        <div className="profile-menu-user"><span>{initials}</span><div><strong>{displayName}</strong><small>{profile ? `${profile.city || "Cidade"}, ${profile.state || "UF"}` : "Carregando perfil..."}</small></div></div>
        <nav>
          <a className="active" href="/perfil"><UserRound /> Visão geral</a>
          <a href="/armario/camila"><ShoppingBag /> Perfil público (demo)</a>
          <a href="/perfil/pedidos"><Package /> Compras</a>
          <a href="/perfil/pedidos"><PackageCheck /> Vendas</a>
          <a href="#leiloes"><Gavel /> Meus leilões</a>
          <a href="/perfil/carteira"><CreditCard /> Carteira</a>
          <a href="#verificacoes"><FileCheck2 /> Verificações</a>
          <a href="#configuracoes"><Settings /> Configurações</a>
        </nav>
        <div className="profile-safety"><FileCheck2 /><p><strong>E-mail confirmado</strong><span>Identidade e CPF serão verificados em uma próxima etapa.</span></p></div>
      </aside>

      <div className="profile-dashboard">
        <section className="dashboard-welcome">
          <div><p className="eyebrow">Minha conta</p><h1>Olá, {firstName}.</h1><p>Acompanhe suas compras, vendas e leilões em um só lugar.</p></div>
          <a href="/vender"><Plus /> Anunciar uma peça</a>
        </section>

        <section className="real-profile-card" id="configuracoes"><div className="real-profile-title"><div><p className="eyebrow">Dados reais da conta</p><h2>Meu perfil</h2><span>{email || "Carregando e-mail..."}</span></div><button onClick={() => setEditing(!editing)}><Settings /> {editing ? "Cancelar" : "Editar dados"}</button></div>{notice && <p className="profile-notice">{notice}</p>}{profile && <form onSubmit={saveProfile} className="real-profile-form"><label><span>Nome completo</span><input disabled={!editing} value={profile.full_name || ""} onChange={event => setProfile({ ...profile, full_name: event.target.value })} /></label><label><span>Celular</span><input disabled={!editing} value={profile.phone || ""} onChange={event => setProfile({ ...profile, phone: event.target.value })} /></label><label><span>Cidade</span><input disabled={!editing} value={profile.city || ""} onChange={event => setProfile({ ...profile, city: event.target.value })} /></label><label><span>Estado</span><input disabled={!editing} value={profile.state || ""} onChange={event => setProfile({ ...profile, state: event.target.value })} /></label><fieldset><legend>Quero usar a ViraVeste para</legend><label><input disabled={!editing} type="checkbox" checked={profile.wants_to_buy} onChange={event => setProfile({ ...profile, wants_to_buy: event.target.checked })} /> Comprar</label><label><input disabled={!editing} type="checkbox" checked={profile.wants_to_sell} onChange={event => setProfile({ ...profile, wants_to_sell: event.target.checked })} /> Vender</label></fieldset>{editing && <button className="save-profile" disabled={saving}><Save /> {saving ? "Salvando..." : "Salvar alterações"}</button>}</form>}</section>

        <section className="real-profile-card address-card" id="enderecos"><div className="real-profile-title"><div><p className="eyebrow">Entregas e devoluções</p><h2>Meus endereços</h2><span>Seus dados ficam visíveis somente para você.</span></div><button onClick={() => setAddressForm({ ...emptyAddress, recipient_name: profile?.full_name || "" })}><Plus /> Novo endereço</button></div>{addressNotice && <p className="profile-notice">{addressNotice}</p>}<div className="address-list">{addresses.length === 0 && !addressForm ? <div className="address-empty"><MapPin /><p><strong>Nenhum endereço cadastrado</strong><span>Cadastre um endereço para futuras compras e cálculo de frete.</span></p></div> : addresses.map(address => <article className={address.is_default ? "default" : ""} key={address.id}><span><Home /></span><div><p><strong>{address.label}</strong>{address.is_default && <b>Principal</b>}</p><small>{address.recipient_name}</small><small>{address.street}, {address.number}{address.complement ? ` — ${address.complement}` : ""}</small><small>{address.neighborhood} · {address.city}/{address.state} · CEP {address.postal_code.replace(/(\d{5})(\d{3})/, "$1-$2")}</small></div><div><button aria-label="Editar endereço" onClick={() => setAddressForm({ ...address })}><Pencil /></button><button aria-label="Excluir endereço" onClick={() => removeAddress(address.id)}><Trash2 /></button></div></article>)}</div>{addressForm && <form className="address-form" onSubmit={saveAddress}><div className="address-form-title"><strong>{addressForm.id ? "Editar endereço" : "Novo endereço"}</strong><button type="button" aria-label="Fechar" onClick={() => setAddressForm(null)}><X /></button></div><label><span>Identificação</span><input required value={addressForm.label} onChange={event => setAddressForm({ ...addressForm, label: event.target.value })} placeholder="Ex.: Casa" /></label><label className="wide"><span>Nome de quem recebe</span><input required value={addressForm.recipient_name} onChange={event => setAddressForm({ ...addressForm, recipient_name: event.target.value })} /></label><label><span>CEP</span><input required inputMode="numeric" maxLength={9} value={addressForm.postal_code} onChange={event => setAddressForm({ ...addressForm, postal_code: event.target.value })} placeholder="75900-000" /></label><label className="wide"><span>Rua ou avenida</span><input required value={addressForm.street} onChange={event => setAddressForm({ ...addressForm, street: event.target.value })} /></label><label><span>Número</span><input required value={addressForm.number} onChange={event => setAddressForm({ ...addressForm, number: event.target.value })} /></label><label><span>Complemento</span><input value={addressForm.complement || ""} onChange={event => setAddressForm({ ...addressForm, complement: event.target.value })} placeholder="Opcional" /></label><label><span>Bairro</span><input required value={addressForm.neighborhood} onChange={event => setAddressForm({ ...addressForm, neighborhood: event.target.value })} /></label><label className="wide"><span>Cidade</span><input required value={addressForm.city} onChange={event => setAddressForm({ ...addressForm, city: event.target.value })} /></label><label><span>UF</span><input required maxLength={2} value={addressForm.state} onChange={event => setAddressForm({ ...addressForm, state: event.target.value.toUpperCase() })} placeholder="GO" /></label><label className="address-default"><input type="checkbox" checked={addressForm.is_default} onChange={event => setAddressForm({ ...addressForm, is_default: event.target.checked })} /> Usar como endereço principal</label><button className="save-profile" disabled={savingAddress}><Save /> {savingAddress ? "Salvando..." : "Salvar endereço"}</button></form>}</section>

        <section className="dashboard-shortcuts" aria-label="Resumo da conta">
          {shortcuts.map(item => <a href={item.label === "Compras" || item.label === "Vendas" ? "/perfil/pedidos" : `#${item.label.toLowerCase().replace(" ", "-")}`} className={`dashboard-stat ${item.tone}`} key={item.label}>
            <span><item.icon /></span><div><small>{item.label}</small><strong>{item.value}</strong><p>{item.detail}</p></div><ChevronRight />
          </a>)}
        </section>

        <div className="dashboard-columns">
          <div className="dashboard-main">
            <section className="dashboard-card active-order" id="compras">
              <div className="dashboard-card-title"><div><p className="eyebrow">Compra em andamento</p><h2>Seu pedido está a caminho</h2></div><a href="/perfil/pedidos">Ver compras <ChevronRight /></a></div>
              <div className="order-product"><img src="/images/vestido-terracota.png" alt="Vestido midi de linho" /><div><small>Pedido #VV-1048</small><strong>Vestido midi de linho</strong><p>Vendido por Marina Lopes</p></div><b>R$ 189</b></div>
              <div className="shipping-progress"><div><span className="done"><Check /></span><i></i><span className="done"><Check /></span><i className="active"></i><span><Truck /></span><i></i><span><Package /></span></div><ol><li>Pagamento</li><li>Postado</li><li>Em trânsito</li><li>Entregue</li></ol></div>
              <p className="delivery-estimate"><MapPin /> Previsão de entrega: <strong>7 de setembro</strong></p>
            </section>

            <section className="dashboard-card dashboard-auction" id="leiloes">
              <div className="dashboard-card-title"><div><p className="eyebrow">Leilão acompanhado</p><h2>Você está na liderança</h2></div><a href="/leilao/bolsa-vintage">Abrir leilão <ChevronRight /></a></div>
              <div className="dashboard-auction-item"><img src="/images/bolsa-sapato.png" alt="Bolsa vintage em couro" /><div><span>Termina em 08:42</span><h3>Bolsa vintage em couro</h3><p>Seu lance atual</p><strong>R$ 294</strong></div><a href="/leilao/bolsa-vintage"><Gavel /> Acompanhar</a></div>
            </section>

            <section className="dashboard-card" id="vendas">
              <div className="dashboard-card-title"><div><p className="eyebrow">Meu armário</p><h2>Resumo das suas vendas</h2></div><a href="/perfil/pedidos">Ver vendas <ChevronRight /></a></div>
              <div className="sales-summary"><div><span>3</span><p>Anúncios ativos</p></div><div><span>1</span><p>Aguardando envio</p></div><div><span>46</span><p>Peças vendidas</p></div><div><span>4,9 <Star /></span><p>Avaliação média</p></div></div>
            </section>
          </div>

          <aside className="dashboard-side">
            <section className="dashboard-card balance-card">
              <div className="dashboard-card-title"><div><p className="eyebrow">Carteira</p><h2>Seu saldo</h2></div></div>
              <strong>R$ 324,50</strong><span>Disponível para saque</span><button>Transferir saldo</button><a href="/perfil/carteira"><CreditCard /> Cartões e pagamentos <ChevronRight /></a>
            </section>
            <section className="dashboard-card verification-card" id="verificacoes">
              <div className="dashboard-card-title"><div><p className="eyebrow">Segurança</p><h2>Conta verificada</h2></div></div>
              <ul><li><Check /> Identidade e CPF</li><li><Check /> Celular e e-mail</li><li><Check /> Cartão de pagamento</li></ul><a href="#">Gerenciar verificações <ChevronRight /></a>
            </section>
            <section className="dashboard-card inbox-card">
              <div className="dashboard-card-title"><div><p className="eyebrow">Mensagens</p><h2>Conversas recentes</h2></div><span>2 novas</span></div>
              <a href="#"><i>MA</i><p><strong>Marina Lopes</strong><small>Já postei sua peça 💚</small></p><time>12:40</time></a>
              <a href="#"><i className="blue-avatar">AN</i><p><strong>Ana Clara</strong><small>A bolsa tem alguma marca?</small></p><time>Ontem</time></a>
              <button><MessageCircle /> Ver todas as mensagens</button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  </main>;
}
