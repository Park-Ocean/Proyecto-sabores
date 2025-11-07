// src/components/RutaProtegida.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner, Center } from "@chakra-ui/react";

export default function RutaProtegida({ rolRequerido, children }) {
  const { currentUser } = useAuth();

  // Si tu AuthProvider ya espera el loading, aquí podemos no renderizar spinner extra.
  if (!currentUser) return <Navigate to="/login" replace />;

  if (rolRequerido && currentUser.role !== rolRequerido) {
    return <Navigate to="/" replace />;
  }

  return children;
}
