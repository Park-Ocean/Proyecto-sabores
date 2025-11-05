import { Provider } from "@/components/ui/provider"
import { BrowserRouter } from 'react-router-dom';  // Importa BrowserRouter
import React from "react"
import App from "./App"

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)