import { useState, useEffect } from 'react';
import api from "./api/api";
import "./ListaProdutos.css";

type ProdutoType = {
  _id: string;
  nome: string;
  preco: number;
  descricao: string;
  urlfoto: string;
  categoria?: string;
  avaliacao?: number;
  estoque?: number;
};

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.get("/produtos")
      .then((res) => {
        const produtosComExtras = res.data.map((p: ProdutoType) => ({
          ...p,
          categoria: p.categoria || "Smartphone",
          avaliacao: Number(p.avaliacao) || 5,
          estoque: p.estoque || Math.floor(Math.random() * 20) + 1,
        }));
        setProdutos(produtosComExtras);
      })
      .catch(() => setErro("Erro ao carregar produtos"));
  }, []);

  if (erro) return <p>{erro}</p>;

  return (
    <div className="lista-produtos">
      <h1> Produtos disponíveis</h1>

      <div className="container-produtos">
        {produtos.map((produto) => (
          <div key={produto._id} className="produto">

            {/* IMAGEM */}
            <img src={produto.urlfoto} alt={produto.nome} className="produto-img" />

            {/* INFORMAÇÕES */}
            <div className="info">

              <span className="categoria">{produto.categoria}</span>

              <h2>{produto.nome}</h2>

              {/* ⭐ ESTRELAS QUE FUNCIONAM */}
              <div className="avaliacao">
                {"★".repeat(Number(produto.avaliacao) || 0)}
              </div>

              <p className="descricao">{produto.descricao}</p>

              <p className="estoque">
                <strong>Estoque:</strong> {produto.estoque} unidades
              </p>

              <p className="codigo">Código: {produto._id.slice(-6)}</p>

              <p className="parcelamento">
                até <strong>10x de R$ {(produto.preco / 10).toFixed(2)}</strong>
              </p>

              <p className="preco">
                <strong>R$ {produto.preco}</strong>
              </p>
            </div>

            {/* BOTÕES */}
            <div className="acoes">
              <button className="btn-detalhes">Ver detalhes</button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}