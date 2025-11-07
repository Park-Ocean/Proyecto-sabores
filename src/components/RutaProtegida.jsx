import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RutaProtegida = ({ children, rolRequerido }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role === "superadmin") {
    return children;
  }

  if (rolRequerido) {
    let tienePermiso = false;

    if (Array.isArray(rolRequerido)) {
      tienePermiso = rolRequerido.includes(currentUser.role);
    } else {
      tienePermiso = currentUser.role === rolRequerido;
    }

    if (!tienePermiso) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default RutaProtegida;
