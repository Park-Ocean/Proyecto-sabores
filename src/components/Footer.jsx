import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box
      as="footer"
      mt={8} // Margen superior para separarlo del contenido
      py={4} // Padding vertical
      bg="gray.800" // Mismo color que el Navbar para consistencia
      color="white" // Texto blanco
      textAlign="center"
    >
      <Text fontSize="sm" color="gray.400">
        © {new Date().getFullYear()} Sabores Web. Todos los derechos reservados.
      </Text>
    </Box>
  );
};

export default Footer;