import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import api from "./api/api";

export default function CartaoPagamento() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const pagar = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    const { data } = await api.post("/criar-pagamento-cartao");
    const { clientSecret } = data;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement)!,
      },
    });

    if (result.error) {
      setStatus("Erro: " + result.error.message);
    } else if (result.paymentIntent?.status === "succeeded") {
      setStatus("Pagamento aprovado!");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Pagamento com Cartão</h2>

      <label>Número do cartão</label>
      <CardNumberElement />

      <label>Validade</label>
      <CardExpiryElement />

      <label>CVC</label>
      <CardCvcElement />

      <button onClick={pagar} disabled={loading}>
        {loading ? "Processando..." : "Pagar"}
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}
