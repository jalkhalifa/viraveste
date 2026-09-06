"use client";

import { useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Leaf, LockKeyhole, Mail, ShieldCheck, ShoppingBag, Store, UserRound } from "lucide-react";

type Mode = "login" | "cadastro" | "recuperar";

export default function AccessPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const data = new FormData(event.currentTarget);
    const profile = mode === "cadastro" ? { full_name: data.get("full_name"), phone: data.get("phone"), city: data.get("city"), state: data.get("state"), wants_to_buy: data.getAll("purpose").includes("buy"), wants_to_sell: data.getAll("purpose").includes("sell") } : undefined;
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: mode === "cadastro" ? "signup" : mode === "recuperar" ? "recover" : "login", email: data.get("email"), password: data.get("password"), profile }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível continuar.");
      if (mode === "login") { const requested = new URLSearchParams(window.location.search).get("returnTo"); window.location.href = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/perfil"; } else setFinished(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível continuar."); }
    finally { setLoading(false); }
  }

  if (finished) return <main className="auth-page"><header className="auth-header"><a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a></header><section className="auth-success"><span><Check /></span><p className="eyebrow">Solicitação concluída</p><h1>Confira seu e-mail</h1><p>{mode === "recuperar" ? "Enviamos as orientações para redefinir sua senha." : "Enviamos o link de confirmação para ativar sua conta ViraVeste."}</p><button onClick={() => { setFinished(false); setMode("login"); }}>Voltar para entrar</button></section></main>;

  return <main className="auth-page">
    <header className="auth-header"><a className="brand" href="/"><span className="brand-cycle"><Leaf /></span><span>ViraVeste<small>Seu armário em movimento.</small></span></a><a href="/"><ArrowLeft /> Voltar ao início</a></header>
    <div className="auth-layout">
      <aside className="auth-story"><p className="eyebrow">Uma comunidade de verdade</p><h1>Seu armário pode começar uma nova história.</h1><p>Entre para comprar, vender e participar de leilões com mais segurança.</p><ul><li><span><ShoppingBag /></span><div><strong>Compre com proteção</strong><small>O pagamento fica protegido até o recebimento.</small></div></li><li><span><Store /></span><div><strong>Venda do seu jeito</strong><small>Anuncie peças e acompanhe seus pedidos.</small></div></li><li><span><ShieldCheck /></span><div><strong>Perfil verificado</strong><small>Mais confiança para toda a comunidade.</small></div></li></ul><small>ViraVeste · Brasil com inspiração francesa</small></aside>
      <section className="auth-card">
        {mode !== "recuperar" && <div className="auth-switch"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Entrar</button><button className={mode === "cadastro" ? "active" : ""} onClick={() => setMode("cadastro")}>Criar conta</button></div>}
        <div className="auth-title"><p className="eyebrow">{mode === "login" ? "Bem-vinda de volta" : mode === "cadastro" ? "Comece seu armário" : "Recuperar acesso"}</p><h2>{mode === "login" ? "Entre na sua conta" : mode === "cadastro" ? "Crie sua conta" : "Esqueceu sua senha?"}</h2><p>{mode === "recuperar" ? "Informe seu e-mail e enviaremos as orientações." : "Seus dados de acesso são protegidos pelo Supabase."}</p></div>
        <form className="auth-form" onSubmit={submit}>
          {mode === "cadastro" && <>
            <label className="full"><span>Nome completo</span><div><UserRound /><input name="full_name" required placeholder="Nome e sobrenome" /></div></label>
            <label><span>Celular</span><input name="phone" required type="tel" placeholder="(00) 00000-0000" /></label><label><span>Cidade</span><input name="city" required placeholder="Sua cidade" /></label>
            <label><span>Estado</span><select name="state" required defaultValue=""><option value="" disabled>UF</option><option>GO</option><option>DF</option><option>MG</option><option>SP</option><option>RJ</option><option>Outro</option></select></label>
            <fieldset className="account-purpose"><legend>Quero usar a ViraVeste para</legend><label><input name="purpose" value="buy" type="checkbox" defaultChecked /><ShoppingBag /> Comprar</label><label><input name="purpose" value="sell" type="checkbox" defaultChecked /><Store /> Vender</label></fieldset>
          </>}
          <label className="full"><span>E-mail</span><div><Mail /><input name="email" required type="email" placeholder="voce@exemplo.com" /></div></label>
          {mode !== "recuperar" && <label className="full"><span>Senha</span><div><LockKeyhole /><input name="password" required type={showPassword ? "text" : "password"} minLength={8} placeholder={mode === "cadastro" ? "Mínimo de 8 caracteres" : "Sua senha"} /><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>}
          {mode === "login" && <div className="auth-options"><label><input type="checkbox" /> Manter conectado</label><button type="button" onClick={() => setMode("recuperar")}>Esqueci minha senha</button></div>}
          {mode === "cadastro" && <label className="auth-consent full"><input required type="checkbox" /><span>Li e aceito os <a href="/politicas">Termos e Políticas</a> e autorizo o tratamento dos dados para criação da conta.</span></label>}
          {error && <p className="auth-error full">{error}</p>}
          <button className="auth-submit full" type="submit" disabled={loading}><LockKeyhole /> {loading ? "Aguarde..." : mode === "login" ? "Entrar com segurança" : mode === "cadastro" ? "Criar minha conta" : "Enviar link de recuperação"}</button>
        </form>
        {mode === "recuperar" && <button className="auth-back" onClick={() => setMode("login")}><ArrowLeft /> Voltar para entrar</button>}
        <div className="auth-demo"><ShieldCheck /><p><strong>Acesso protegido</strong><span>A senha é enviada diretamente ao serviço de autenticação e não é armazenada pelo ViraVeste.</span></p></div>
      </section>
    </div>
  </main>;
}
