import React, { useState, useEffect } from 'react';

// 1. IMPORTAMOS LA FUNCIÓN DE FRANCISCO
import { getPedidos } from '../firebase'; // O la ruta correcta a tu firebase.js

import {
  Box,
  Heading,
  VStack,
  Card,
  CardBody,
  Text,
  Spinner,
  Center,
  Badge,
  HStack,
  Divider,
} from '@chakra-ui/react';

function RepartidorPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Corregido 'setlsLoading'
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setIsLoading(true); // Usamos el nombre corregido
        const listaPedidos = await getPedidos(); // Usamos la función de Francisco
        setPedidos(listaPedidos);
      } catch (err) {
        setError("No se pudieron cargar los pedidos.");
        console.error(err);
      } // Se eliminó '};' extra
      setIsLoading(false); // Se movió al final de try/catch
    };

    cargarPedidos();
  }, []);

  if (isLoading) {
    return (
      <Center h="80vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="80vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <Box p={8} maxW="1000px" mx="auto">
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        Panel de Repartidor - Pedidos Pendientes
      </Heading>
      <VStack spacing={6} align="stretch">
        {pedidos.length === 0 ? (
          <Text>No hay pedidos pendientes por ahora.</Text>
        ) : (
          pedidos.map((pedido) => (
            <Card key={pedido.id} variant="outline" shadow="md">
              <CardBody>
                <HStack justify="space-between">
                  
                  {/* --- TAREA 2 (¡YA ESTÁ HECHA AQUÍ!) --- */}
                  {/* Bastián ya guarda el email (Tarea 1) y este código ya lo muestra (Tarea 2) */}
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {/* Corregí 'pedido.cliente Email' a 'pedido.clienteEmail' (no puede tener espacio) */}
                      Cliente: {pedido.clienteEmail || 'No especificado'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      ID Pedido: {pedido.id}
                    </Text>
                  </Box>
                  
                  <Badge
                    colorScheme={pedido.estado === 'Pendiente' ? 'red' : 'green'}
                    fontSize="md"
                    p={2}
                    borderRadius="md"
                  >
                    {pedido.estado}
                  </Badge>
                </HStack>

                <Divider my={4} />

                {/* Lista de Items */}
                <VStack align="stretch" spacing={2} mb={4}>
                  {pedido.items &&
                    pedido.items.map((item) => (
                      <HStack key={item.id} justify="space-between">
                        <Text>
                          ({item.cantidad}) {item.nombre}
                        </Text>
                        <Text>${item.precio * item.cantidad}</Text>
                      </HStack>
                    ))}
                </VStack>

                <Divider my={4} />

                <HStack justify="space-between">
                  <Box>
                    {/* --- TAREA 3 (PREPARADA PARA LUCIANO) --- */}
                    {/* Este es el espacio donde Luciano conectará sus botones */}
                    <Text fontSize="sm" color="gray.500">
                      (Aquí irán los botones de estado)
                    </Text>
                  </Box>
                  <Text fontWeight="bold" fontSize="xl">
                    Total: ${pedido.total}
                  </Text>
                </HStack>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
    </Box>
  );
}

export default RepartidorPanel;