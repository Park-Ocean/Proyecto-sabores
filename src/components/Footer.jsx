// src/components/Footer.jsx
import React from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link,
  IconButton,
  Input,
  Button,
  HStack,
  Divider,
  useToast,
} from "@chakra-ui/react";
import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa6";

const socialLinks = {
  instagram: "https://www.instagram.com/sabores.cl",
  facebook: "https://www.facebook.com/sabores.cl",
  x: "https://x.com/sabores_cl",
  youtube: "https://www.youtube.com/@saborescl",
  tiktok: "https://www.tiktok.com/@saborescl",
  whatsapp: "https://wa.me/56900000000",
};

const columns = [
  {
    title: "Sabores",
    items: [
      { label: "Quiénes somos", href: "/about" },
      { label: "Menú", href: "/menu" },
      { label: "Blog", href: "/blog" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    title: "Soporte",
    items: [
      { label: "Ayuda / FAQ", href: "/ayuda" },
      { label: "Seguimiento de pedidos", href: "/cliente/pedidos" },
      { label: "Soporte técnico", href: "/soporte" },
      { label: "Estado del servicio", href: "/status" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Términos y condiciones", href: "/terminos" },
      { label: "Política de privacidad", href: "/privacidad" },
      { label: "Cookies", href: "/cookies" },
      { label: "Derechos del consumidor", href: "/consumidor" },
    ],
  },
];

const Footer = () => {
  const toast = useToast();

  const handleNewsletter = (e) => {
    e.preventDefault();
    toast({
      title: "¡Gracias!",
      description: "Te suscribiste a nuestras novedades.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box
      as="footer"
      mt={8}
      p={{ base: 4, md: 6 }}                   // ↓ menos padding
      bgGradient="linear(to-r, teal.500, purple.500)"
      color="white"
      borderRadius="xl"                         // ↓ bordes más discretos
    >
      <Container maxW="7xl" px={{ base: 2, md: 4 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 5, md: 6 }}>
          {/* Marca + redes */}
          <Stack spacing={3}>
            <Text fontWeight="bold" fontSize="lg" lineHeight={1.1}>
              Sabores Web
            </Text>
            <Text fontSize="sm" opacity={0.95} noOfLines={2}>
              Platos que conquistan, pedidos sin fricción. Entrega rápida y sabor inolvidable.
            </Text>

            <HStack spacing={1} pt={1} wrap="wrap">
              <IconButton
                as={Link}
                href={socialLinks.instagram}
                isExternal
                aria-label="Instagram de Sabores"
                icon={<FaInstagram />}
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
              />
              <IconButton as={Link} href={socialLinks.facebook} isExternal aria-label="Facebook"
                icon={<FaFacebook />} size="sm" variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}
              />
              <IconButton as={Link} href={socialLinks.x} isExternal aria-label="X"
                icon={<FaXTwitter />} size="sm" variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}
              />
              <IconButton as={Link} href={socialLinks.youtube} isExternal aria-label="YouTube"
                icon={<FaYoutube />} size="sm" variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}
              />
              <IconButton as={Link} href={socialLinks.tiktok} isExternal aria-label="TikTok"
                icon={<FaTiktok />} size="sm" variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}
              />
              <IconButton as={Link} href={socialLinks.whatsapp} isExternal aria-label="WhatsApp"
                icon={<FaWhatsapp />} size="sm" variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}
              />
            </HStack>
          </Stack>

          {/* Secciones */}
          {columns.map((col) => (
            <Stack key={col.title} spacing={2}>
              <Text fontWeight="bold" fontSize="md" opacity={0.95}>
                {col.title}
              </Text>
              <Stack spacing={1.5}>
                {col.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    _hover={{ textDecoration: "underline", opacity: 0.9 }}
                    fontSize="sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Stack>
          ))}

          {/* Newsletter */}
          <Stack spacing={2}>
            <Text fontWeight="bold" fontSize="md" opacity={0.95}>
              Novedades y ofertas
            </Text>
            <Text fontSize="sm" opacity={0.95} noOfLines={2}>
              Suscríbete para recibir promos y nuevos platos.
            </Text>
            <Box as="form" onSubmit={handleNewsletter}>
              <HStack spacing={2} align="stretch">
                <Input
                  type="email"
                  placeholder="Tu correo"
                  bg="whiteAlpha.200"
                  _placeholder={{ color: "whiteAlpha.800" }}
                  border="none"
                  size="sm"                 // ↓ compacto
                  h="36px"                  // altura fija
                  flex="1"                  // ocupa el ancho que queda
                  required
                />
                <Button
                  type="submit"
                  bg="white"
                  color="black"
                  _hover={{ opacity: 0.9 }}
                  size="sm"                 // ↓ compacto
                  h="36px"                  // misma altura que el input
                  px={4}                    // padding horizontal moderado
                  lineHeight="1.2"
                  fontWeight="semibold"
                  whiteSpace="nowrap"       // evita que el texto se salga
                >
                  Suscribirme
                </Button>
              </HStack>
            </Box>
          </Stack>
        </SimpleGrid>

        <Divider my={4} borderColor="whiteAlpha.400" />  {/* ↓ menos margen */}

        <Stack
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          spacing={2}
        >
          <Text fontSize="sm" opacity={0.95}>
            © {new Date().getFullYear()} Sabores Web. Todos los derechos reservados.
          </Text>
          <HStack spacing={3} fontSize="sm" opacity={0.95}>
            <Link href="/privacidad" _hover={{ textDecoration: "underline" }}>
              Privacidad
            </Link>
            <Link href="/terminos" _hover={{ textDecoration: "underline" }}>
              Términos
            </Link>
            <Link href="/cookies" _hover={{ textDecoration: "underline" }}>
              Cookies
            </Link>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
