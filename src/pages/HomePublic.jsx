// src/pages/HomePublic.jsx
import { useEffect, useState } from "react";
import {
    Box,
    Heading,
    Text,
    Stack,
    SimpleGrid,
    Image,
    Badge,
    Card,
    CardBody,
    CardFooter,
    HStack,
    VStack,
    Skeleton,
    SkeletonText,
    useToast,
    Divider,
    Button,
    position,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { getPlatosDisponibles } from "../firebase.js";

const fmtCLP = (n) =>
    n == null
        ? ""
        : new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
        }).format(Number(n));

export default function HomePublic() {
    const [platos, setPlatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const toast = useToast();

    useEffect(() => {
        (async () => {
            try {
                const data = await getPlatosDisponibles();
                const normalizados = (data || []).map((p) => ({
                    id: p.id,
                    nombre: p.nombre ?? "Plato",
                    precio: p.precio ?? null,
                    descripcion: p.descripcion ?? "",
                    imgurl: p.imgurl ?? "",
                    isDisponible: p.isDisponible ?? p.disponible ?? true,
                }));
                setPlatos(normalizados.filter((p) => p.isDisponible));
            } catch (err) {
                toast({
                    title: "Error cargando el menú",
                    description: String(err?.message || err),
                    status: "error",
                });
            } finally {
                setCargando(false);
            }
        })();
    }, [toast]);

    return (
        <Box maxW="container.xl" mx="auto" py={6} px={4}>
            {/* HERO */}
            <Box
                borderRadius="2xl"
                p={{ base: 6, md: 10 }}
                mb={8}
                bgGradient="linear(to-r, teal.500, purple.500)"
                color="white"
                overflow="hidden"
                position="relative"
            >
                <Stack spacing={3} maxW="3xl" zIndex={1}>
                    <Badge
                        alignSelf="start"
                        colorScheme="blackAlpha"
                        bg="whiteAlpha.300"
                        backdropFilter="auto"
                        backdropBlur="4px"
                        px={3}
                        py={1}
                        borderRadius="lg"
                        fontWeight="semibold"
                    >
                        Sabores · Cocina con cariño
                    </Badge>
                    <Heading size={{ base: "lg", md: "2xl" }} lineHeight="1.1">
                        Bienvenido a <Text as="span" fontWeight="extrabold">Sabores</Text>
                    </Heading>
                    <Text fontSize={{ base: "md", md: "lg" }} opacity={0.95}>
                        Platos caseros, ingredientes frescos y el toque que hace volver.
                    </Text>

                    <HStack mt={2} spacing={3}>
                        <Button
                            as={RouterLink}
                            to="/login"
                            variant="outline"
                            color="white"
                            _hover={{ bg: "whiteAlpha.300" }}
                        >
                            Iniciar sesión
                        </Button>
                        <Button
                            as={RouterLink}
                            to="/register"
                            bg="white"
                            color="teal.600"
                            _hover={{ bg: "whiteAlpha.800" }}
                        >
                            Registrarse
                        </Button>
                    </HStack>
                </Stack>
                <Box
                    position="absolute"
                    right={{ base: "-80px", md: "-40px" }}
                    top={{ base: "-60px", md: "-40px" }}
                    w={{ base: "220px", md: "280px" }}
                    h={{ base: "220px", md: "280px" }}
                    bg="whiteAlpha.300"
                    borderRadius="50%"
                    filter="blur(40px)"
                />
            </Box>

            <Heading size="md" mb={2}>Menú disponible hoy</Heading>
            <Text color="gray.500" mb={4}>Estos son los platos actualmente disponibles.</Text>
            <Divider mb={6} />

            {/* GRID */}
            {cargando ? (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} borderRadius="xl" overflow="hidden">
                            <Skeleton height="180px" />
                            <CardBody>
                                <SkeletonText noOfLines={2} spacing="3" />
                            </CardBody>
                            <CardFooter>
                                <Skeleton height="20px" w="80px" />
                            </CardFooter>
                        </Card>
                    ))}
                </SimpleGrid>
            ) : platos.length === 0 ? (
                <VStack py={12} spacing={3} border="1px dashed" borderColor="gray.200" borderRadius="lg">
                    <Heading size="sm">Aún no hay platos disponibles</Heading>
                    <Text color="gray.500" textAlign="center" maxW="sm">
                        Vuelve más tarde. Estamos cocinando algo rico 🍲
                    </Text>
                </VStack>
            ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
                    {platos.map((plato) => (
                        <Card
                            key={plato.id}
                            borderRadius="xl"
                            overflow="hidden"
                            _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                            transition="all 0.2s ease"
                        >
                            {plato.imgurl ? (
                                <Image src={plato.imgurl} alt={plato.nombre} h="180px" w="100%" objectFit="cover" />
                            ) : (
                                <Box h="180px" bg="gray.100" />
                            )}

                            <CardBody>
                                <Stack spacing={2}>
                                    <HStack justify="space-between" align="start">
                                        <Heading size="sm">{plato.nombre}</Heading>
                                        <Badge colorScheme="green">Disponible</Badge>
                                    </HStack>
                                    {plato.descripcion ? (
                                        <Text color="gray.600" fontSize="sm" noOfLines={3}>
                                            {plato.descripcion}
                                        </Text>
                                    ) : null}
                                </Stack>
                            </CardBody>

                            <CardFooter>
                                <HStack w="full" justify="space-between">
                                    <Text fontWeight="bold">{fmtCLP(plato.precio)}</Text>
                                </HStack>
                            </CardFooter>
                        </Card>
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
}
