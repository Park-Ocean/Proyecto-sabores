// src/pages/SuperAdminPanel.jsx
import React, { useState } from "react";
import {
  Box,
  Heading,
  Container,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
} from "@chakra-ui/react";
// Importamos la NUEVA función "llamadora"
import { callCreateUserWithRole } from "../firebase";

const SuperAdminPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("admin"); // Valor por defecto
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Llama a la nube. Esto NO te deslogueará.
      const response = await callCreateUserWithRole(email, password, rol);

      toast({
        title: "Usuario Creado",
        description: response.message, // Mensaje de éxito de la nube
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Limpia el formulario para el siguiente
      setEmail("");
      setPassword("");
    } catch (error) {
      toast({
        title: "Error al crear usuario",
        description: error.message, // Error de la nube (ej. "Permiso denegado")
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6}>Panel de Super Administrador</Heading>

      <Box
        as="form"
        onSubmit={handleSubmit}
        p={8}
        borderWidth={1}
        borderRadius="lg"
      >
        <VStack spacing={4}>
          <Heading size="md">Crear Cuenta de Staff</Heading>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Contraseña Temporal</FormLabel>
            <Input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Rol</FormLabel>
            <Select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="admin">Administrador</option>
              <option value="repartidor">Repartidor</option>
            </Select>
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            width="full"
            mt={4}
          >
            Crear Usuario
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default SuperAdminPanel;