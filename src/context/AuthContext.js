// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChangedHelper, getUserProfile } from '../firebase'; // O la ruta a tu firebase.js
import { Box, Spinner, Center } from '@chakra-ui/react';

// 1. Crear el contexto
const AuthContext = createContext();

// 2. Crear el Proveedor (El componente que envuelve la app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ¡Importante!

  useEffect(() => {
    // onAuthStateChangedHelper nos dice si el usuario está logueado en Firebase
    const unsubscribe = onAuthStateChangedHelper(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // Usuario está logueado
        setUser(firebaseUser);
        
        // Ahora, buscamos su perfil en Firestore para saber su ROL
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        // Usuario no está logueado
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    // Limpiar el observador al desmontar el componente
    return () => unsubscribe();
  }, []);

  // Mientras carga, mostramos un spinner para toda la app
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // 3. Pasamos los valores al resto de la app
  const value = {
    user,
    userProfile,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Hook personalizado (forma fácil de usar el contexto)
export const useAuth = () => {
  return useContext(AuthContext);
};