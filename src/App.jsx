// src/App.jsx
import { Link, Routes, Route, Navigate } from "react-router-dom";
import {
  Box, Container, HStack, Heading, Spacer, Button, useColorMode,
} from "@chakra-ui/react";
import AdminPanel from "./pages/AdminPanel.jsx";
import LoginPage from "./pages/loginPage.jsx"; 
import ClientePanel from "./pages/clientePage.jsx"; 
import RegisterPage from "./pages/RegisterPage.jsx"; 
import MiCuentaPage from "./pages/MiCuentaPage.jsx";
import SuperAdminPanel from "./pages/SuperAdminPanel.jsx";
// --- COMPONENTE DE AUTENTICACIÓN ---
import RutaProtegida from "./components/RutaProtegida.jsx"; // Añadido
import RepartidorPanel from "./pages/repartidorPage.jsx";
import NavBar from "./components/Navbar.jsx";



function Home() {
  return (
    <Box py={10}>
      <Heading size="lg" mb={2}>Bienvenido</Heading>
      <Box color="gray.500">Landing temporal.</Box>
    </Box>
  );
}

export default function App() {
  return (
    <Container maxW="container.lg" py={4}>
      <NavBar />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas Protegidas por Rol */}
        <Route
          path="/admin"
          element={
            <RutaProtegida rolRequerido="admin">
              <AdminPanel />
            </RutaProtegida>
          }
        />
        <Route
          path="/mi-cuenta"
          element={
            <RutaProtegida rolRequerido={["admin", "cliente", "repartidor"]}>
              <MiCuentaPage />
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
    </Container>
  );
}
