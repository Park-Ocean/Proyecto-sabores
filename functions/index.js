// functions/index.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

// Inicializa el SDK de Administrador
initializeApp();
const adminAuth = getAuth();
const db = getFirestore();

/**
 * Crea un usuario en Auth y su perfil en Firestore.
 * Esta función NO desloguea al superadmin.
 */
exports.crearUsuarioConRol = onCall(async (request) => {
  // 1. VERIFICACIÓN DE SEGURIDAD (Crítico)
  // Revisa el "token" de la persona que llama.
  // Si su rol en el token no es 'superadmin', la función falla.
  if (request.auth?.token?.rol !== "superadmin") {
    throw new HttpsError(
      "permission-denied",
      "Solo un superadmin puede crear usuarios."
    );
  }

  // 2. Obtiene los datos enviados desde React
  const { email, password, rol } = request.data;
  if (!email || !password || (rol !== "admin" && rol !== "repartidor")) {
    throw new HttpsError(
      "invalid-argument",
      "Datos incompletos o rol inválido."
    );
  }

  try {
    // 3. CREA EL USUARIO (Modo Admin: no inicia sesión)
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
    });

    // 4. CREA EL PERFIL EN FIRESTORE
    await db.collection("usuarios").doc(userRecord.uid).set({
      email: email,
      rol: rol,
    });

    // 5. ASIGNA EL ROL AL TOKEN del nuevo usuario (para que RutaProtegida funcione)
    await adminAuth.setCustomUserClaims(userRecord.uid, { rol: rol });

    return {
      success: true,
      message: `Usuario ${email} creado con rol ${rol}.`,
    };
  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});
