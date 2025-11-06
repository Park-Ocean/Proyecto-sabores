// src/components/RutaProtegida.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RutaProtegida = ({ children, rolRequerido }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // 1. Si no hay usuario, redirige a login
    return <Navigate to="/login" replace />;
  }

  if (rolRequerido && currentUser.role !== rolRequerido) {
    // 2. Si hay usuario pero no tiene el rol, redirige a login
    // (Opcionalmente, puedes redirigir a una página de "No Autorizado")
    return <Navigate to="/login" replace />;
  }

  // 3. Si todo está bien, muestra la página solicitada
  return children;
};

export default RutaProtegida;
