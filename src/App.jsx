import { Link, Routes, Route } from "react-router-dom";
import {
  Box, Container, HStack, Heading, Spacer, Button, useColorMode
} from "@chakra-ui/react";
import AdminPanel from "./pages/AdminPanel.jsx"; // crea este archivo si no existe

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
      <Box color="gray.500">Esta es la landing temporal.</Box>
    </Box>
  );
}

export default function App() {
  return (
    <Container maxW="container.lg" py={4}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Container>
  );
}
