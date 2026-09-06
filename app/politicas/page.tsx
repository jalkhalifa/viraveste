import { AlertTriangle, ArrowLeft, CheckCircle2, CreditCard, FileCheck2, Gavel, Leaf, LockKeyhole, PackageCheck, RotateCcw, Scale, ShieldCheck, Truck, UserCheck } from "lucide-react";

const policyNav = [
  ["#leiloes", "Regras dos leilões"], ["#devolucoes", "Devoluções"], ["#vendas", "Anúncios e vendas"], ["#pagamentos", "Pagamentos"], ["#privacidade", "Privacidade"], ["#conduta", "Conduta e sanções"],
];

export default function PoliciesPage() {
  return <main className="policies-page">
    <header className="policies-header"><a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a><a href="/"><ArrowLeft /> Voltar para a ViraVeste</a></header>
    <section className="policies-intro"><div><p className="eyebrow">Confiança entre pessoas</p><h1>Políticas da ViraVeste</h1><p>Regras claras para comprar, vender e participar de leilões com segurança.</p></div><aside><AlertTriangle /><p><strong>Minuta para validação jurídica</strong><span>Esta versão orienta o protótipo. Antes do lançamento comercial, deverá ser revisada por advogado e receber os dados empresariais da ViraVeste.</span></p></aside></section>

    <div className="policies-layout">
      <nav className="policies-nav"><strong>Nesta página</strong>{policyNav.map(([href, label]) => <a href={href} key={href}>{label}</a>)}<small>Versão 0.1<br />Atualizada em 4 de setembro de 2026</small></nav>
      <article className="policies-content">
        <section className="policy-principles"><div><ShieldCheck /><strong>Pagamento protegido</strong><span>Valor retido até a confirmação da entrega.</span></div><div><Scale /><strong>Sem multa por arrependimento</strong><span>Os direitos previstos em lei são preservados.</span></div><div><UserCheck /><strong>Identidade verificada</strong><span>Requisito para vender e disputar leilões.</span></div></section>

        <section className="policy-section" id="leiloes"><div className="policy-heading"><span><Gavel /></span><div><p className="eyebrow">Política 01</p><h2>Regras dos leilões</h2></div></div>
          <p>Para participar, a pessoa deve ser maior de 18 anos, possuir conta verificada e manter cartão válido cadastrado. Cada lance representa intenção séria de compra e autoriza a tentativa de cobrança automática se for vencedor.</p>
          <ul><li>O valor e o incremento do próximo lance serão exibidos antes da confirmação.</li><li>Lances não podem ser editados após o encerramento; erros devem ser informados imediatamente pelo canal de ajuda.</li><li>Nos últimos segundos, o prazo poderá ser prorrogado para evitar vantagem por lance tardio.</li><li>Leilões de maior valor ou de luxo podem exigir reserva temporária no cartão. A reserva não é taxa e será liberada quando cabível.</li><li>Se a cobrança falhar, o vencedor terá até 30 minutos para regularizar o pagamento antes do cancelamento operacional.</li></ul>
          <div className="policy-callout good"><CheckCircle2 /><p><strong>Proteção do direito de arrependimento</strong><span>A ViraVeste não cobrará multa ou taxa pelo exercício regular do direito de arrependimento quando ele for garantido pela legislação aplicável.</span></p></div>
        </section>

        <section className="policy-section" id="devolucoes"><div className="policy-heading"><span><RotateCcw /></span><div><p className="eyebrow">Política 02</p><h2>Arrependimento, devoluções e problemas</h2></div></div>
          <p>Em contratações online sujeitas ao Código de Defesa do Consumidor, o comprador poderá exercer o direito de arrependimento em até sete dias, contados da assinatura ou do recebimento, conforme o caso, sem necessidade de justificativa e sem cobrança de multa.</p>
          <ul><li>Os valores pagos serão restituídos integralmente, inclusive os custos abrangidos pela legislação.</li><li>O pedido poderá ser feito pela própria plataforma, com confirmação imediata de recebimento.</li><li>O produto deverá ser devolvido com os itens e documentos recebidos; sinais de fraude ou dano intencional serão analisados separadamente.</li><li>Produto diferente do anúncio, falsificado, danificado no transporte ou com defeito omitido deverá ser comunicado pela opção “Tenho um problema”.</li><li>A janela operacional de 48 horas para confirmar a entrega não reduz garantias nem prazos legais.</li></ul>
          <div className="policy-callout"><Scale /><p><strong>Venda entre particulares</strong><span>A incidência do CDC pode variar conforme a habitualidade da pessoa vendedora e as circunstâncias da operação. A Proteção ViraVeste não elimina direitos previstos em lei.</span></p></div>
        </section>

        <section className="policy-section" id="vendas"><div className="policy-heading"><span><PackageCheck /></span><div><p className="eyebrow">Política 03</p><h2>Anúncios, autenticidade e envio</h2></div></div>
          <ul><li>Somente itens permitidos, de propriedade ou posse legítima da pessoa anunciante, podem ser publicados.</li><li>Fotos, medidas, condição, defeitos, origem e demais características relevantes devem ser verdadeiros e atuais.</li><li>Peças de luxo exigem comprovante de procedência, como nota fiscal, certificado ou documentação equivalente, sujeito à análise.</li><li>Produtos falsificados, roubados, perigosos, ilegais ou que violem direitos de terceiros são proibidos.</li><li>Após a venda, a postagem deverá ocorrer no prazo informado na transação, usando a etiqueta e o rastreamento disponibilizados.</li></ul>
          <div className="policy-callout warning"><FileCheck2 /><p><strong>Vendedores habituais</strong><span>Quem comercializa com habitualidade pode ser considerado fornecedor e deverá cumprir obrigações consumeristas, fiscais e de emissão de documento quando aplicáveis.</span></p></div>
        </section>

        <section className="policy-section" id="pagamentos"><div className="policy-heading"><span><CreditCard /></span><div><p className="eyebrow">Política 04</p><h2>Pagamentos e proteção da compra</h2></div></div>
          <ul><li>Preço, frete, proteção da compra e demais valores serão discriminados antes da confirmação.</li><li>Dados completos do cartão não serão armazenados pela ViraVeste; o processamento será realizado por parceiro financeiro certificado.</li><li>O valor ficará retido e será liberado à pessoa vendedora após a entrega e o encerramento da janela de confirmação, salvo disputa.</li><li>Pagamentos e negociações fora da plataforma não terão a Proteção ViraVeste.</li><li>Estornos e reservas temporárias podem depender do prazo operacional da instituição financeira.</li></ul>
        </section>

        <section className="policy-section" id="privacidade"><div className="policy-heading"><span><LockKeyhole /></span><div><p className="eyebrow">Política 05</p><h2>Privacidade e dados pessoais</h2></div></div>
          <p>Serão tratados apenas os dados necessários para cadastro, segurança, prevenção a fraudes, pagamento, entrega, atendimento e cumprimento de obrigações legais. Documentos de luxo e identidade terão acesso restrito e prazo de retenção definido.</p>
          <ul><li>A pessoa poderá solicitar acesso, correção e demais direitos previstos na LGPD.</li><li>Dados serão compartilhados somente com parceiros necessários à operação ou por obrigação legal.</li><li>A plataforma adotará controles de acesso, registro de eventos, criptografia adequada e resposta a incidentes.</li></ul>
        </section>

        <section className="policy-section" id="conduta"><div className="policy-heading"><span><AlertTriangle /></span><div><p className="eyebrow">Política 06</p><h2>Conduta, não pagamento e sanções</h2></div></div>
          <p>O exercício legítimo de um direito não será punido. As medidas abaixo são voltadas a fraude, manipulação de lances, não pagamento reiterado, falsificação, assédio ou outra conduta abusiva comprovada.</p>
          <ol><li><strong>Primeira ocorrência:</strong> aviso educativo e suspensão dos leilões por até 7 dias.</li><li><strong>Reincidência em 90 dias:</strong> suspensão por até 30 dias e nova verificação da conta.</li><li><strong>Fraude ou abuso grave:</strong> bloqueio preventivo, análise individual e possível encerramento da conta.</li></ol>
          <p>A pessoa será informada sobre o motivo e poderá pedir revisão. A ViraVeste não fará cobrança automática de “multa de arrependimento”. Eventuais perdas decorrentes de fraude serão tratadas individualmente pelos meios permitidos em lei.</p>
        </section>

        <section className="policy-section legal-basis"><h2>Referências para a revisão jurídica</h2><p>Código de Defesa do Consumidor, Decreto do Comércio Eletrônico nº 7.962/2013, Código Civil, Marco Civil da Internet, Lei Geral de Proteção de Dados e normas aplicáveis aos meios de pagamento e à atividade de leilão.</p><p><strong>Ponto pendente:</strong> validar juridicamente o enquadramento da modalidade “leilão” da ViraVeste e a eventual incidência das normas sobre leiloeiros oficiais antes da abertura ao público.</p></section>
      </article>
    </div>
    <footer><div><a className="footer-brand" href="/">ViraVeste</a><p>Seu armário em movimento.</p></div><nav><a href="/politicas">Políticas</a><a href="/politicas#devolucoes">Devoluções</a><a href="/politicas#privacidade">Privacidade</a><a href="/politicas#leiloes">Leilões</a></nav><span>© 2026 ViraVeste</span></footer>
  </main>;
}
