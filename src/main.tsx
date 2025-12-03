import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './componentes/login/login.tsx'
import Erro from './componentes/erro/erro.tsx'
import Carrinho from './carrinho.tsx' 
import ListaProdutos from './ListaProdutos.tsx'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CartaoPagamento from './CartaoPagamento.tsx'

const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); // sua chave pública

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/error" element={<Erro />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/produtos" element={<ListaProdutos />} />
         <Route path="/finalizar-compra" element={ <Elements stripe={stripe}><CartaoPagamento/></Elements>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
