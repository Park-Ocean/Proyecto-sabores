// src/context/AuthContext.jsx
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile && userProfile.rol) {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: userProfile.rol,
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
