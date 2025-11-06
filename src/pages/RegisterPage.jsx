// src/pages/RegisterPage.jsx
import React, { useState } from "react";
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
  Text,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
// Importa tu nueva función de registro
import { registerClient } from "../firebase";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Campo extra
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificación de contraseña
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Usamos la nueva función de Francisco/firebase
      await registerClient(email, password);

      toast({
        title: "¡Cuenta creada!",
        description:
          "Tu cuenta ha sido registrada. Ahora puedes iniciar sesión.",
        status: "success",
        duration: 5000,
      });
      navigate("/login"); // Redirige a login después del registro
    } catch (err) {
      toast({
        title: "Error al registrar",
        description: err.message, // Muestra el error de Firebase (ej. "email ya en uso")
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
        <Heading>Crear Cuenta</Heading>
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
        <FormControl isRequired>
          <FormLabel>Confirmar Contraseña</FormLabel>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={loading}
          width="full"
        >
          Registrarse
        </Button>
        <Text>
          ¿Ya tienes cuenta?{" "}
          <Button as={RouterLink} to="/login" variant="link" colorScheme="blue">
            Inicia sesión
          </Button>
        </Text>
      </VStack>
    </Container>
  );
};

export default RegisterPage;
