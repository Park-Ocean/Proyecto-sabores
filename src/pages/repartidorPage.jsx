import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Spinner,
  Divider,
  Badge,
  ButtonGroup,
  Button,
  useToast,
  Card,
  CardBody,
  Stack,
} from "@chakra-ui/react";
import { getPedidos, updatePedidoEstado } from "../firebase";

export default function RepartidorPanel() {
  const [cargando, setCargando] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [actualizando, setActualizando] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getPedidos(); // fetch puntual (getDocs)
        if (alive) setPedidos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setCargando(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cambiarEstado = async (pedidoId, nuevo) => {
    try {
      setActualizando(pedidoId);
      await updatePedidoEstado(pedidoId, nuevo);
      // Como es fetch (no onSnapshot), reflejamos en memoria:
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, estado: nuevo } : p))
      );
      toast({
        title: "Estado actualizado",
        description: `Ahora: ${nuevo}`,
        status: "success",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "No se pudo actualizar",
        description: String(e?.message || e),
        status: "error",
      });
    } finally {
      setActualizando(null);
    }
  };

  const colorEstado = (estado) => {
    const e = String(estado || "").toLowerCase();
    if (e.includes("entregado")) return "green";
    if (e.includes("camino")) return "blue";
    if (e.includes("pendiente")) return "gray";
    return "purple";
    };

  if (cargando) {
    return (
      <Box p={6}>
        <HStack>
          <Spinner />
          <Text>Cargando pedidos…</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="1000px" mx="auto">
      <HStack justify="space-between" mb={4}>
        <Heading size="lg">Panel del Repartidor</Heading>
        <Text color="gray.500">Actualiza el estado de los pedidos.</Text>
      </HStack>
      <Divider mb={4} />

      {pedidos.length === 0 ? (
        <Text color="gray.500">No hay pedidos por ahora.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} variant="outline">
              <CardBody>
                <Stack spacing={3}>
                  <HStack justify="space-between" align="start">
                    <Box>
                      <HStack spacing={3}>
                        <Text fontWeight="bold">
                          Pedido #{pedido.id?.slice?.(-6) || pedido.id}
                        </Text>
                        <Badge colorScheme={colorEstado(pedido.estado)}>
                          {pedido.estado || "Pendiente"}
                        </Badge>
                      </HStack>
                      {pedido.clienteEmail && (
                        <Text fontSize="sm" color="gray.600">
                          Cliente: {pedido.clienteEmail}
                        </Text>
                      )}
                    </Box>

                    {/* Botones de estado */}
                    <ButtonGroup size="sm" isAttached>
                      <Button
                        variant="outline"
                        onClick={() => cambiarEstado(pedido.id, "En Camino")}
                        isLoading={actualizando === pedido.id}
                      >
                        En Camino
                      </Button>
                      <Button
                        colorScheme="green"
                        onClick={() => cambiarEstado(pedido.id, "Entregado")}
                        isLoading={actualizando === pedido.id}
                      >
                        Entregado
                      </Button>
                    </ButtonGroup>
                  </HStack>

                  {/* Detalle (opcional) */}
                  {Array.isArray(pedido.items) && pedido.items.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={1}>
                        Detalle
                      </Text>
                      <VStack align="stretch" spacing={1}>
                        {pedido.items.map((it, i) => (
                          <HStack key={i} justify="space-between">
                            <Text>
                              {it?.nombre || "Item"}{" "}
                              {it?.cantidad ? `x${it.cantidad}` : ""}
                            </Text>
                            {it?.precio != null && (
                              <Text color="gray.600">
                                ${Number(it.precio).toLocaleString()}
                              </Text>
                            )}
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  <HStack justify="space-between" pt={2}>
                    <Box />
                    <Text fontWeight="bold" fontSize="lg">
                      Total: $
                      {pedido?.total != null
                        ? Number(pedido.total).toLocaleString()
                        : "—"}
                    </Text>
                  </HStack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
}
