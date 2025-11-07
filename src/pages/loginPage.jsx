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
  Text,
  Grid,
  GridItem,
  HStack,
  Divider,
  Link as ChakraLink,
  Badge,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../firebase";

const Bullet = ({ children, color = "white" }) => (
  <HStack align="start" spacing={3}>
    <Box mt="8px" boxSize="8px" bg={color} borderRadius="full" flexShrink={0} />
    <Text>{children}</Text>
  </HStack>
);

const LoginPage = () => {
  const [email, setEmail] = useState("cliente@sabores.cl");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (currentUser) navigate(`/${currentUser.role}`);
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso.",
        status: "success",
        duration: 2500,
      });
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
    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} minH="100vh" bg="gray.50">
      {/* Izquierda: Formulario */}
      <GridItem>
        <Container maxW="lg" h="100%">
          <Box as="form" onSubmit={handleSubmit} display="flex" alignItems="center" h="100%">
            <VStack
              spacing={5}
              w="100%"
              bg="white"
              p={{ base: 6, md: 10 }}
              borderRadius="2xl"
              boxShadow="xl"
            >
              {/* Volver al inicio */}
              <Button
                as={RouterLink}
                to="/"
                variant="ghost"
                colorScheme="teal"
                alignSelf="start"
                size="sm"
                mb={-2}
              >
                ← Volver al inicio
              </Button>

              <Badge
                alignSelf="start"
                colorScheme="teal"
                bg="teal.50"
                color="teal.700"
                px={3}
                py={1}
                borderRadius="lg"
                fontWeight="semibold"
              >
                Sabores · Cocina con cariño
              </Badge>

              <Heading size="lg" textAlign="left" w="full" color="teal.700">
                Iniciar Sesión
              </Heading>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  focusBorderColor="teal.400"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  focusBorderColor="teal.400"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                isLoading={loading}
                width="full"
                mt={2}
              >
                Entrar
              </Button>

              <HStack w="full" pt={2} justify="space-between" flexWrap="wrap" gap={2}>
                <Text color="gray.600">¿No tienes cuenta?</Text>
                <Button
                  as={RouterLink}
                  to="/register"
                  variant="outline"
                  colorScheme="teal"
                  size="sm"
                >
                  Crear cuenta
                </Button>
              </HStack>

              <Divider />

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Al continuar aceptas nuestros{" "}
                <ChakraLink as={RouterLink} to="/terminos" color="teal.600">
                  Términos
                </ChakraLink>{" "}
                y{" "}
                <ChakraLink as={RouterLink} to="/privacidad" color="teal.600">
                  Políticas de privacidad
                </ChakraLink>.
              </Text>
            </VStack>
          </Box>
        </Container>
      </GridItem>

      {/* Derecha: Hero */}
      <GridItem display={{ base: "none", md: "block" }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          inset={0}
          bgImage={`
            linear-gradient(to right, rgba(56,178,172,0.85), rgba(128,90,213,0.85)),
            url('https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1920&auto=format&fit=crop')
          `}
          bgPos="center"
          bgSize="cover"
        />
        <Box
          position="absolute"
          right={{ base: "-80px", md: "-40px" }}
          top={{ base: "-60px", md: "-40px" }}
          w={{ base: "220px", md: "280px" }}
          h={{ base: "220px", md: "280px" }}
          bg="whiteAlpha.400"
          borderRadius="50%"
          filter="blur(40px)"
        />
        <Box
          position="relative"
          zIndex={1}
          h="100%"
          color="white"
          display="flex"
          alignItems="center"
          px={{ base: 8, lg: 16 }}
          py={{ base: 12, lg: 0 }}
        >
          <VStack align="start" spacing={6} maxW="lg">
            <Badge
              alignSelf="start"
              colorScheme="blackAlpha"
              bg="whiteAlpha.300"
              backdropFilter="auto"
              backdropBlur="4px"
              px={3}
              py={1}
              borderRadius="lg"
              fontWeight="semibold"
            >
              Sabores · Cocina con cariño
            </Badge>

            <Heading size="2xl" lineHeight="1.1">
              Sabores: tu comida favorita a un clic
            </Heading>
            <Text fontSize="lg" opacity={0.95}>
              Inicia sesión para ordenar en segundos, seguir tu pedido y guardar tus favoritos.
              ¡Tenemos algo para cada antojo!
            </Text>

            <VStack align="start" spacing={3} fontSize="md">
              <Bullet color="white">Pedidos rápidos y sin fricción</Bullet>
              <Bullet color="white">Historial y favoritos siempre contigo</Bullet>
              <Bullet color="white">Promos exclusivas para miembros</Bullet>
            </VStack>

            <HStack pt={2} spacing={4}>
              <Button
                as={RouterLink}
                to="/register"
                bg="white"
                color="teal.600"
                _hover={{ bg: "whiteAlpha.800" }}
              >
                Crear cuenta
              </Button>
              <Button
                variant="outline"
                color="white"
                _hover={{ bg: "whiteAlpha.300" }}
                onClick={() => {
                  const emailInput = document.querySelector('input[type="email"]');
                  if (emailInput) emailInput.focus();
                }}
              >
                Ya tengo cuenta
              </Button>
            </HStack>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};
//comentario pancho
export default LoginPage;
