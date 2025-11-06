import React from 'react';
import { useAuth } from '../context/AuthContext'; // Importa el hook que creaste
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Spacer,
  Link,
  Text,
  HStack,
} from '@chakra-ui/react';

function NavBar() {
  // 1. CONSUMIR EL CONTEXTO
  // Obtenemos los datos que tu AuthProvider nos está dando:
  // - currentUser (para saber quién está logueado y su 'role')
  // - logout (la función para cerrar sesión)
  const { currentUser, logout } = useAuth();
  
  const navigate = useNavigate();

  // 2. HANDLER PARA EL BOTÓN DE LOGOUT
  const handleLogout = async () => {
    try {
      await logout(); // Llama a la función 'logout' del contexto
      navigate('/login'); // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Opcional: Mostrar un toast de error aquí
    }
  };

  return (
    <Flex
      as="nav"
      p={4}
      bg="white"
      alignItems="center"
      shadow="sm"
      borderBottomWidth="1px"
    >
      <Heading as="h1" size="md" color="blue.600">
        Sabores App
      </Heading>

      {/* 3. LINKS CONDICIONALES BASADOS EN EL ROL */}
      {/* Usamos 'currentUser?.role' para mostrar los links solo si el
          usuario está logueado Y tiene el rol correcto */}
      <HStack as="nav" spacing={4} ml={8}>
        {currentUser?.role === 'admin' && (
          <Link as={RouterLink} to="/admin" fontWeight="bold">
            Admin
          </Link>
        )}
        {currentUser?.role === 'cliente' && (
          <Link as={RouterLink} to="/cliente" fontWeight="bold">
            Mi Pedido
          </Link>
        )}
        {currentUser?.role === 'repartidor' && (
          <Link as={RouterLink} to="/repartidor" fontWeight="bold">
            Repartos
          </Link>
        )}
      </HStack>

      <Spacer />

      {/* 4. BOTÓN DE LOGOUT CONDICIONAL */}
      {/* Solo mostramos esto si 'currentUser' NO es null */}
      {currentUser ? (
        <Flex alignItems="center">
          <Text fontSize="sm" mr={4} color="gray.600">
            {currentUser.email} (**{currentUser.role}**)
          </Text>
          <Button
            colorScheme="red"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </Flex>
      ) : (
        // Si no hay usuario, no mostramos nada
        null
      )}
    </Flex>
  );
}

export default NavBar;