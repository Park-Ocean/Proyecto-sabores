// src/components/RutaProtegida.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner, Center } from "@chakra-ui/react";

export default function RutaProtegida({ rolRequerido, children }) {
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
}
