import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Carrinho from "./carrinho";
import Login from "./componentes/login/login";
import Pagamento from "./Pagamento";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pagamento" element={<Pagamento />} />
      
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);