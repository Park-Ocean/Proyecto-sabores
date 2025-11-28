import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Center, Spinner } from "@chakra-ui/react";

import { auth, getUserProfile, logout } from "../firebase.js";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Si hay usuario, escuchamos cambios en su documento de Firestore en tiempo real
        const { doc, onSnapshot } = await import("firebase/firestore");
        const { db } = await import("../firebase.js");

        const userDocRef = doc(db, "usuarios", user.uid);

        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Actualizamos el estado con la data combinada (Auth + Firestore)
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: userData.rol, // Priorizamos el rol de la DB si existe
              saldo: userData.saldo || 0, // ¡Aquí está el saldo!
              ...userData
            });
          } else {
            // Fallback si no existe doc (raro, pero posible)
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: "cliente", // default
              saldo: 0
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Error escuchando cambios del usuario:", error);
          setLoading(false);
        });

      } else {
        // Si no hay usuario (logout), limpiamos
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // --- PASO 2: Añade 'logout' al 'value' ---
  const value = { currentUser, logout };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
