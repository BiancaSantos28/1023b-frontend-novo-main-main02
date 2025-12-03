import { useState, useEffect } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";
import "./Carrinho.css";

type ProdutoCarrinho = {
  produtoId: string;
  nome: string;
  precoUnitario: number; // agora em CENTAVOS
  quantidade: number;
};

export default function Carrinho() {
  const [itens, setItens] = useState<ProdutoCarrinho[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [cupom, setCupom] = useState("");
  const [desconto, setDesconto] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa fazer login para acessar o carrinho!");
      navigate("/login");
      return;
    }

    carregarCarrinho(token);
  }, []);

  async function carregarCarrinho(token: string) {
    try {
      setCarregando(true);
      const res = await api.get("/carrinho", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // CORRIGIDO: NÃO dividir precoUnitario
      setItens(res.data.itens || []);
    } catch {
      alert("Erro ao carregar carrinho. Faça login novamente.");
      navigate("/login");
    } finally {
      setCarregando(false);
    }
  }

  async function alterarQuantidade(produtoId: string, novaQuantidade: number) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.put(
        "/alterarQuantidade",
        { produtoId, novaQuantidade },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItens((prev) =>
        prev.map((item) =>
          item.produtoId === produtoId
            ? { ...item, quantidade: novaQuantidade }
            : item
        )
      );
    } catch {
      alert("Erro ao alterar quantidade.");
    }
  }

  async function removerItem(produtoId: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.post(
        "/removerItem",
        { produtoId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItens((prev) => prev.filter((i) => i.produtoId !== produtoId));
    } catch {
      alert("Erro ao remover item");
    }
  }

  async function limparCarrinho() {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (itens.length === 0) return alert("Seu carrinho já está vazio!");

    const confirmar = window.confirm("Deseja limpar todo o carrinho?");
    if (!confirmar) return;

    try {
      setCarregando(true);

      await api.delete("/limparCarrinho", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItens([]);
      setDesconto(0);
      alert("Carrinho limpo!");
    } finally {
      setCarregando(false);
    }
  }

  // 🔵 FINALIZAR COMPRA – CORRIGIDO
  async function finalizarCompra() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para pagar!");
      return;
    }

    try {
      const res = await api.post(
        "/checkout",
        {
          // ENVIAR PREÇO ORIGINAL EM CENTAVOS
          itens: itens.map((item) => ({
            nome: item.nome,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario, // NÃO dividir aqui
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert("Erro inesperado: Stripe não retornou URL.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar pagamento.");
    }
  }

  // ⭐ cálculos agora usam centavos
  const subtotalCentavos = itens.reduce(
    (acc, item) => acc + item.precoUnitario * item.quantidade,
    0
  );

  const descontoCentavos = desconto;

  const totalFinalCentavos = subtotalCentavos - descontoCentavos;

  function aplicarCupom() {
    if (cupom.toUpperCase() === "SAN10") {
      setDesconto(subtotalCentavos * 0.1); // desconto em centavos
      alert("Cupom aplicado: 10% OFF");
    } else {
      alert("Cupom inválido");
    }
  }

  return (
    <div className="carrinho-wrapper">
      <h1>🛒 Meu Carrinho</h1>

      {carregando && <p>Carregando...</p>}

      {itens.length === 0 ? (
        <div className="carrinho-vazio">
          <p>Seu carrinho está vazio</p>
          <button className="voltar" onClick={() => navigate("/")}>
            ← Continuar Comprando
          </button>
        </div>
      ) : (
        <div className="layout">
          {itens.map((item) => (
            <div key={item.produtoId} className="produto-card">
              <div className="produto-info">
                <h3>{item.nome}</h3>

                {/* EXIBIR PREÇO DIVIDIDO */}
                <p className="preco-unitario">
                  Preço: <strong>R$ {(item.precoUnitario / 100).toFixed(2)}</strong>
                </p>

                <div className="quantidade">
                  <button
                    onClick={() =>
                      item.quantidade > 1 &&
                      alterarQuantidade(item.produtoId, item.quantidade - 1)
                    }
                  >
                    -
                  </button>

                  <span>{item.quantidade}</span>

                  <button
                    onClick={() =>
                      alterarQuantidade(item.produtoId, item.quantidade + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <p className="subtotal">
                  Subtotal:{" "}
                  <strong>
                    R$ {((item.precoUnitario * item.quantidade) / 100).toFixed(2)}
                  </strong>
                </p>

                <button
                  className="remover"
                  onClick={() => removerItem(item.produtoId)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}

          <div className="resumo">
            <h2>Resumo</h2>

            <p>
              Subtotal:{" "}
              <strong>R$ {(subtotalCentavos / 100).toFixed(2)}</strong>
            </p>

            {descontoCentavos > 0 && (
              <p style={{ color: "#00ff88" }}>
                Desconto: -R$ {(descontoCentavos / 100).toFixed(2)}
              </p>
            )}

            <div className="cupom">
              <input
                type="text"
                placeholder="Cupom de desconto"
                value={cupom}
                onChange={(e) => setCupom(e.target.value)}
              />
              <button onClick={aplicarCupom}>Aplicar</button>
            </div>

            <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
              Total:{" "}
              <strong>R$ {(totalFinalCentavos / 100).toFixed(2)}</strong>
            </p>

            <button className="finalizar" onClick={finalizarCompra}>
              Pagar com Cartão 💳
            </button>

            <button className="limpar" onClick={limparCarrinho}>
              Limpar Carrinho
            </button>

            <button className="voltar" onClick={() => navigate("/")}>
              ← Voltar para produtos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
