// src/App.jsx
import { Link, Routes, Route, Navigate } from "react-router-dom";
import {
  Box, Container, HStack, Heading, Spacer, Button, useColorMode,
} from "@chakra-ui/react";
import AdminPanel from "./pages/AdminPanel.jsx";
import LoginPage from "./pages/loginPage.jsx"; // Añadido
import ClientePanel from "./pages/clientePage.jsx"; // Añadido
// --- COMPONENTE DE AUTENTICACIÓN ---
import RutaProtegida from "./components/RutaProtegida.jsx"; // Añadido

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <HStack as="nav" py={4}>
      <Heading size="md">Sabores</Heading>
      <Spacer />
      <HStack spacing={4}>
        <Button as={Link} to="/" variant="ghost">Inicio</Button>
        <Button as={Link} to="/admin" colorScheme="teal">Admin</Button>
        <Button onClick={toggleColorMode} variant="outline">
          {colorMode === "light" ? "Dark" : "Light"}
        </Button>
      </HStack>
    </HStack>
  );
}

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
      <Navbar />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

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
          path="/cliente"
          element={
            <RutaProtegida rolRequerido="cliente">
              <ClientePanel />
            </RutaProtegida>
          }
        />
        {/* Ruta por defecto: si no coincide nada, redirige a /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Container>
  );
}
