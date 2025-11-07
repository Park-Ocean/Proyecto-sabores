// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Container } from "@chakra-ui/react";

import NavBar from "./components/Navbar.jsx";

import HomePublic from "./pages/HomePublic.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import LoginPage from "./pages/loginPage.jsx"; 
import ClientePanel from "./pages/clientePage.jsx"; 
import RegisterPage from "./pages/RegisterPage.jsx"; 
import MiCuentaPage from "./pages/MiCuentaPage.jsx";
import SuperAdminPanel from "./pages/SuperAdminPanel.jsx";
// --- COMPONENTE DE AUTENTICACIÓN ---
import RutaProtegida from "./components/RutaProtegida.jsx"; // Añadido
import LoginPage from "./pages/loginPage.jsx"; 
import ClientePanel from "./pages/clientePage.jsx"; 
import RegisterPage from "./pages/RegisterPage.jsx"; 
import MiCuentaPage from "./pages/MiCuentaPage.jsx";
import SuperAdminPanel from "./pages/SuperAdminPanel.jsx";
// --- COMPONENTE DE AUTENTICACIÓN ---
import RutaProtegida from "./components/RutaProtegida.jsx"; // Añadido
import RepartidorPanel from "./pages/repartidorPage.jsx";
import MiCuentaPage from "./pages/MiCuentaPage.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <Container maxW="container.lg" py={4}>
      <NavBar />
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<HomePublic />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protegidas por rol */}
        <Route
          path="/admin"
          element={
            <RutaProtegida rolRequerido="admin">
              <AdminPanel />
            </RutaProtegida>
          }
        />
        <Route
          path="/cliente"
          element={
            <RutaProtegida rolRequerido="cliente">
              <ClientePanel />
            </RutaProtegida>
          }
        />
        <Route
          path="/superadmin"
          element={
            <RutaProtegida rolRequerido="superadmin">
              <SuperAdminPanel />
            </RutaProtegida>
          }
        />
        
        <Route
          path="/repartidor"
          element={
            <RutaProtegida rolRequerido="repartidor">
              <RepartidorPanel />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Footer/>
    </Container>
  );
}
