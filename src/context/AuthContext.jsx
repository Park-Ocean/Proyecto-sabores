// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Center, Spinner } from "@chakra-ui/react";

// --- CORRECCIÓN 1 ---
// Importamos 'auth' y la función con el nombre correcto: 'getUserProfile'
import { auth, getUserProfile } from "../firebase"; //aqui iba el auth    /auth,getuserprofile

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      //aqui iba el auth auth,  async
      if (user) {
        try {
          // --- CORRECCIÓN 2 ---
          // Usamos la función con el nombre correcto: 'getUserProfile'
          const userProfile = await getUserProfile(user.uid);

          if (userProfile && userProfile.rol) {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: userProfile.rol, // Usamos el campo 'rol' de Firestore
            });
          } else {
            console.error(
              "Usuario logueado, pero no tiene perfil o rol en Firestore."
            );
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error al obtener perfil de usuario", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
