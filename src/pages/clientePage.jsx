// src/pages/ClientePanel.jsx (TAREA 1 Corregida, SIN ICONOS)

import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  SimpleGrid,
  Box,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Spinner,
  Center,
  Divider,
  Image,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { getPlatosDisponibles, createPedido } from "../firebase";

const ClientePanel = () => {
  const [platos, setPlatos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loadingPlatos, setLoadingPlatos] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(false);

  const { currentUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchPlatos = async () => {
      try {
        const platosDeDB = await getPlatosDisponibles();
        setPlatos(platosDeDB);
      } catch (error) {
        toast({ title: "Error al cargar el menú", status: "error" });
      }
      setLoadingPlatos(false);
    };
    fetchPlatos();
  }, [toast]);

  // --- TAREA 1: LÓGICA DE CARRITO REFACTORIZADA ---
  const agregarAlCarrito = (plato) => {
    if (!plato.isDisponible) {
      toast({
        title: "Este plato no está disponible",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setCarrito((prevCarrito) => {
      const itemExistente = prevCarrito.find((item) => item.id === plato.id);
      if (itemExistente) {
        return prevCarrito.map((item) =>
          item.id === plato.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        return [...prevCarrito, { ...plato, cantidad: 1 }];
      }
    });
  };

  const incrementarCantidad = (platoId) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) =>
        item.id === platoId ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  };

  const decrementarCantidad = (platoId) => {
    setCarrito((prevCarrito) =>
      prevCarrito
        .map((item) =>
          item.id === platoId
            ? { ...item, cantidad: Math.max(0, item.cantidad - 1) }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarProducto = (platoId) => {
    setCarrito((prevCarrito) =>
      prevCarrito.filter((item) => item.id !== platoId)
    );
  };

  const calcularTotal = () => {
    return carrito
      .reduce((total, item) => total + item.precio * item.cantidad, 0)
      .toFixed(2);
  };

  const handleConfirmarPedido = async () => {
    setLoadingPedido(true);
    const nuevoPedido = {
      clienteId: currentUser.uid,
      clienteEmail: currentUser.email,
      items: carrito,
      total: Number(calcularTotal()),
      estado: "Pendiente",
    };

    try {
      await createPedido(nuevoPedido);
      toast({ title: "¡Pedido realizado con éxito!", status: "success" });
      setCarrito([]);
    } catch (error) {
      toast({ title: "Error al enviar el pedido", status: "error" });
    }
    setLoadingPedido(false);
  };

  // --- RENDERIZADO ---
  if (loadingPlatos) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <HStack justify="space-between" mb={6}>
        <Heading>Hola, {currentUser.email}! Elige tu menú:</Heading>
      </HStack>

      <HStack spacing={8} align="start">
        {/* Columna de Platos (Sin cambios) */}
        <Box flex={3}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            {platos.map((plato) => (
              <Box key={plato.id} borderWidth="1px" borderRadius="lg" p={5}>
                <Image src={plato.imgUrl}></Image>
                <Heading size="md">{plato.nombre}</Heading>
                <Text fontSize="xl" fontWeight="bold" color="blue.600" my={2}>
                  ${plato.precio}
                </Text>
                <Button
                  w="full"
                  colorScheme="blue"
                  onClick={() => agregarAlCarrito(plato)}
                >
                  Añadir
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* --- TAREA 1: Columna de Carrito (RENDERIZADO ACTUALIZADO SIN ICONOS) --- */}
        <Box
          flex={1}
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          position="sticky"
          top={10}
        >
          <Heading size="lg" mb={4}>
            Tu Pedido
          </Heading>
          <VStack spacing={4} align="stretch" mb={6} minH="100px">
            {carrito.length === 0 && <Text>Agrega platos al carrito.</Text>}

            {carrito.map((item) => (
              <Box
                key={item.id}
                borderWidth="1px"
                p={2}
                borderRadius="md"
                w="100%"
              >
                <HStack justify="space-between">
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    isTruncated
                    maxW="150px"
                  >
                    {item.nombre}
                  </Text>
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => eliminarProducto(item.id)}
                  >
                    X
                  </Button>
                </HStack>
                <HStack justify="space-between" mt={2}>
                  <HStack>
                    <Button
                      size="xs"
                      onClick={() => decrementarCantidad(item.id)}
                    >
                      -
                    </Button>
                    <Text fontWeight="bold">{item.cantidad}</Text>
                    <Button
                      size="xs"
                      onClick={() => incrementarCantidad(item.id)}
                    >
                      +
                    </Button>
                  </HStack>
                  <Text fontWeight="bold" fontSize="sm">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </Text>{" "}
                  {/* <-- LÍNEA CORREGIDA */}
                </HStack>
              </Box>
            ))}
          </VStack>
          <Divider />
          <HStack justify="space-between" my={4}>
            <Heading size="md">Total:</Heading>
            <Heading size="md">${calcularTotal()}</Heading>
          </HStack>
          <Button
            colorScheme="green"
            width="full"
            onClick={handleConfirmarPedido}
            isLoading={loadingPedido}
            isDisabled={carrito.length === 0}
          >
            Confirmar Pedido
          </Button>
        </Box>
      </HStack>
    </Container>
  );
};

export default ClientePanel;
