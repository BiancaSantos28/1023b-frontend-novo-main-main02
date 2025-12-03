import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await api.post("/login", { email, senha });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("tipoUsuario", res.data.tipo);

      navigate("/");
    } catch (error: any) {
      alert(error?.response?.data?.mensagem || "Erro ao fazer login");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="logo-title">SanPhone</h1>
        <p className="login-subtitle">Bem-vindo à loja SanPhone</p>
        

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button type="submit">Entrar</button>
        </form>

        <p className="login-extra">
          Não tem conta? Fale com o administrador.
        </p>
      </div>
    </div>
  );
}

export default Login;
