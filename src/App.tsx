import "./App.css";
import api from "./api/api";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";


type ProdutoType = {
  _id: string;
  nome: string;
  preco: number;
  urlfoto: string;
  descricao: string;
  categoria?: string;
  estoque?: number;
  avaliacoes?: number;
  vendas?: number;
  criadoEm?: string;
};

function App() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [ordenar, setOrdenar] = useState<"padrao" | "preco-asc" | "preco-desc" | "nome">("padrao");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const tipoUsuario: string = (localStorage.getItem("tipoUsuario") || "")
    .trim()
    .toLowerCase();

  useEffect(() => {
    if (!token) return;
    try {
      const decoded: any = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Token inválido:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchProdutos();

  }, []);

  async function fetchProdutos() {
    setCarregando(true);
    try {
      const res = await api.get("/produtos");
      setProdutos(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setProdutos([]);
    } finally {
      setCarregando(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tipoUsuario");
    navigate("/login");
  }

  async function handleForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      nome: formData.get("nome") as string,
      preco: Number(formData.get("preco")),
      urlfoto: formData.get("urlfoto") as string,
      descricao: formData.get("descricao") as string,
    };

    try {
      const res = await api.post("/produtos", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutos((prev) => [...prev, res.data]);
      form.reset();
    } catch (err: any) {
      alert("Erro ao cadastrar produto: " + (err?.response?.data?.mensagem || err.message));
    }
  }

  async function adicionarCarrinho(produtoId: string) {
    if (!token) {
      alert("Você precisa estar logado para adicionar ao carrinho.");
      navigate("/login");
      return;
    }

    try {
      await api.post(
        "/adicionarItem",
        { produtoId, quantidade: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/carrinho");
    } catch (err: any) {
      alert("Erro ao adicionar: " + (err?.response?.data?.mensagem || err.message));
    }
  }

  async function excluirProduto(produtoId: string) {
    if (!window.confirm("Deseja realmente excluir este produto?")) return;

    try {
      await api.delete(`/produtos/${produtoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutos((prev) => prev.filter((p) => p._id !== produtoId));
    } catch (err: any) {
      alert("Erro ao excluir: " + (err?.response?.data?.mensagem || err.message));
    }
  }

  function irParaCarrinho() {
    if (!token) {
      alert("Você precisa estar logado para acessar o carrinho.");
      navigate("/login");
      return;
    }
    navigate("/carrinho");
  }


  const produtosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    let lista = produtos.filter((p) => {
      if (!q) return true;
      return (
        p.nome.toLowerCase().includes(q) ||
        (p.descricao || "").toLowerCase().includes(q) ||
        (p.categoria || "").toLowerCase().includes(q)
      );
    });

    if (ordenar === "preco-asc") lista = lista.sort((a, b) => a.preco - b.preco);
    if (ordenar === "preco-desc") lista = lista.sort((a, b) => b.preco - a.preco);
    if (ordenar === "nome") lista = lista.sort((a, b) => a.nome.localeCompare(b.nome));

    return lista;
  }, [produtos, query, ordenar]);

  const totalProdutos = produtos.length;

  return (
    <>
      {}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">SanPhone</h1>
            <p className="hero-sub">Celulares, acessórios e ofertas selecionadas para você</p>
          </div>

          <div className="hero-actions">
            <div className="search-wrap" role="search" aria-label="Pesquisar produtos">
              <input
                aria-label="Pesquisar"
                placeholder="Pesquisar por nome, descrição ou categoria..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="controls">
              <select
                aria-label="Ordenar produtos"
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value as any)}
                className="select-ordenar"
              >
                <option value="padrao">Ordenar: Padrão</option>
                <option value="preco-asc">Preço: menor para maior</option>
                <option value="preco-desc">Preço: maior para menor</option>
                <option value="nome">Nome: A → Z</option>
              </select>

              <button className="btn-primario" onClick={() => fetchProdutos()}>
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </section>

      {user && (
        <div className="user-box" role="status" aria-live="polite">
          <div className="user-line">
            <strong>Usuário:</strong> {user.nome || "—"}
          </div>
          <div className="user-line small">{user.tipo || user.tipoUsuario || user.role || "Tipo não informado"}</div>
        </div>
      )}

 
      <header className="main-header">
        <h2 className="sr-only">SanPhone</h2>
        <div className="header-left">
          <button onClick={() => navigate("/")} className="logo-btn">SanPhone</button>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button onClick={() => navigate("/produtos")} className="ghost-btn">Produtos</button>
            <button onClick={irParaCarrinho} className="ghost-btn">Carrinho</button>

            {token ? (
              <button className="danger" onClick={handleLogout}>Sair</button>
            ) : (
              <button onClick={() => navigate("/login")}>Entrar</button>
            )}
          </div>
        </div>
      </header>


      {tipoUsuario === "admin" && (
        <section className="admin-panel">
          <h3>Painel Admin — Cadastrar produto</h3>
          <form onSubmit={handleForm} className="admin-form">
            <input name="nome" placeholder="Nome do produto" required />
            <input name="preco" type="number" placeholder="Preço" required />
            <input name="urlfoto" placeholder="URL da foto" required />
            <input name="descricao" placeholder="Descrição" required />
            <button type="submit">Cadastrar Produto</button>
          </form>
        </section>
      )}

      <main className="container">
        <div className="catalog-header">
          <h2>Catálogo</h2>
          <div className="catalog-meta">
            <span>Total: {totalProdutos}</span>
            <span>Mostrando: {produtosFiltrados.length}</span>
          </div>
        </div>

        {carregando ? (
          <div className="loading">Carregando produtos...</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="empty">Nenhum produto encontrado.</div>
        ) : (
          <section className="grid-produtos" aria-live="polite">
            {produtosFiltrados.map((produto) => (
              <article key={produto._id} className="card">
                <div className="card-img-wrap">
                  <img src={produto.urlfoto} alt={produto.nome} />
                </div>

                <div className="card-body">
                  <h3 className="card-title">{produto.nome}</h3>
                  <p className="card-desc">{produto.descricao}</p>

                  <div className="card-meta">
                    <div className="price">R$ {produto.preco.toFixed(2)}</div>
                    <div className="info">
                      <span>{produto.estoque ?? "—"} em estoque</span>
                      <span>{produto.vendas ?? 0} vendas</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    {token ? (
                      <button onClick={() => adicionarCarrinho(produto._id)}>Adicionar</button>
                    ) : (
                      <button disabled>Login para comprar</button>
                    )}

                    {tipoUsuario === "admin" && (
                      <button className="danger" onClick={() => excluirProduto(produto._id)}>Excluir</button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>SanPhone © {new Date().getFullYear()}</div>
          <div className="footer-links">
            <button className="ghost-btn" onClick={() => navigate("/contato")}>Contato</button>
            <button className="ghost-btn" onClick={() => navigate("/sobre")}>Sobre</button>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
