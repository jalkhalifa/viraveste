import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Heart,
  Leaf,
  MessageCircle,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

export default function ProductPage() {
  return (
    <main>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/">
            <span className="brand-cycle"><Leaf /></span>
            <span>ViraVeste<small>Seu armário em movimento.</small></span>
          </a>
          <form className="top-search">
            <Search />
            <input aria-label="Buscar" placeholder="Buscar peças, marcas ou armários" />
          </form>
          <nav className="header-links">
            <a href="/#produtos">Comprar</a>
            <a href="/#armarios">Armários</a>
            <a href="/#seguranca">Como funciona</a>
          </nav>
          <div className="top-actions">
            <button className="bare" aria-label="Notificações"><Bell /></button>
            <button className="bare desktop-only" aria-label="Mensagens"><MessageCircle /></button>
            <button className="login desktop-only">Entrar</button>
            <a className="sell desktop-only" href="/vender"><Plus /> Vender</a>
          </div>
        </div>
      </header>

      <div className="product-page">
        <nav className="breadcrumb" aria-label="Navegação estrutural">
          <a href="/"><ArrowLeft /> Voltar</a>
          <span>Início</span><ChevronRight /><span>Vestidos</span><ChevronRight /><strong>Vestido midi de linho</strong>
        </nav>

        <section className="product-detail">
          <div className="product-gallery">
            <div className="product-main-photo">
              <img src="/images/vestido-terracota.png" alt="Vestido midi de linho terracota" />
              <button className="detail-favorite" aria-label="Favoritar vestido"><Heart /> 24</button>
              <span className="photo-count">1 / 3</span>
            </div>
            <div className="product-thumbs" aria-label="Outras fotos da peça">
              <button className="active"><img src="/images/vestido-terracota.png" alt="Vestido visto de frente" /></button>
              <button><img className="thumb-detail" src="/images/vestido-terracota.png" alt="Detalhe do tecido do vestido" /></button>
              <button><img className="thumb-full" src="/images/vestido-terracota.png" alt="Caimento completo do vestido" /></button>
            </div>
          </div>

          <aside className="product-panel">
            <p className="detail-kicker">Amissima · Tamanho M</p>
            <h1>Vestido midi de linho</h1>
            <div className="detail-state"><span>Excelente</span><small>Usado poucas vezes</small></div>
            <strong className="detail-price">R$ 189</strong>
            <p className="installment">ou 3x de R$ 63 sem juros</p>

            <div className="detail-actions">
              <a className="buy-now" href="/checkout">Comprar agora</a>
              <button className="make-offer">Fazer proposta</button>
              <button className="talk-seller"><MessageCircle /> Conversar com a vendedora</button>
            </div>

            <div className="shipping-box">
              <div><Truck /><span><strong>Calcule o frete</strong><small>Envio a partir de Rio Verde, GO</small></span></div>
              <form><input aria-label="CEP" placeholder="Digite seu CEP" inputMode="numeric" /><button>Calcular</button></form>
            </div>

            <div className="protection-note">
              <ShieldCheck />
              <span><strong>Compra protegida pela ViraVeste</strong><small>O pagamento só é liberado depois que você recebe a peça.</small></span>
            </div>
          </aside>
        </section>

        <section className="product-information">
          <div className="description-card">
            <p className="eyebrow">Sobre a peça</p>
            <h2>Detalhes e conservação</h2>
            <p>Vestido midi em linho misto, com alças largas e caimento levemente acinturado. Foi usado apenas duas vezes e não possui manchas, rasgos ou ajustes.</p>
            <dl>
              <div><dt>Marca</dt><dd>Amissima</dd></div>
              <div><dt>Tamanho</dt><dd>M</dd></div>
              <div><dt>Cor</dt><dd>Terracota</dd></div>
              <div><dt>Material</dt><dd>Linho misto</dd></div>
              <div><dt>Condição</dt><dd>Excelente</dd></div>
            </dl>
          </div>

          <aside className="seller-card">
            <p className="eyebrow">Quem está vendendo</p>
            <div className="seller-profile">
              <span className="seller-avatar">CA</span>
              <div><h2>Camila R.</h2><p>Rio Verde, GO</p></div>
              <button>Seguir</button>
            </div>
            <div className="seller-rating"><Star /><strong>4,9</strong><span>· 38 avaliações</span></div>
            <ul>
              <li><PackageCheck /> Costuma enviar em até 2 dias</li>
              <li><MessageCircle /> Responde em poucas horas</li>
            </ul>
            <a href="/armario/camila">Ver o armário de Camila <ChevronRight /></a>
          </aside>
        </section>
      </div>

      <footer>
        <div><a className="footer-brand" href="/">ViraVeste</a><p>Seu armário em movimento.</p></div>
        <nav><a href="/politicas">Políticas</a><a href="/politicas#devolucoes">Devoluções</a><a href="/politicas#privacidade">Privacidade</a><a href="/politicas#leiloes">Leilões</a></nav>
        <span>© 2026 ViraVeste</span>
      </footer>
    </main>
  );
}
