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
} from '@chakra-ui/react';

function MiCuentaPage() {
  // 2. OBTENEMOS LOS DATOS DEL USUARIO ACTUAL
  const { currentUser } = useAuth();

  return (
    <Center w="100%" mt={10}>
      <Box
        w={['full', 'md']} // Responsivo: 'full' en móvil, 'md' en escritorio
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
      >
        <VStack spacing={4}>
          <Heading as="h1" size="lg">
            Mi Cuenta
          </Heading>

          <FormControl>
            <FormLabel>Correo Electrónico</FormLabel>
            {/* TRUCO 1: Mostramos el email real del usuario y lo bloqueamos */}
            <Input
              type="email"
              value={currentUser?.email || ''} // Usamos el email del contexto
              isReadOnly // "solo lectura"
              bg="gray.100" // Fondo gris para que se note que está bloqueado
            />
          </FormControl>

          <FormControl>
            <FormLabel>Nombre (Próximamente)</FormLabel>
            {/* TRUCO 2: Simula otros campos */}
            <Input type="text" placeholder="Tu nombre..." isReadOnly />
          </FormControl>

          <FormControl>
            <FormLabel>Teléfono (Próximamente)</FormLabel>
            <Input type="tel" placeholder="Tu teléfono..." isReadOnly />
          </FormControl>

          {/* TRUCO 3: El botón está deshabilitado como pide el PDF */}
          <Button colorScheme="blue" w="full" mt={4} isDisabled>
            Guardar Cambios (Próximamente)
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}

export default MiCuentaPage;