import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { preparePwa } from "./pwa";
import './index.css'

preparePwa();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
