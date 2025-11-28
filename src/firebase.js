import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  setDoc,
  runTransaction,
  increment,
  limit,
  deleteDoc
} from "firebase/firestore";

import { getFunctions, httpsCallable } from "firebase/functions";
// -----------------------------

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
const app = initializeApp(firebaseConfig);

// Obtener instancias de los servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export const functions = getFunctions(app);

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error("Error en login:", error.code, error.message);
    throw error; // Lanza el error para que el componente de login lo atrape
  }
};

/**
 * Cierra la sesión del usuario actual.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("Usuario deslogueado exitosamente");
  } catch (error) {
    console.error("Error en logout:", error.code, error.message);
    throw error;
  }
};

/**
 * (Para Bastián) Crea un pedido usando una transacción para descontar el saldo.
 * Esta función REEMPLAZA a createPedido.
 * @param {Object} pedidoData - El objeto del pedido (debe incluir .total y .clienteId).
 * @returns {Promise<string>} El ID del nuevo pedido.
 */
export const realizarPedidoConSaldo = async (pedidoData) => {
  // 1. Referencia al documento del usuario (para descontar saldo)
  const userDocRef = doc(db, "usuarios", pedidoData.clienteId);

  // 2. Referencia al NUEVO documento del pedido (generamos un ID por adelantado)
  const newPedidoRef = doc(collection(db, "pedidos"));

  try {
    // 3. Ejecutamos la transacción
    const pedidoId = await runTransaction(db, async (transaction) => {
      // 4. (DENTRO DE LA TRANSACCIÓN) Lee el perfil del usuario
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("El perfil del usuario no existe.");
      }

      const saldoActual = userDoc.data().saldo || 0;
      const totalPedido = pedidoData.total;

      // 5. (DENTRO DE LA TRANSACCIÓN) Comprueba si hay saldo suficiente
      if (saldoActual < totalPedido) {
        // Lanza un error para cancelar la transacción
        throw new Error("Saldo insuficiente para completar la compra.");
      }

      // 6. (DENTRO DE LA TRANSACCIÓN) Si hay saldo, descuéntalo
      // Usamos 'increment' con un número negativo para seguridad
      transaction.update(userDocRef, {
        saldo: increment(-totalPedido)
      });

      // 7. (DENTRO DE LA TRANSACCIÓN) Crea el nuevo pedido
      transaction.set(newPedidoRef, {
        ...pedidoData,
        estado: "Pendiente",
        fechaCreacion: serverTimestamp(),
      });

      return newPedidoRef.id;
    });

    console.log("Pedido y descuento de saldo exitosos. ID:", pedidoId);
    return pedidoId; // Devuelve el ID del pedido

  } catch (error) {
    // Si el error fue 'Saldo insuficiente' o cualquier otro, la UI lo recibirá
    console.error("Error en la transacción del pedido:", error.message);
    throw error;
  }
};

/**
 * (Para Luciano/Admin) Añade saldo a la cuenta de un usuario.
 * @param {string} userId - El UID del usuario al que se le cargará el saldo.
 * @param {number} monto - La cantidad de saldo a añadir (debe ser positivo).
 * @returns {Promise<void>}
 */
export const addSaldoToUser = async (userId, monto) => {
  if (monto <= 0) {
    throw new Error("El monto a añadir debe ser un número positivo.");
  }

  const userDocRef = doc(db, "usuarios", userId);

  try {
    // Usamos 'increment' para sumar de forma segura al saldo actual
    // Si el campo 'saldo' no existe, lo creará con este valor.
    await updateDoc(userDocRef, {
      saldo: increment(monto)
    });
    console.log(`Se añadieron ${monto} al saldo del usuario ${userId}`);
  } catch (error) {
    console.error("Error al añadir saldo:", error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  const userDocRef = doc(db, "usuarios", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data();
  } else {
    console.error("No existe perfil de usuario para el UID:", uid);
    return null;
  }
};


export const registerClient = async (email, password, additionalData) => {
  try {
    // 1. Crear el usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDocRef = doc(db, "usuarios", user.uid);

    // Preparamos los datos del perfil
    const userData = {
      uid: user.uid,
      email: user.email,
      rol: "cliente",
      ...additionalData,
      rol: "cliente",
      ...additionalData,
    };

    // Escribimos el documento en la base de datos
    await setDoc(userDocRef, userData);

    // Devolvemos el usuario para que el AuthContext lo reconozca (auto-login)
    return userCredential;

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.error("Error: El correo electrónico ya está en uso.");
    } else if (error.code === "auth/weak-password") {
      console.error("Error: La contraseña es demasiado débil.");
    } else {
      console.error(
        "Error en el registro de cliente:",
        error.code,
        error.message
      );
    }
    throw error;
  }
};


export const onAuthStateChangedHelper = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// --- Funciones para Platos (Luciano y Bastián) ---

/**
 * (Para Luciano) Obtiene TODOS los platos de la colección 'platos'.
 * @returns {Promise<Array<Object>>} Un array de objetos, cada uno es un plato con su ID.
 */
export const getAllPlatos = async () => {
  const platosCollectionRef = collection(db, "platos");
  const querySnapshot = await getDocs(platosCollectionRef);

  const platos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return platos;
};

export const getPlatosDisponibles = async () => {
  // Fuente de verdad: isDisponible === true
  const ref = collection(db, "platos");
  const qIs = query(ref, where("isDisponible", "==", true));
  const qs = await getDocs(qIs);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createPlato = async (platoData) => {
  const ref = collection(db, "platos");
  try {
    const isDisp =
      typeof platoData?.isDisponible === "boolean"
        ? platoData.isDisponible
        : false;

    const nuevoPlato = {
      ...platoData,
      isDisponible: isDisp,
      // espejo por compatibilidad con datos antiguos:
      disponible: isDisp,
    };

    const docRef = await addDoc(ref, nuevoPlato);
    console.log("Nuevo plato creado con ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error al crear el plato:", error);
    throw error;
  }
};

/**
 * (Para Bastián) Obtiene solo los platos que tienen 'isDisponible' en true.
 * @returns {Promise<Array<Object>>} Un array de platos disponibles con su ID.
 */
export const deletePlato = async (platoId) => {
  // 1. Apunta al documento específico en la colección 'platos'
  const platoDocRef = doc(db, "platos", platoId);
  try {
    // 2. Llama a la función para eliminar el documento
    await deleteDoc(platoDocRef);
    console.log("Plato eliminado exitosamente:", platoId);
  } catch (error) {
    console.error("Error al eliminar el plato:", error);
    throw error; // Lanza el error para que el panel de admin lo atrape
  }
};

export const updateDisponibilidad = async (platoId, estado) => {
  const platoDocRef = doc(db, "platos", platoId);
  try {
    await updateDoc(platoDocRef, {
      isDisponible: estado
    });
    console.log("Disponibilidad actualizada para el plato:", platoId);
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    throw error;
  }
};

// --- Funciones para Pedidos (Bastián y Constanza) ---

/**
 * (Para Bastián) Crea un nuevo documento en la colección 'pedidos'.
 * @param {Object} pedido - El objeto del pedido (ej. { items: [...], total: 12000, clienteId: "..." }).
 * @returns {Promise<DocumentReference>} Referencia al documento recién creado.
 */
export const createPedido = async (pedido) => {
  const pedidosCollectionRef = collection(db, "pedidos");
  try {
    const docRef = await addDoc(pedidosCollectionRef, {
      ...pedido,
      estado: "Pendiente", // Estado inicial
      fechaCreacion: serverTimestamp() // Marca de tiempo del servidor
    });
    console.log("Pedido creado con ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw error;
  }
};

/**
 * (Para Luciano/Constanza) Actualiza el estado de un pedido (ej. "En Camino", "Entregado").
 * @param {string} pedidoId - El ID del documento del pedido a actualizar.
 * @param {string} nuevoEstado - El nuevo estado (ej. "En Camino").
 * @returns {Promise<void>}
 */
export const updatePedidoEstado = async (pedidoId, nuevoEstado) => {
  // Apunta al documento específico en la colección 'pedidos'
  const pedidoDocRef = doc(db, "pedidos", pedidoId);
  try {
    // Actualiza solo el campo 'estado'
    await updateDoc(pedidoDocRef, {
      estado: nuevoEstado,
    });
    console.log("Estado del pedido actualizado:", pedidoId, "a", nuevoEstado);
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    throw error; // Lanza el error para que el componente lo atrape
  }
};

/**
 * (Para Constanza) Obtiene todos los pedidos, ordenados por fecha de creación (más nuevos primero).
 * @returns {Promise<Array<Object>>} Un array de objetos, cada uno es un pedido con su ID.
 */
export const getPedidos = async () => {
  const ref = collection(db, "pedidos");
  const q = query(ref, orderBy("fechaCreacion", "desc"));
  const qs = await getDocs(q);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Cancela un pedido y reembolsa el saldo al usuario.
 * Solo permite cancelar si el estado es "Pendiente".
 * @param {string} pedidoId - ID del pedido a cancelar.
 * @param {string} userId - ID del usuario que solicita la cancelación.
 */
export const cancelarPedido = async (pedidoId, userId) => {
  const pedidoRef = doc(db, "pedidos", pedidoId);
  const userRef = doc(db, "usuarios", userId);

  try {
    await runTransaction(db, async (transaction) => {
      const pedidoDoc = await transaction.get(pedidoRef);
      if (!pedidoDoc.exists()) {
        throw new Error("El pedido no existe.");
      }

      const pedidoData = pedidoDoc.data();
      if (pedidoData.estado !== "Pendiente") {
        throw new Error("Solo se pueden cancelar pedidos en estado 'Pendiente'.");
      }

      if (pedidoData.clienteId !== userId) {
        throw new Error("No tienes permiso para cancelar este pedido.");
      }

      // Reembolsar saldo
      transaction.update(userRef, {
        saldo: increment(pedidoData.total)
      });

      // Actualizar estado del pedido a Cancelado
      transaction.update(pedidoRef, {
        estado: "Cancelado"
      });
    });
    console.log("Pedido cancelado y saldo reembolsado:", pedidoId);
  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    throw error;
  }
};

/**
 * Obtiene el último pedido de un cliente específico.
 * @param {string} userId - ID del cliente.
 * @returns {Promise<Object|null>} El último pedido o null si no tiene.
 */
export const getLastPedido = async (userId) => {
  const ref = collection(db, "pedidos");
  // Consultamos solo por clienteId para evitar requerir índice compuesto (clienteId + fechaCreacion)
  const q = query(ref, where("clienteId", "==", userId));

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  // Ordenamos en cliente (memoria)
  const pedidos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Orden descendente por fechaCreacion
  pedidos.sort((a, b) => {
    const dateA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate() : new Date(0);
    const dateB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate() : new Date(0);
    return dateB - dateA;
  });

  return pedidos[0];
};

export const callCreateUserWithRole = async (email, password, rol) => {
  const crearUsuario = httpsCallable(functions, "crearUsuarioConRol");

  try {
    // Llama a la nube y le pasa los datos
    const result = await crearUsuario({ email, password, rol });
    return result.data; // Devuelve { success: true, message: "..." }
  } catch (error) {
    // Atrapa errores como "permission-denied"
    console.error("Error al llamar a la Cloud Function:", error);
    throw new Error(error.message);
  }
};