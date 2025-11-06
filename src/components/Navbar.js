import React from 'react';
import { Box, Flex, Heading, Link as ChakraLink, Spacer } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom'; // Para la navegación

/**
 * Navbar principal de la aplicación
 * Muestra el logo y los links de navegación
 */
const Navbar = () => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding={4}
      bg="gray.800" // Un fondo oscuro para que sea profesional
      color="white" // Texto blanco
    >
      {/* 1. Título / Logo */}
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={'tighter'}>
          Sabores Web
        </Heading>
      </Flex>

      <Spacer />

      {/* 2. Links de Navegación */}
      <Box>
        {/* Usamos el 'as={RouterLink}' para combinar los estilos de Chakra (ChakraLink)
          con la funcionalidad de 'react-router-dom' (RouterLink) que Bastián configuró.
        */}
        <ChakraLink as={RouterLink} to="/cliente" p={2}>
          Panel Cliente
        </ChakraLink>
        <ChakraLink as={RouterLink} to="/repartidor" p={2}>
          Panel Repartidor
        </ChakraLink>
        <ChakraLink as={RouterLink} to="/admin" p={2}>
          Panel Admin
        </ChakraLink>
        <ChakraLink as={RouterLink} to="/login" p={2} fontWeight="bold">
          Login
        </ChakraLink>
      </Box>
    </Flex>
  );
};

export default Navbar;