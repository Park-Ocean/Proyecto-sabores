import React from 'react';
// 1. IMPORTAMOS EL HOOK DE AUTENTICACIÓN
// (Asegúrate que la ruta a tu AuthContext sea correcta, ej: ../context/AuthContext)
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Center,
  useToast,
} from '@chakra-ui/react';

function MiCuentaPage() {
  const { currentUser } = useAuth();
  const [nombre, setNombre] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [direccion, setDireccion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  // Cargar datos iniciales cuando currentUser cambia
  React.useEffect(() => {
    if (currentUser) {
      setNombre(currentUser.nombre || "");
      setTelefono(currentUser.telefono || "");
      setDireccion(currentUser.direccion || "");
    }
  }, [currentUser]);

  const handleGuardar = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      // Importamos dinámicamente para no ensuciar imports arriba si no se usan
      const { doc, updateDoc } = await import("firebase/firestore");
      const { db } = await import("../firebase.js");

      const userRef = doc(db, "usuarios", currentUser.uid);
      await updateDoc(userRef, {
        nombre,
        telefono,
        direccion
      });

      toast({
        title: "Perfil actualizado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al actualizar",
        description: error.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center w="100%" mt={10} mb={10}>
      <Box
        w={['full', 'md']}
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={4}>
          <Heading as="h1" size="lg">
            Mi Cuenta
          </Heading>

          <FormControl>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              value={currentUser?.email || ''}
              isReadOnly
              bg="gray.100"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Nombre</FormLabel>
            <Input
              type="text"
              placeholder="Tu nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Teléfono</FormLabel>
            <Input
              type="tel"
              placeholder="Tu teléfono..."
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Dirección Predeterminada</FormLabel>
            <Input
              type="text"
              placeholder="Ej: Av. Siempre Viva 123"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </FormControl>

          <Button
            colorScheme="blue"
            w="full"
            mt={4}
            onClick={handleGuardar}
            isLoading={loading}
          >
            Guardar Cambios
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}

export default MiCuentaPage;