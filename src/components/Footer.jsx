import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box
      as="footer"
      mt={8} // Margen superior para separarlo del contenido
      
      // --- Estilos tomados del "Hero" de HomePublic.jsx ---
      p={{ base: 6, md: 8 }} // Usamos un padding similar al Hero
      bgGradient="linear(to-r, teal.500, purple.500)" // El gradiente
      color="white" // Texto blanco
      borderRadius="2xl" // Bordes redondeados
      // --- Fin de estilos tomados ---
      
      textAlign="center" // Mantenemos tu centrado original
    >
      <Text fontSize="sm" opacity={0.95}> {/* Usamos la opacidad del Hero */}
        © {new Date().getFullYear()} Sabores Web. Todos los derechos reservados.
      </Text>
    </Box>
  );
};

export default Footer;