// src/pages/SuperAdminPanel.jsx
import React, { useState } from "react";
import {
  Box,
  Heading,
  Container,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
  HStack,
  Text,
  Divider,
} from "@chakra-ui/react";

// Funciones desde tu firebase.js
import {
  callCreateUserWithRole,
  addSaldoToUser,
  db,
} from "../firebase";

// Firestore utils (para buscar UID por email en colección 'usuarios')
import { collection, query, where, getDocs } from "firebase/firestore";

const SuperAdminPanel = () => {
  // ======== Crear cuenta de staff ========
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("admin");
  const [loadingCreate, setLoadingCreate] = useState(false);

  // ======== Cargar saldo ========
  const [identificador, setIdentificador] = useState("uid"); // uid | email
  const [target, setTarget] = useState(""); // valor del uid o email
  const [monto, setMonto] = useState("");
  const [loadingSaldo, setLoadingSaldo] = useState(false);

  const toast = useToast();

  // ---------- Crear staff ----------
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoadingCreate(true);

    try {
      const response = await callCreateUserWithRole(email, password, rol);
      toast({
        title: "Usuario creado",
        description: response?.message || "Cuenta de staff creada correctamente.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setEmail("");
      setPassword("");
    } catch (error) {
      toast({
        title: "Error al crear usuario",
        description: error.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setLoadingCreate(false);
    }
  };

  // ---------- Utilidad: obtener UID por email ----------
  const getUidByEmail = async (mail) => {
    const ref = collection(db, "usuarios");
    const q = query(ref, where("email", "==", mail));
    const qs = await getDocs(q);
    if (qs.empty) return null;
    return qs.docs[0].id; // UID es el id del doc
  };

  // ---------- Asignar saldo directamente ----------
  const handleSaldoSubmit = async (e) => {
    e.preventDefault();
    const cantidad = Number(monto);

    if (!target.trim()) {
      toast({ title: "Falta identificador", description: "Ingresa un UID o Email.", status: "warning" });
      return;
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      toast({ title: "Monto inválido", description: "Debe ser un número positivo.", status: "warning" });
      return;
    }

    setLoadingSaldo(true);
    try {
      let uid = target.trim();

      if (identificador === "email") {
        const foundUid = await getUidByEmail(uid);
        if (!foundUid) {
          throw new Error("No se encontró un usuario con ese email.");
        }
        uid = foundUid;
      }

      await addSaldoToUser(uid, cantidad);

      toast({
        title: "Saldo asignado",
        description: `Se añadieron ${cantidad.toLocaleString("es-CL")} al usuario (${identificador.toUpperCase()}: ${target}).`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Limpia solo el monto; el identificador puede reutilizarse para más cargas
      setMonto("");
    } catch (e2) {
      toast({
        title: "Error al asignar saldo",
        description: e2.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setLoadingSaldo(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6}>Panel de Super Administrador</Heading>

      {/* === Bloque: Crear cuenta de staff === */}
      <Box as="form" onSubmit={handleCreateSubmit} p={8} borderWidth={1} borderRadius="lg" mb={10}>
        <VStack spacing={4} align="stretch">
          <Heading size="md">Crear Cuenta de Staff</Heading>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Contraseña Temporal</FormLabel>
            <Input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Rol</FormLabel>
            <Select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="admin">Administrador</option>
              <option value="repartidor">Repartidor</option>
            </Select>
          </FormControl>

          <Button type="submit" colorScheme="blue" isLoading={loadingCreate} width="full" mt={2}>
            Crear Usuario
          </Button>
        </VStack>
      </Box>

      <Divider my={6} />

      {/* === Bloque: Asignar saldo (sin consultar) === */}
      <Box as="form" onSubmit={handleSaldoSubmit} p={8} borderWidth={1} borderRadius="lg">
        <VStack spacing={4} align="stretch">
          <Heading size="md">Asignar saldo a usuario</Heading>

          <HStack spacing={3} align="start">
            <FormControl maxW="200px" isRequired>
              <FormLabel>Identificador</FormLabel>
              <Select value={identificador} onChange={(e) => setIdentificador(e.target.value)}>
                <option value="uid">UID</option>
                <option value="email">Email</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{identificador === "email" ? "Email del usuario" : "UID del usuario"}</FormLabel>
              <Input
                placeholder={identificador === "email" ? "usuario@correo.com" : "UID_abc123"}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </FormControl>

            <FormControl maxW="200px" isRequired>
              <FormLabel>Monto a añadir</FormLabel>
              <Input
                type="number"
                min="1"
                placeholder="Ej: 10000"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </FormControl>
          </HStack>

          <Text fontSize="sm" color="gray.500">
            Ingresa el {identificador.toUpperCase()} del usuario y el monto. Al enviar, el saldo se asignará de inmediato.
          </Text>

          <Button type="submit" colorScheme="green" isLoading={loadingSaldo} alignSelf="flex-start">
            Asignar saldo
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default SuperAdminPanel;

