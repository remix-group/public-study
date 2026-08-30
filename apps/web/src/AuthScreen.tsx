import { useState, type FormEvent } from "react";
import { login, register } from "./api";
import type { AuthStudent } from "./types";

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (student: AuthStudent) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@dian-study.local");
  const [password, setPassword] = useState("EstudioDIAN2026!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = mode === "login" ? await login(email, password) : await register(name, email, password);
      onAuthenticated(result.student);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible completar el acceso.");
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-page">
      <section className="auth-message">
        <div className="eyebrow">Tu progreso es personal</div>
        <h1>Estudia con continuidad.<br/><em>Vuelve con propósito.</em></h1>
        <p>Tu cuenta conserva sesiones, errores, dominio y revisiones para que cada práctica parta de lo que ya aprendiste.</p>
        <div className="auth-proof"><span>✓</span> Contraseña protegida con derivación criptográfica</div>
        <div className="auth-proof"><span>✓</span> Sesión privada y revocable</div>
      </section>
      <section className="auth-card">
        <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Ingresar</button><button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setEmail(""); setPassword(""); }}>Crear cuenta</button></div>
        <h2>{mode === "login" ? "Bienvenido de nuevo" : "Crea tu espacio de estudio"}</h2>
        <p>{mode === "login" ? "Continúa desde donde quedaste." : "Tu progreso quedará separado y protegido."}</p>
        <form onSubmit={submit}>
          {mode === "register" && <label>Nombre completo<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required autoComplete="name"/></label>}
          <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email"/></label>
          <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required autoComplete={mode === "login" ? "current-password" : "new-password"}/></label>
          {error && <div className="alert" role="alert">{error}</div>}
          <button className="button primary wide" disabled={busy}>{busy ? "Procesando…" : mode === "login" ? "Ingresar" : "Crear cuenta"}</button>
        </form>
        {mode === "login" && <div className="demo-credentials"><strong>Acceso de demostración</strong><span>demo@dian-study.local</span><span>EstudioDIAN2026!</span></div>}
      </section>
    </main>
  );
}
