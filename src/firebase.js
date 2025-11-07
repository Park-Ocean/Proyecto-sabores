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
} from "firebase/firestore";

import { getFunctions, httpsCallable } from "firebase/functions";
// -----------------------------

const firebaseConfig = {
  apiKey: "AIzaSyBY2v5ip4Ozmqp3Qc4ZIyDOoJceo_SwVBs",
  authDomain: "sabores-web.firebaseapp.com",
  projectId: "sabores-web",
  storageBucket: "sabores-web.firebasestorage.app",
  messagingSenderId: "726699207665",
  appId: "1:726699207665:web:c5acc57103eb5c4c297250",
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const functions = getFunctions(app);

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    console.error("Error en login:", error.code, error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log("Usuario deslogueado exitosamente");
  } catch (error) {
    console.error("Error en logout:", error.code, error.message);
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
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userDocRef = doc(db, "usuarios", user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      rol: "cliente",
      ...additionalData,
    };
    await setDoc(userDocRef, userData);
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
  const platosCollectionRef = collection(db, "platos");
  const q = query(platosCollectionRef, where("isDisponible", "==", true));
  const querySnapshot = await getDocs(q);

  const platosDisponibles = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return platosDisponibles;
};

export const createPlato = async (platoData) => {
  const platosCollectionRef = collection(db, "platos");
  try {
    const nuevoPlato = {
      ...platoData,
      isDisponible: false,
    };
    const docRef = await addDoc(platosCollectionRef, nuevoPlato);
    console.log("Nuevo plato creado con ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error al crear el plato:", error);
    throw error;
  }
};

export const updateDisponibilidad = async (platoId, estado) => {
  const platoDocRef = doc(db, "platos", platoId);
  try {
    await updateDoc(platoDocRef, {
      isDisponible: estado,
    });
    console.log("Disponibilidad actualizada para el plato:", platoId);
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    throw error;
  }
};


export const createPedido = async (pedido) => {
  const pedidosCollectionRef = collection(db, "pedidos");
  try {
    const docRef = await addDoc(pedidosCollectionRef, {
      ...pedido,
      estado: "Pendiente",
      fechaCreacion: serverTimestamp(),
    });
    console.log("Pedido creado con ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw error;
  }
};

export const updatePedidoEstado = async (pedidoId, nuevoEstado) => {
  const pedidoDocRef = doc(db, "pedidos", pedidoId);
  try {
    await updateDoc(pedidoDocRef, {
      estado: nuevoEstado,
    });
    console.log("Estado del pedido actualizado:", pedidoId, "a", nuevoEstado);
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    throw error;
  }
};

export const getPedidos = async () => {
  const pedidosCollectionRef = collection(db, "pedidos");
  const q = query(pedidosCollectionRef, orderBy("fechaCreacion", "desc"));
  const querySnapshot = await getDocs(q);

  const pedidos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return pedidos;
};


/**
 * un usuario de forma segura y SIN CERRAR SESIÓN.
 * @param {string} email
 * @param {string} password
 * @param {string} rol ('admin' o 'repartidor')
 * @returns {Promise<Object>} La respuesta de la Cloud Function (ej. { success: true, ... })
 */
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