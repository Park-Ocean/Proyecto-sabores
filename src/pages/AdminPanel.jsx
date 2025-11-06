// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

// Usamos el renombre para NO modificar src/firebase.js de tu amigo:
import {
  getAllPlatos as getPlatos,
  updateDisponibilidad,
  logout, // ⬅️ importamos logout
} from "../firebase.js";

export default function AdminPanel() {
  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(null);
  const [saliendo, setSaliendo] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getPlatos();
        // Asegura estructura esperada
        const normalizados = (data || []).map((p) => ({
          id: p.id,
          nombre: p.nombre ?? "Plato",
          precio: p.precio ?? null,
          isDisponible: !!p.isDisponible,
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
    })();
  }, [toast]);

  const onToggle = async (platoId, nuevoEstado) => {
    try {
      setActualizando(platoId);
      await updateDisponibilidad(platoId, nuevoEstado);
      setPlatos((prev) =>
        prev.map((p) => (p.id === platoId ? { ...p, isDisponible: nuevoEstado } : p))
      );
      toast({
        title: "Actualizado",
        description: "Disponibilidad cambiada",
        status: "success",
      });
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

  const onLogout = async () => {
    try {
      setSaliendo(true);
      await logout();
      toast({ title: "Sesión cerrada", status: "success" });
      navigate("/"); // ⬅️ cambia a "/login" si esa es tu ruta de ingreso
    } catch (err) {
      toast({
        title: "No se pudo cerrar sesión",
        description: String(err?.message || err),
        status: "error",
      });
    } finally {
      setSaliendo(false);
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
    <Box p={6} maxW="800px" mx="auto">
      <HStack justify="space-between" align="center" mb={4}>
        <Heading size="lg">Panel de Administración</Heading>

        {/* Botón Salir */}
        <Button
          onClick={onLogout}
          colorScheme="red"
          variant="outline"
          isLoading={saliendo}
          loadingText="Saliendo…"
        >
          Salir
        </Button>
      </HStack>

      <Text color="gray.500" mb={4}>
        Activa/Desactiva la disponibilidad de los platos.
      </Text>
      <Divider mb={4} />

      {platos.length === 0 ? (
        <Text color="gray.500">No hay platos cargados.</Text>
      ) : (
        <List spacing={3}>
          {platos.map((plato) => (
            <ListItem key={plato.id}>
              <HStack justify="space-between" align="center">
                <Box>
                  <Text fontWeight="semibold">{plato.nombre}</Text>
                  {plato.precio != null && (
                    <Text fontSize="sm" color="gray.500">
                      $ {Number(plato.precio).toLocaleString()}
                    </Text>
                  )}
                </Box>

                <HStack>
                  <Text fontSize="sm">
                    {plato.isDisponible ? "Disponible" : "No disponible"}
                  </Text>
                  <Switch
                    isChecked={plato.isDisponible}
                    isDisabled={actualizando === plato.id}
                    onChange={(e) => onToggle(plato.id, e.target.checked)}
                  />
                </HStack>
              </HStack>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
