// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// ¡Importamos la función REAL de Francisco!
import { login } from "../firebase";

const LoginPage = () => {
  const [email, setEmail] = useState("cliente@test.com"); // Valor por defecto para pruebas
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Este efecto redirige al usuario si ya está logueado
  useEffect(() => {
    if (currentUser) {
      navigate(`/${currentUser.role}`);
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Usa la función 'login' de firebase.js
      await login(email, password);
      // Si tiene éxito, el AuthContext detectará el cambio
      // y el 'useEffect' de arriba hará la redirección.
    } catch (err) {
      toast({
        title: "Error de autenticación",
        description: "Email o contraseña incorrectos.",
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  return (
    <Container centerContent>
      <VStack
        as="form"
        onSubmit={handleSubmit}
        spacing={4}
        w="100%"
        maxW="md"
        mt={20}
        p={8}
        borderWidth={1}
        borderRadius="lg"
      >
        <Heading mb={4}>Iniciar Sesión</Heading>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Contraseña</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={loading}
          width="full"
          mt={4}
        >
          Entrar
        </Button>
      </VStack>
    </Container>
  );
};

export default LoginPage;
