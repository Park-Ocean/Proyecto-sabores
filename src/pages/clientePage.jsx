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
  Image
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
// ¡Importamos las funciones correctas de Francisco!
import { getPlatosDisponibles, createPedido, logout } from "../firebase";

const ClientePanel = () => {
  const [platos, setPlatos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loadingPlatos, setLoadingPlatos] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(false);

  const { currentUser } = useAuth();
  const toast = useToast();

  // 1. OBTENER PLATOS (Usando getPlatosDisponibles)
  useEffect(() => {
    const fetchPlatos = async () => {
      try {
        // ¡Usamos la nueva función!
        const platosDeDB = await getPlatosDisponibles();
        setPlatos(platosDeDB);
      } catch (error) {
        toast({ title: "Error al cargar el menú", status: "error" });
      }
      setLoadingPlatos(false);
    };
    fetchPlatos();
  }, [toast]);

  // 2. LÓGICA DEL CARRITO (Sin cambios)
  const agregarAlCarrito = (plato) => {
    // La función 'getPlatosDisponibles' ya filtra, pero esta
    // doble verificación (isDisponible) no hace daño.
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

  const calcularTotal = () => {
    return carrito
      .reduce((total, item) => total + item.precio * item.cantidad, 0)
      .toFixed(2);
  };

  // 3. CONFIRMAR PEDIDO (Usando createPedido)
  const handleConfirmarPedido = async () => {
    setLoadingPedido(true);
    const nuevoPedido = {
      clienteId: currentUser.uid,
      clienteEmail: currentUser.email,
      items: carrito,
      total: Number(calcularTotal()),
      estado: "Pendiente", // 'createPedido' lo sobrescribe, pero es bueno tenerlo
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
        <Button onClick={logout} colorScheme="red" variant="outline">
          Salir
        </Button>
      </HStack>

      <HStack spacing={8} align="start">
        <Box flex={3}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            {platos.map((plato) => (
              <Box key={plato.id} borderWidth="1px" borderRadius="lg" p={5}>
                <Image src={plato.imgUrl}></Image>
                <Heading size="md">{plato.nombre}</Heading>
                <Text fontSize="xl" fontWeight="bold" color="blue.600" my={2}>
                  ${plato.precio}
                </Text>
                {/* Como ya filtramos, no necesitamos deshabilitar el botón */}
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
              <HStack key={item.id} justify="space-between">
                <Text>
                  {item.nombre} (x{item.cantidad})
                </Text>
                <Text fontWeight="bold">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </Text>
              </HStack>
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
