// src/pages/ClientePanel.jsx (SIN @chakra-ui/icons)

import React, { useState, useEffect, useMemo } from "react";
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
  Input,
  FormControl,
  FormLabel,
  Select,
  Badge,
  Tag,
  TagLabel,
  Avatar,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stack,
  InputGroup,
  InputLeftElement,
  Textarea,
  Tooltip,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPlatosDisponibles, createPedido } from "../firebase";

// --- Fallback de imagen inline (sin dependencias)
const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#e2e8f0'/>
          <stop offset='100%' stop-color='#cbd5e1'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <g fill='#64748b' font-family='Verdana' font-size='22' text-anchor='middle'>
        <text x='50%' y='50%'>Imagen no disponible</text>
      </g>
    </svg>`
  );

// --- util moneda
const currency = (n) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

// --- Rating con estrellas Unicode (sin íconos)
const StarRating = ({ value = 0 }) => {
  const filled = Math.round(value);
  return (
    <HStack spacing={0.5}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          as="span"
          key={i}
          fontSize="14px"
          color={i <= filled ? "yellow.400" : "gray.300"}
          lineHeight="1"
        >
          ★
        </Box>
      ))}
    </HStack>
  );
};

const ClientePanel = () => {
  const [platos, setPlatos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [direccion, setDireccion] = useState("");
  const [nota, setNota] = useState("");
  const [cupom, setCupom] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("Lo antes posible");
  const [loadingPlatos, setLoadingPlatos] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevancia");
  const [soloDisponibles, setSoloDisponibles] = useState(true);

  const { currentUser } = useAuth();
  const toast = useToast();

  const bgCard = useColorModeValue("white", "gray.800");
  const borderCol = useColorModeValue("gray.200", "gray.700");
  const chipCol = useColorModeValue("purple.50", "purple.900");

  useEffect(() => {
    const fetchPlatos = async () => {
      try {
        const platosDeDB = await getPlatosDisponibles();
        setPlatos(platosDeDB || []);
      } catch (error) {
        toast({ title: "Error al cargar el menú", status: "error" });
      }
      setLoadingPlatos(false);
    };
    fetchPlatos();
  }, [toast]);

  // --- Carrito
  const agregarAlCarrito = (plato) => {
    if (!plato.isDisponible) {
      toast({ title: "Este plato no está disponible", status: "warning", duration: 2000 });
      return;
    }
    setCarrito((prev) => {
      const found = prev.find((i) => i.id === plato.id);
      return found
        ? prev.map((i) => (i.id === plato.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [...prev, { ...plato, cantidad: 1 }];
    });
  };
  const incrementarCantidad = (platoId) =>
    setCarrito((prev) => prev.map((i) => (i.id === platoId ? { ...i, cantidad: i.cantidad + 1 } : i)));
  const decrementarCantidad = (platoId) =>
    setCarrito((prev) =>
      prev
        .map((i) => (i.id === platoId ? { ...i, cantidad: Math.max(0, i.cantidad - 1) } : i))
        .filter((i) => i.cantidad > 0)
    );
  const eliminarProducto = (platoId) => setCarrito((prev) => prev.filter((i) => i.id !== platoId));

  const subtotal = useMemo(() => carrito.reduce((t, i) => t + Number(i.precio) * i.cantidad, 0), [carrito]);
  const descuento = useMemo(() => (!cupom ? 0 : Math.round(subtotal * 0.1)), [cupom, subtotal]);
  const delivery = subtotal > 0 ? 1990 : 0;
  const total = Math.max(subtotal - descuento + delivery, 0);

  // --- Buscar/ordenar/filtrar
  const platosFiltrados = useMemo(() => {
    let data = [...platos];
    if (soloDisponibles) data = data.filter((p) => p.isDisponible);
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (p) =>
          String(p.nombre || "").toLowerCase().includes(q) ||
          String(p.descripcion || "").toLowerCase().includes(q) ||
          String(p.categoria || "").toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "precio-asc":
        data.sort((a, b) => a.precio - b.precio);
        break;
      case "precio-desc":
        data.sort((a, b) => b.precio - a.precio);
        break;
      case "nombre-asc":
        data.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
        break;
      default:
        data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return data;
  }, [platos, query, sortBy, soloDisponibles]);

  // --- Pedido
  const handleConfirmarPedido = async () => {
    if (direccion.trim() === "") {
      toast({ title: "Dirección requerida", description: "Ingresa tu dirección de envío.", status: "warning" });
      return;
    }
    if (carrito.length === 0) {
      toast({ title: "Tu carrito está vacío", status: "info" });
      return;
    }
    setLoadingPedido(true);
    const nuevoPedido = {
      clienteId: currentUser.uid,
      clienteEmail: currentUser.email,
      items: carrito,
      total,
      estado: "Pendiente",
      direccion,
      nota: nota || "",
      horaEntrega,
      cupom: cupom || "",
    };
    try {
      await createPedido(nuevoPedido);
      toast({ title: "¡Pedido realizado con éxito!", status: "success" });
      setCarrito([]);
      setDireccion("");
      setNota("");
      setCupom("");
      setHoraEntrega("Lo antes posible");
    } catch (error) {
      toast({ title: "Error al enviar el pedido", status: "error" });
    }
    setLoadingPedido(false);
  };

  // --- Render
  if (loadingPlatos) {
    return (
      <Center h="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const username = (currentUser?.email || "").split("@")[0];

  return (
    <Container maxW="container.xl" py={6}>
      {/* Header */}
      <HStack justify="space-between" align="center" mb={6}>
        <HStack spacing={4}>
          <Avatar name={currentUser?.email} />
          <Box>
            <Heading size="md">¡Hola, {username || currentUser?.email}!</Heading>
            <HStack spacing={3} mt={1}>
              <Tag colorScheme="purple" variant="subtle" size="sm">
                <TagLabel>Nivel: Foodie</TagLabel>
              </Tag>
              <Tag colorScheme="green" variant="subtle" size="sm">
                <TagLabel>Puntos: 120</TagLabel>
              </Tag>
            </HStack>
          </Box>
        </HStack>

        <Tooltip label="Volver al inicio">
          <Button as={RouterLink} to="/" variant="ghost">
            ← Inicio
          </Button>
        </Tooltip>
      </HStack>

      {/* Filtros */}
      <HStack spacing={4} align="center" mb={5} flexWrap="wrap">
        <InputGroup maxW="360px">
          <InputLeftElement pointerEvents="none">
            <Text aria-hidden>🔍</Text>
          </InputLeftElement>
          <Input
            placeholder="Buscar por nombre, descripción o categoría..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <FormControl maxW="220px">
          <FormLabel fontSize="sm" mb={1}>
            Ordenar por
          </FormLabel>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="nombre-asc">Nombre (A-Z)</option>
          </Select>
        </FormControl>

        <Button onClick={() => setSoloDisponibles((s) => !s)} variant={soloDisponibles ? "solid" : "outline"} colorScheme="teal">
          {soloDisponibles ? "Solo disponibles" : "Todos los platos"}
        </Button>
      </HStack>

      <HStack align="start" spacing={8}>
        {/* Platos */}
        <Box flex={3}>
          {platosFiltrados.length === 0 ? (
            <Center borderWidth="1px" borderRadius="lg" p={10} borderColor={borderCol}>
              <VStack spacing={4}>
                <Image
                  src={plato.imgurl} // <-- CORRECTO
                  alt={plato.nombre}
                  objectFit="cover"
                  w="100%"
                  h="170px"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_SVG;
                  }}
                />
                <Heading size="md">No hay platos para mostrar</Heading>
                <Text color="gray.500" textAlign="center">
                  Cambia la búsqueda o muestra platos no disponibles.
                </Text>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} spacing={6}>
              {platosFiltrados.map((plato) => (
                <Card
                  key={plato.id}
                  bg={bgCard}
                  borderWidth="1px"
                  borderColor={borderCol}
                  rounded="xl"
                  _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 0.2s ease"
                >
                  <CardHeader pb={0}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1}>
                        <Heading size="sm" noOfLines={1}>
                          {plato.nombre}
                        </Heading>
                        <HStack>
                          <StarRating value={plato.rating || 4} />
                          <Text fontSize="xs" color="gray.500">
                            {plato.rating ? Number(plato.rating).toFixed(1) : "4.0"}
                          </Text>
                        </HStack>
                      </VStack>
                      <Badge colorScheme={plato.isDisponible ? "green" : "red"}>
                        {plato.isDisponible ? "Disponible" : "Agotado"}
                      </Badge>
                    </HStack>
                  </CardHeader>

                  <CardBody pt={3} pb={2}>
                    <Box borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor={borderCol}>
                      <Image
                        src={plato.imgurl}
                        alt={plato.nombre}
                        objectFit="cover"
                        w="100%"
                        h="170px"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_SVG;
                        }}
                      />
                    </Box>
                    <Text mt={3} fontSize="sm" color="gray.600" noOfLines={2}>
                      {plato.descripcion || "Delicioso plato de la casa."}
                    </Text>
                    <HStack mt={3} justify="space-between">
                      <HStack>
                        {plato.categoria && (
                          <Tag size="sm" bg={chipCol} color="purple.600">
                            <TagLabel>{plato.categoria}</TagLabel>
                          </Tag>
                        )}
                      </HStack>
                      <Text fontWeight="bold">{currency(plato.precio)}</Text>
                    </HStack>
                  </CardBody>

                  <CardFooter pt={0}>
                    <Button w="full" colorScheme="blue" onClick={() => agregarAlCarrito(plato)} isDisabled={!plato.isDisponible}>
                      Añadir
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Carrito */}
        <Box
          flex={1}
          p={5}
          borderWidth="1px"
          borderRadius="xl"
          position="sticky"
          top={6}
          h="fit-content"
          bg={bgCard}
          borderColor={borderCol}
          minW={{ base: "full", md: "340px" }}
        >
          <Heading size="md" mb={3}>
            Tu pedido
          </Heading>

          <VStack spacing={3} align="stretch" mb={4} minH="80px">
            {carrito.length === 0 && (
              <Box borderWidth="1px" borderRadius="md" p={4} borderColor={borderCol}>
                <Text color="gray.500">Agrega platos al carrito.</Text>
              </Box>
            )}

            {carrito.map((item) => (
              <Box key={item.id} borderWidth="1px" p={3} borderRadius="md" borderColor={borderCol}>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" noOfLines={1} maxW="180px">
                      {item.nombre}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {currency(item.precio)} c/u
                    </Text>
                  </VStack>

                  <HStack>
                    <Tooltip label="Quitar uno">
                      <Button size="xs" onClick={() => decrementarCantidad(item.id)} variant="ghost">
                        −
                      </Button>
                    </Tooltip>
                    <Text fontWeight="bold" w="20px" textAlign="center">
                      {item.cantidad}
                    </Text>
                    <Tooltip label="Agregar uno">
                      <Button size="xs" onClick={() => incrementarCantidad(item.id)} variant="ghost">
                        +
                      </Button>
                    </Tooltip>
                  </HStack>
                </HStack>

                <HStack justify="space-between" mt={2}>
                  <Tag size="sm" colorScheme="gray" variant="subtle">
                    {(item.categoria && <TagLabel>{item.categoria}</TagLabel>) || <TagLabel>Plato</TagLabel>}
                  </Tag>
                  <Text fontWeight="bold">{currency(item.precio * item.cantidad)}</Text>
                </HStack>

                <HStack justify="flex-end" mt={2}>
                  <Button size="xs" colorScheme="red" variant="outline" onClick={() => eliminarProducto(item.id)}>
                    Eliminar
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>

          <Divider my={3} />

          <FormControl mt={3} isRequired>
            <FormLabel>Dirección de envío</FormLabel>
            <Input placeholder="Ej: Av. Siempre Viva 123" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </FormControl>

          <FormControl mt={3}>
            <FormLabel>Nota para el restaurante (opcional)</FormLabel>
            <Textarea
              placeholder="Ej: Sin cilantro, timbre en portería."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
            />
          </FormControl>

          <FormControl mt={3}>
            <FormLabel>Hora de entrega</FormLabel>
            <Select value={horaEntrega} onChange={(e) => setHoraEntrega(e.target.value)}>
              <option>Lo antes posible</option>
              <option>En 30 minutos</option>
              <option>En 1 hora</option>
              <option>Programar para hoy 20:00</option>
            </Select>
          </FormControl>

          <FormControl mt={3}>
            <FormLabel>Código promocional</FormLabel>
            <Input placeholder="Ej: SABORES10" value={cupom} onChange={(e) => setCupom(e.target.value.toUpperCase())} />
          </FormControl>

          <Stack spacing={1} my={4} fontSize="sm">
            <HStack justify="space-between">
              <Text color="gray.600">Subtotal</Text>
              <Text>{currency(subtotal)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Descuento</Text>
              <Text>-{currency(descuento)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Delivery</Text>
              <Text>{currency(delivery)}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" fontWeight="bold">
              <Text>Total</Text>
              <Text>{currency(total)}</Text>
            </HStack>
          </Stack>

          <Button colorScheme="green" width="full" onClick={handleConfirmarPedido} isLoading={loadingPedido} isDisabled={carrito.length === 0}>
            Confirmar pedido
          </Button>
        </Box>
      </HStack>

      {/* FAB Inicio */}
      <Button position="fixed" bottom={{ base: 6, md: 8 }} right={{ base: 6, md: 8 }} borderRadius="full" size="lg" as={RouterLink} to="/" shadow="lg" colorScheme="teal">
        ← Inicio
      </Button>
    </Container>
  );
};

export default ClientePanel;
