// src/pages/AdminPanel.jsx
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Heading,
  List,
  ListItem,
  HStack,
  Text,
  Switch,
  Spinner,
  useToast,
  Divider,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  Link,
  Textarea,
  Image,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  getAllPlatos as getPlatos,
  updateDisponibilidad,
  createPlato,
  deletePlato, // ⬅️ usar función de firebase.js
} from "../firebase.js";

const fmtCLP = (n) =>
  n == null
    ? ""
    : new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(Number(n));

export default function AdminPanel() {
  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(null);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imgurl, setImgurl] = useState("");
  const [disponible, setDisponible] = useState(false);
  const [creando, setCreando] = useState(false);

  // Eliminar
  const [eliminandoId, setEliminandoId] = useState(null);
  const [platoAEliminar, setPlatoAEliminar] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const toast = useToast();

  const cargarPlatos = async () => {
    try {
      const data = await getPlatos();
      const normalizados = (data || []).map((p) => ({
        id: p.id,
        nombre: p.nombre ?? "Plato",
        precio: p.precio ?? null,
        descripcion: p.descripcion ?? "",
        imgurl: p.imgurl ?? "",
        isDisponible: p.isDisponible ?? p.disponible ?? false,
        disponible: p.disponible ?? p.isDisponible ?? false,
      }));
      setPlatos(normalizados);
    } catch (err) {
      toast({
        title: "Error cargando platos",
        description: String(err?.message || err),
        status: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggle = async (platoId, nuevoEstado) => {
    try {
      setActualizando(platoId);
      await updateDisponibilidad(platoId, nuevoEstado);
      setPlatos((prev) =>
        prev.map((p) =>
          p.id === platoId
            ? { ...p, isDisponible: nuevoEstado, disponible: nuevoEstado }
            : p
        )
      );
      toast({ title: "Disponibilidad cambiada", status: "success" });
    } catch (err) {
      toast({
        title: "No se pudo actualizar",
        description: String(err?.message || err),
        status: "error",
      });
    } finally {
      setActualizando(null);
    }
  };

  const onCrear = async (e) => {
    e.preventDefault();
    try {
      setCreando(true);
      const precioNumber = precio === "" ? null : Number(precio);

      const docRef = await createPlato({
        nombre: nombre.trim(),
        precio: precioNumber,
        descripcion,
        imgurl,
        isDisponible: disponible, // en firebase.js también setea 'disponible'
      });

      const nuevo = {
        id: docRef.id,
        nombre: nombre.trim(),
        precio: precioNumber,
        descripcion: descripcion || "",
        imgurl: imgurl || "",
        isDisponible: disponible,
        disponible: disponible,
      };
      setPlatos((prev) => [nuevo, ...prev]);

      setNombre("");
      setPrecio("");
      setDescripcion("");
      setImgurl("");
      setDisponible(false);
      toast({ title: "Plato creado", description: nuevo.nombre, status: "success" });
    } catch (err) {
      toast({
        title: "No se pudo crear",
        description: String(err?.message || err),
        status: "error",
      });
    } finally {
      setCreando(false);
    }
  };

  // --- Eliminar Plato ---
  const pedirConfirmacionEliminar = (plato) => {
    setPlatoAEliminar(plato);
    onOpen();
  };

  const confirmarEliminar = async () => {
    if (!platoAEliminar?.id) return;
    const id = platoAEliminar.id;
    setEliminandoId(id);
    try {
      await deletePlato(id);
      setPlatos((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Plato eliminado",
        description: platoAEliminar.nombre || id,
        status: "success",
      });
    } catch (err) {
      toast({
        title: "No se pudo eliminar",
        description: String(err?.message || err),
        status: "error",
      });
    } finally {
      setEliminandoId(null);
      setPlatoAEliminar(null);
      onClose();
    }
  };

  if (cargando) {
    return (
      <Box p={6}>
        <HStack>
          <Spinner />
          <Text>Cargando platos…</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="900px" mx="auto">
      <HStack justify="space-between" align="center" mb={4}>
        <Heading size="lg">Panel de Administración</Heading>
        <Link as={RouterLink} to="/cliente" color="teal.500" fontWeight="semibold">
          Ir al Home
        </Link>
      </HStack>

      {/* Formulario */}
      <Box as="form" onSubmit={onCrear} p={4} borderWidth="1px" borderRadius="lg" mb={6}>
        <Heading size="md" mb={3}>Crear Nuevo Plato</Heading>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Lomo Saltado"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Precio (opcional)</FormLabel>
            <NumberInput min={0} precision={0}>
              <NumberInputField
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej: 8900"
              />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Descripción</FormLabel>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción del plato"
              rows={3}
            />
          </FormControl>

          <FormControl>
            <FormLabel>URL de imagen</FormLabel>
            <Input
              value={imgurl}
              onChange={(e) => setImgurl(e.target.value)}
              placeholder="https://…"
            />
          </FormControl>

          <HStack justify="space-between">
            <HStack>
              <Switch
                isChecked={disponible}
                onChange={(e) => setDisponible(e.target.checked)}
              />
              <Text>Disponible al crear</Text>
            </HStack>
            <Button type="submit" colorScheme="teal" isLoading={creando} loadingText="Creando…">
              Crear
            </Button>
          </HStack>
        </Stack>
      </Box>

      <Text color="gray.500" mb={4}>Activa/Desactiva la disponibilidad de los platos.</Text>
      <Divider mb={4} />

      {platos.length === 0 ? (
        <Text color="gray.500">No hay platos cargados.</Text>
      ) : (
        <List spacing={4}>
          {platos.map((plato) => (
            <ListItem key={plato.id}>
              <HStack align="flex-start" justify="space-between">
                <HStack align="flex-start" spacing={4}>
                  {plato.imgurl ? (
                    <Image
                      src={plato.imgurl}
                      alt={plato.nombre}
                      boxSize="64px"
                      objectFit="cover"
                      borderRadius="md"
                      fallbackSrc=""
                    />
                  ) : null}
                  <Box>
                    <Text fontWeight="semibold">{plato.nombre}</Text>
                    {plato.precio != null && (
                      <Text fontSize="sm" color="gray.600">
                        {fmtCLP(plato.precio)}
                      </Text>
                    )}
                    {plato.descripcion ? (
                      <Text mt={1} fontSize="sm" color="gray.500" noOfLines={2}>
                        {plato.descripcion}
                      </Text>
                    ) : null}
                  </Box>
                </HStack>

                <HStack>
                  <Text fontSize="sm" mr={2}>
                    {plato.isDisponible ? "Disponible" : "No disponible"}
                  </Text>
                  <Switch
                    isChecked={plato.isDisponible}
                    isDisabled={actualizando === plato.id || eliminandoId === plato.id}
                    onChange={(e) => onToggle(plato.id, e.target.checked)}
                  />
                  <Tooltip label="Eliminar plato" hasArrow>
                    <IconButton
                      aria-label="Eliminar plato"
                      size="sm"
                      ml={2}
                      colorScheme="red"
                      variant="outline"
                      isLoading={eliminandoId === plato.id}
                      onClick={() => pedirConfirmacionEliminar(plato)}
                      icon={
                        // pequeño ícono X sin dependencias externas
                        <Box as="span" fontWeight="bold" lineHeight="0">
                          ×
                        </Box>
                      }
                    />
                  </Tooltip>
                </HStack>
              </HStack>
            </ListItem>
          ))}
        </List>
      )}

      {/* Modal de confirmación de borrado */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          if (!eliminandoId) onClose();
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar plato
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Seguro que quieres eliminar{" "}
              <b>{platoAEliminar?.nombre || "este plato"}</b>? Esta acción no
              se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} isDisabled={!!eliminandoId}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmarEliminar}
                ml={3}
                isLoading={!!eliminandoId}
                loadingText="Eliminando…"
              >
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
