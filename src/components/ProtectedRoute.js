// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Heading, Center } from '@chakra-ui/react';

// Este componente recibe el ROL que tiene permitido el acceso
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, userProfile, isLoading } = useAuth();

  if (isLoading) {
    // No mostrar nada mientras se verifica el usuario (el AuthProvider ya muestra un Spinner)
    return null;
  }

  if (!user) {
    // Si no hay usuario, redirige a /login
    return <Navigate to="/login" replace />;
  }

  // Comprueba si el rol del usuario está en la lista de roles permitidos
  if (allowedRoles && !allowedRoles.includes(userProfile?.rol)) {
    // Usuario logueado pero no tiene el rol correcto
    return (
      <Center h="80vh">
        <Box textAlign="center">
          <Heading as="h2" size="lg">Acceso Denegado</Heading>
          <Box mt={4}>No tienes permiso para ver esta página.</Box>
        </Box>
      </Center>
    );
  }

  // Si todo está bien (logueado y con rol correcto), muestra el contenido de la ruta
  return <Outlet />;
};

export default ProtectedRoute;