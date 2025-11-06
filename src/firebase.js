import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    // Nota: Agregaremos onAuthStateChanged para el AuthContext de Bastián
    onAuthStateChanged,
    signOut 
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
    orderBy
} from "firebase/firestore";

// --- ¡IMPORTANTE! ---
// Pega aquí tu objeto de configuración de Firebase
// Lo encuentras en tu Proyecto -> Configuración del proyecto -> Tus apps -> Configuración de SDK
const firebaseConfig = {
  apiKey: "AIzaSyBY2v5ip4Ozmqp3Qc4ZIyDOoJceo_SwVBs",
  authDomain: "sabores-web.firebaseapp.com",
  projectId: "sabores-web",
  storageBucket: "sabores-web.firebasestorage.app",
  messagingSenderId: "726699207665",
  appId: "1:726699207665:web:c5acc57103eb5c4c297250"
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener instancias de los servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Inicia sesión de un usuario con email y contraseña.
 * @param {string} email - El email del usuario.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<UserCredential>} El objeto UserCredential de Firebase.
 */
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
 * (BONUS - Bastián lo necesitará 100%)
 * Obtiene el perfil de un usuario desde la colección 'usuarios' en Firestore.
 * @param {string} uid - El User ID (uid) de Firebase Auth.
 * @returns {Promise<Object|null>} El objeto con los datos del usuario (email, rol) o null si no existe.
 */
export const getUserProfile = async (uid) => {
    const userDocRef = doc(db, "usuarios", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return userDocSnap.data(); // Retorna { email: "...", rol: "..." }
    } else {
        console.error("No existe perfil de usuario para el UID:", uid);
        return null;
    }
};

/**
 * (BONUS - Bastián lo necesitará)
 * Observador que detecta cambios en el estado de autenticación.
 * Llama a un callback con el usuario (o null).
 * @param {function} callback - Función a la que se le pasará el usuario.
 * @returns {Unsubscribe} Función para desuscribirse del observador.
 */
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
    
    const platos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return platos;
};

/**
 * (Para Bastián) Obtiene solo los platos que tienen 'isDisponible' en true.
 * @returns {Promise<Array<Object>>} Un array de platos disponibles con su ID.
 */
export const getPlatosDisponibles = async () => {
    const platosCollectionRef = collection(db, "platos");
    const q = query(platosCollectionRef, where("isDisponible", "==", true));
    const querySnapshot = await getDocs(q);

    const platosDisponibles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return platosDisponibles;
};

/**
 * (Para Luciano) Actualiza el estado de disponibilidad de un plato.
 * @param {string} platoId - El ID del documento del plato a actualizar.
 * @param {boolean} estado - El nuevo estado (true para disponible, false para no disponible).
 * @returns {Promise<void>}
 */
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
 * (Para Constanza) Obtiene todos los pedidos, ordenados por fecha de creación (más nuevos primero).
 * @returns {Promise<Array<Object>>} Un array de objetos, cada uno es un pedido con su ID.
 */
export const getPedidos = async () => {
    const pedidosCollectionRef = collection(db, "pedidos");
    // Ordenamos por fecha de creación en orden descendente
    const q = query(pedidosCollectionRef, orderBy("fechaCreacion", "desc"));
    const querySnapshot = await getDocs(q);
    
    const pedidos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return pedidos;
};