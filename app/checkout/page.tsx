"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, CheckCircle2, ChevronRight, CreditCard, Gavel, Leaf, LockKeyhole, MapPin, PackageCheck, QrCode, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

type CheckoutMode = "direct" | "auction";
type PaymentMethod = "credit" | "pix";
type Address = { id: string; label: string; recipient_name: string; postal_code: string; street: string; number: string; complement: string | null; neighborhood: string; city: string; state: string; is_default: boolean };

const checkoutItems = {
  direct: { title: "Vestido midi de linho", seller: "Camila R.", meta: "Amissima · Tamanho M · Excelente", price: 189, protection: 11.94, image: "/images/vestido-terracota.png" },
  auction: { title: "Bolsa vintage em couro", seller: "Camila R.", meta: "Vintage · Único · Muito boa", price: 294, protection: 17.19, image: "/images/bolsa-sapato.png" },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<CheckoutMode>("direct");
  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<PaymentMethod>("credit");
  const [accepted, setAccepted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [choosingAddress, setChoosingAddress] = useState(false);
  const [addressState, setAddressState] = useState<"loading" | "ready" | "signed-out" | "error">("loading");
  const [realItem, setRealItem] = useState<{title:string;seller:string;meta:string;price:number;protection:number;image:string}|null>(null);
  const [negotiated, setNegotiated] = useState(false);
  const [listingId, setListingId] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderId, setOrderId] = useState("");
  useEffect(() => { fetch("/api/addresses").then(async response => { const result = await response.json(); if (response.status === 401) { setAddressState("signed-out"); return; } if (!response.ok) throw new Error(result.error); const list = result.addresses as Address[]; setAddresses(list); setSelectedAddressId(list.find(address => address.is_default)?.id || list[0]?.id || ""); setAddressState("ready"); }).catch(() => setAddressState("error")); }, []);
  useEffect(()=>{const requestedListingId=searchParams.get("produto"),offerId=searchParams.get("oferta");if(!requestedListingId)return;setListingId(requestedListingId);Promise.all([fetch(`/api/listings?id=${encodeURIComponent(requestedListingId)}`).then(r=>r.json()),offerId?fetch(`/api/offers?id=${encodeURIComponent(offerId)}`).then(r=>r.json()):Promise.resolve({offer:null})]).then(([listingResult,offerResult])=>{const listing=listingResult.listing,offer=offerResult.offer;if(!listing)return;const validOffer=offer&&offer.listing_id===listing.id&&(offer.status==="accepted"||(offer.status==="pending"&&offer.created_by===offer.seller_id));const price=validOffer?Number(offer.amount):Number(listing.price||listing.starting_bid||0);setNegotiated(Boolean(validOffer));setMode(listing.sale_mode==="auction"?"auction":"direct");setRealItem({title:listing.title,seller:listing.seller?.display_name||"Vendedor ViraVeste",meta:[listing.brand,listing.size||listing.dimensions,listing.item_condition].filter(Boolean).join(" · "),price,protection:Number((price*.06+0.6).toFixed(2)),image:listing.image_urls?.[0]||"/images/editorial-verere.png"})}).catch(()=>setCheckoutError("Não foi possível carregar os dados do anúncio."))},[searchParams]);
  const item = realItem||checkoutItems[mode];
  const shippingPrice = shipping === "standard" ? 18.9 : 32.5;
  const total = useMemo(() => item.price + item.protection + shippingPrice, [item, shippingPrice]);
  const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const paymentLabel = payment === "credit" ? "Cartão de crédito" : "Pix";
  const selectedAddress = addresses.find(address => address.id === selectedAddressId);
  async function confirmOrder(){if(!listingId){setFinished(true);return}setCreatingOrder(true);setCheckoutError("");const response=await fetch("/api/orders",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({listingId,offerId:searchParams.get("oferta"),addressId:selectedAddressId,shippingMethod:shipping,paymentMethod:payment})});const result=await response.json();if(response.status===401){window.location.href=`/api/auth?returnTo=${encodeURIComponent(window.location.pathname+window.location.search)}`;return}if(response.ok){setOrderId(result.orderId);setFinished(true)}else setCheckoutError(result.error||"Não foi possível criar o pedido.");setCreatingOrder(false)}

  if (finished) return <main className="checkout-success"><a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a><section><span><Check /></span><p className="eyebrow">Pedido registrado</p><h1>Pedido criado!</h1><p>O pedido foi salvo. A integração com a cobrança real será feita na próxima etapa.</p><div><strong>Pedido #{orderId?orderId.slice(0,8).toUpperCase():"VV-TESTE"}</strong><small>{paymentLabel} · Pagamento demonstrativo</small></div><a href="/perfil/pedidos">Acompanhar meu pedido</a><button onClick={() => setFinished(false)}>Voltar ao checkout</button></section></main>;

  return <main className="checkout-page">
    <header className="checkout-header"><a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a><a href={mode === "auction" ? "/leilao/bolsa-vintage" : "/produto/vestido-midi-linho"}><ArrowLeft /> Voltar</a><span><LockKeyhole /> Checkout protegido</span></header>
    <div className="checkout-shell">
      <section className="checkout-main">
        <div className="checkout-heading"><p className="eyebrow">Finalizar pedido</p><h1>Confira e pague com segurança</h1><p>Este checkout é uma demonstração e não realiza cobranças reais.</p></div>

        <div className="checkout-mode" role="group" aria-label="Tipo de compra"><button className={mode === "direct" ? "active" : ""} onClick={() => setMode("direct")}><ShoppingBag /> Compra direta</button><button className={mode === "auction" ? "active" : ""} onClick={() => setMode("auction")}><Gavel /> Leilão arrematado</button></div>

        <section className="checkout-card"><div className="checkout-card-title"><span><MapPin /></span><div><p>Entrega</p><h2>Endereço</h2></div>{addresses.length > 1 && <button onClick={() => setChoosingAddress(!choosingAddress)}>{choosingAddress ? "Fechar" : "Alterar"}</button>}</div>{addressState === "loading" && <div className="checkout-address checkout-address-state">Carregando seu endereço...</div>}{addressState === "signed-out" && <div className="checkout-address checkout-address-state"><strong>Entre para continuar</strong><p>O checkout precisa da sua conta para acessar o endereço de entrega.</p><a href="/entrar?returnTo=/checkout">Entrar na minha conta</a></div>}{addressState === "error" && <div className="checkout-address checkout-address-state"><strong>Não foi possível carregar o endereço</strong><p>Tente atualizar a página.</p></div>}{addressState === "ready" && !selectedAddress && <div className="checkout-address checkout-address-state"><strong>Cadastre um endereço de entrega</strong><p>Você precisa de um endereço antes de finalizar a compra.</p><a href="/perfil#enderecos">Cadastrar endereço</a></div>}{selectedAddress && <div className="checkout-address"><strong>{selectedAddress.recipient_name}</strong><p>{selectedAddress.street}, {selectedAddress.number}{selectedAddress.complement ? ` · ${selectedAddress.complement}` : ""} · {selectedAddress.neighborhood}</p><p>{selectedAddress.city} – {selectedAddress.state} · CEP {selectedAddress.postal_code.replace(/(\d{5})(\d{3})/, "$1-$2")}</p></div>}{choosingAddress && <div className="checkout-address-options">{addresses.map(address => <label className={address.id === selectedAddressId ? "selected" : ""} key={address.id}><input type="radio" name="delivery-address" checked={address.id === selectedAddressId} onChange={() => { setSelectedAddressId(address.id); setChoosingAddress(false); }} /><span><strong>{address.label}{address.is_default ? " · Principal" : ""}</strong><small>{address.street}, {address.number} · {address.city}/{address.state}</small></span></label>)}<a href="/perfil#enderecos">Gerenciar endereços</a></div>}</section>

        <section className="checkout-card"><div className="checkout-card-title"><span><Truck /></span><div><p>Logística</p><h2>Escolha o envio</h2></div></div><div className="shipping-options"><label className={shipping === "standard" ? "selected" : ""}><input type="radio" name="shipping" checked={shipping === "standard"} onChange={() => setShipping("standard")} /><span><strong>Envio econômico</strong><small>Chega entre 9 e 12 de setembro · Com rastreamento</small></span><b>{money(18.9)}</b></label><label className={shipping === "express" ? "selected" : ""}><input type="radio" name="shipping" checked={shipping === "express"} onChange={() => setShipping("express")} /><span><strong>Envio expresso</strong><small>Chega entre 7 e 9 de setembro · Com rastreamento</small></span><b>{money(32.5)}</b></label></div></section>

        <section className="checkout-card"><div className="checkout-card-title"><span><CreditCard /></span><div><p>Pagamento</p><h2>Como você quer pagar?</h2></div><a href="/perfil/carteira">Gerenciar</a></div><div className="payment-options">
          <label className={`checkout-payment ${payment === "credit" ? "selected" : ""}`}><input type="radio" name="payment" checked={payment === "credit"} onChange={() => setPayment("credit")} /><i>VISA</i><span><strong>Cartão de crédito</strong><small>Visa final 4821 · até 3x sem juros</small></span>{payment === "credit" && <CheckCircle2 />}</label>
          <label className={`checkout-payment ${payment === "pix" ? "selected" : ""}`}><input type="radio" name="payment" checked={payment === "pix"} onChange={() => setPayment("pix")} /><i className="payment-icon pix"><QrCode /></i><span><strong>Pix</strong><small>Aprovação imediata · QR Code ou copia e cola</small></span>{payment === "pix" && <CheckCircle2 />}</label>
        </div>{mode === "auction" && payment !== "credit" && <p className="auction-payment-note"><Gavel /> Seu cartão cadastrado continua sendo a garantia do arremate até a confirmação deste pagamento.</p>}</section>
      </section>

      <aside className="checkout-summary">
        <p className="eyebrow">Resumo</p><h2>{negotiated?"Sua proposta":mode === "auction" ? "Seu arremate" : "Sua compra"}</h2>
        <div className="checkout-item"><img src={item.image} alt={item.title} /><div><span>{negotiated?"Valor negociado":mode === "auction" ? "Lance vencedor" : "Compra direta"}</span><strong>{item.title}</strong><p>{item.meta}</p><small>Vendido por {item.seller}</small></div></div>
        <dl><div><dt>{mode === "auction" ? "Valor do arremate" : "Preço da peça"}</dt><dd>{money(item.price)}</dd></div><div><dt>Envio</dt><dd>{money(shippingPrice)}</dd></div><div><dt>Proteção ViraVeste <button aria-label="Sobre a proteção">?</button></dt><dd>{money(item.protection)}</dd></div></dl>
        <div className="checkout-total"><span>Total</span><strong>{money(total)}</strong><small>{payment === "credit" ? `ou em até 3x de ${money(total / 3)} sem juros` : "Pagamento integral com confirmação imediata"}</small></div>
        <div className="checkout-protection"><ShieldCheck /><p><strong>Pagamento protegido</strong><span>O valor só será liberado à vendedora depois que você receber o pedido.</span></p></div>
        <label className="checkout-agreement"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} /><span>Confirmo os dados e aceito as <a href="/politicas">políticas da ViraVeste</a>, inclusive as regras de devolução{mode === "auction" ? " e do leilão" : ""}.</span></label>
        {checkoutError&&<p className="checkout-order-error">{checkoutError}</p>}<button className="checkout-submit" disabled={!accepted || !selectedAddress || creatingOrder} onClick={confirmOrder}><LockKeyhole /> {creatingOrder?"Criando pedido...":!selectedAddress ? "Informe o endereço de entrega" : payment === "pix" ? `Gerar Pix · ${money(total)}` : mode === "auction" ? `Pagar arremate · ${money(total)}` : `Confirmar e pagar · ${money(total)}`}</button>
        <small className="checkout-demo-note">Demonstração: nenhum valor será cobrado.</small>
        <a className="checkout-policy" href="/politicas#pagamentos">Ver regras de pagamento <ChevronRight /></a>
      </aside>
    </div>
    <div className="checkout-footer"><PackageCheck /><span><strong>Compra protegida</strong><small>Atendimento e suporte em todas as etapas.</small></span></div>
  </main>;
}
