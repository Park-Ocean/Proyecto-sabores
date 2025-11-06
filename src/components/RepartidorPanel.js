import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Card,
  CardHeader,
  CardBody,
  VStack, // Usaremos esto para apilar los pedidos
  Alert,
  AlertIcon
} from '@chakra-ui/react';

// 1. IMPORTAMOS TU FUNCIÓN (TAREA 2)
// Asumiendo que RepartidorPanel.js está en 'src/components/'
// y firebase.js está en 'src/'
import { getPedidos } from '../firebase';

const RepartidorPanel = () => {
  // 2. ESTADOS
  // 'pedidos' guardará la lista que viene de Firebase
  // 'loading' nos sirve para mostrar un ícono de carga
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. USE EFFECT: Se ejecuta 1 VEZ cuando el componente carga
  useEffect(() => {
    // Definimos una función interna async para poder usar 'await'
    const cargarPedidos = async () => {
      try {
        setLoading(true);
        const data = await getPedidos(); // ¡Aquí usamos la función de Francisco!
        setPedidos(data); // Guardamos los pedidos en nuestro estado
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      } finally {
        setLoading(false); // Terminamos la carga (incluso si hubo error)
      }
    };

    cargarPedidos();
  }, []); // El [] vacío asegura que esto se ejecute solo una vez

  // 4. RENDER (VISTA)
  
  // Si 'loading' es true, mostramos un Spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  // Si no hay pedidos, mostramos un mensaje amigable
  if (pedidos.length === 0) {
    return (
      <Box p={4}>
        <Heading as="h1" mb={6}>
          Panel de Repartidor
        </Heading>
        <Alert status="info">
          <AlertIcon />
          No hay pedidos pendientes por ahora.
        </Alert>
      </Box>
    );
  }

  // 5. RENDER CON DATOS (TAREA 3)
  // Si hay pedidos, los mostramos
  return (
    <Box p={4}>
      <Heading as="h1" mb={6}>
        Panel de Repartidor - Pedidos Pendientes
      </Heading>

      <VStack spacing={4} align="stretch">
        {pedidos.map((pedido) => (
          // Usamos Card y Box de Chakra UI
          <Card key={pedido.id} variant="outline">
            <CardHeader>
              {/* El 'id' viene de Firebase (ej: 4aT... ) */}
              <Heading size="md">Pedido #{pedido.id}</Heading>
            </CardHeader>
            <CardBody>
              {/* Estos nombres de campos (clienteId, total, items) deben coincidir 
                con lo que Bastián guarda al usar 'createPedido'. 
                Revisé el 'firebase.js' y Bastián probablemente guarde 'items' y 'total'.
              */}
              <Text><strong>Cliente ID:</strong> {pedido.clienteId || 'No especificado'}</Text>
              <Text><strong>Total:</strong> ${pedido.total || 0}</Text>
              <Text><strong>Estado:</strong> {pedido.estado || 'Pendiente'}</Text>
              <Text><strong>Dirección:</strong> {pedido.direccionEntrega || 'Dirección no especificada'}</Text>
              
              <Heading size="sm" mt={3}>Items:</Heading>
              {/* El campo 'items' que guarda Bastián es un array.
                Lo recorremos para mostrar cada plato.
              */}
              {Array.isArray(pedido.items) ? (
                pedido.items.map((item, index) => (
                  <Text key={index} ml={4}>
                    - {item.nombre} (Cantidad: {item.cantidad})
                  </Text>
                ))
              ) : (
                <Text>No se pudieron cargar los items.</Text>
              )}
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
};

export default RepartidorPanel;