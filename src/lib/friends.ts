// SISTEMA DE AMIGOS - Vínculos del Inframundo
import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp, onSnapshot, DocumentData } from 'firebase/firestore';

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendPhoto: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: any;
  lastPlayedTogether?: number;
}

// Enviar solicitud de amistad
export async function sendFriendRequest(userId: string, userName: string, userPhoto: string, targetUserId: string): Promise<{ success: boolean; message: string }> {
  try {
    const friendshipsRef = collection(db, 'friendships');
    
    // Verificar si ya existe una solicitud
    const existingQuery = query(friendshipsRef, 
      where('userId', '==', userId),
      where('friendId', '==', targetUserId)
    );
    const existingSnap = await getDocs(existingQuery);
    
    if (!existingSnap.empty) {
      return { success: false, message: 'Ya enviaste una solicitud a este usuario' };
    }

    await addDoc(friendshipsRef, {
      userId,
      friendId: targetUserId,
      friendName: userName,
      friendPhoto: userPhoto,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    return { success: true, message: 'Solicitud de amistad enviada' };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, message: 'Error al enviar solicitud' };
  }
}

// Aceptar solicitud de amistad
export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const docRef = doc(db, 'friendships', friendshipId);
  await updateDoc(docRef, { status: 'accepted' });
}

// Rechazar solicitud de amistad
export async function rejectFriendRequest(friendshipId: string): Promise<void> {
  await deleteDoc(doc(db, 'friendships', friendshipId));
}

// Eliminar amigo
export async function removeFriend(friendshipId: string): Promise<void> {
  await deleteDoc(doc(db, 'friendships', friendshipId));
}

// Obtener lista de amigos
export function getFriendsList(userId: string, callback: (friends: Friendship[]) => void) {
  const friendshipsRef = collection(db, 'friendships');
  const q = query(friendshipsRef, where('userId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const friends: Friendship[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'accepted') {
        friends.push({ id: doc.id, ...data } as Friendship);
      }
    });
    callback(friends);
  });
}

// Obtener solicitudes pendientes
export function getPendingRequests(userId: string, callback: (requests: Friendship[]) => void) {
  const friendshipsRef = collection(db, 'friendships');
  const q = query(friendshipsRef, where('friendId', '==', userId), where('status', '==', 'pending'));
  
  return onSnapshot(q, (snapshot) => {
    const requests: Friendship[] = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as Friendship);
    });
    callback(requests);
  });
}

// Buscar usuario por nombre
export async function searchUserByName(name: string): Promise<{ uid: string; displayName: string; photoURL: string }[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('specterName', '==', name));
    const snapshot = await getDocs(q);
    
    const results: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        uid: doc.id,
        displayName: data.specterName || data.displayName,
        photoURL: data.photoURL || ''
      });
    });
    return results;
  } catch (error) {
    console.error('Error searching user:', error);
    return [];
  }
}
