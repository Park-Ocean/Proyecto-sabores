import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Center, Spinner } from "@chakra-ui/react";
// --- PASO 1: Importa 'logout' ---
import { auth, getUserProfile, logout } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true);
          const userRole = idTokenResult.claims.rol;

          if (userRole) {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: userRole,
            });
          } else {
            const userProfile = await getUserProfile(user.uid);
            if (userProfile && userProfile.rol) {
              setCurrentUser({
                uid: user.uid,
                email: user.email,
                role: userProfile.rol,
              });
            } else {
              setCurrentUser(null);
            }
          }
        } catch (error) {
          console.error("Error al obtener token/perfil", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
