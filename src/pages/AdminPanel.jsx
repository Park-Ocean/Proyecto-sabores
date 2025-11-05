// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import {
    Box, Heading, List, ListItem, HStack, Text, Switch,
    Spinner, useToast, Divider
} from "@chakra-ui/react";
import { getPlatos, updateDisponibilidad } from "../firebase"; // ajusta la ruta real

export default function AdminPanel() {
    const [platos, setPlatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(null); // platoId en actualización
    const toast = useToast();

    useEffect(() => {
        (async () => {
            try {
                const data = await getPlatos();
                // Normaliza: asegúrate de que cada item tenga { id, nombre, precio, isDisponible }
                setPlatos(data || []);
            } catch (err) {
                toast({ title: "Error cargando platos", description: String(err), status: "error" });
            } finally {
                setCargando(false);
            }
        })();
    }, [toast]);

    const onToggle = async (platoId, nuevoEstado) => {
        try {
            setActualizando(platoId);
            await updateDisponibilidad(platoId, nuevoEstado);
            setPlatos(prev =>
                prev.map(p => (p.id === platoId ? { ...p, isDisponible: nuevoEstado } : p))
            );
            toast({ title: "Actualizado", description: "Disponibilidad cambiada", status: "success" });
        } catch (err) {
            toast({ title: "No se pudo actualizar", description: String(err), status: "error" });
        } finally {
            setActualizando(null);
        }
    };

    if (cargando) {
        return (
            <Box p={6}>
                <HStack><Spinner /><Text>Cargando platos…</Text></HStack>
            </Box>
        );
    }

    return (
        <Box p={6} maxW="800px" mx="auto">
            <Heading size="lg" mb={4}>Panel de Administración</Heading>
            <Text color="gray.500" mb={4}>
                Activa/Desactiva la disponibilidad de los platos.
            </Text>
            <Divider mb={4} />
            <List spacing={3}>
                {platos.map(plato => (
                    <ListItem key={plato.id}>
                        <HStack justify="space-between">
                            <Box>
                                <Text fontWeight="semibold">{plato.nombre ?? "Plato"}</Text>
                                {plato.precio != null && (
                                    <Text fontSize="sm" color="gray.500">$ {Number(plato.precio).toLocaleString()}</Text>
                                )}
                            </Box>
                            <HStack>
                                <Text fontSize="sm">{plato.isDisponible ? "Disponible" : "No disponible"}</Text>
                                <Switch
                                    isChecked={!!plato.isDisponible}
                                    isDisabled={actualizando === plato.id}
                                    onChange={(e) => onToggle(plato.id, e.target.checked)}
                                />
                            </HStack>
                        </HStack>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}
