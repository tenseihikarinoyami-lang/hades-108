// SISTEMA DE AMIGOS - Vinculos del Inframundo
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Friendship {
  id: string;
  userId: string;
  userName?: string;
  userPhoto?: string;
  friendId: string;
  friendName: string;
  friendPhoto: string;
  pairId?: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: any;
  lastPlayedTogether?: number;
}

const buildPairId = (userA: string, userB: string) => [userA, userB].sort().join('_');

const mapFriendshipForUser = (friendshipId: string, currentUserId: string, data: any): Friendship => {
  const isOwner = data.userId === currentUserId;

  return {
    id: friendshipId,
    ...data,
    friendId: isOwner ? data.friendId : data.userId,
    friendName: isOwner ? (data.friendName || 'Espectro') : (data.userName || data.friendName || 'Espectro'),
    friendPhoto: isOwner ? (data.friendPhoto || '') : (data.userPhoto || data.friendPhoto || ''),
  } as Friendship;
};

// Enviar solicitud de amistad
export async function sendFriendRequest(
  userId: string,
  userName: string,
  userPhoto: string,
  targetUserId: string,
  targetUserName: string,
  targetUserPhoto: string
): Promise<{ success: boolean; message: string }> {
  try {
    const friendshipsRef = collection(db, 'friendships');
    const pairId = buildPairId(userId, targetUserId);
    const existingQuery = query(friendshipsRef, where('pairId', '==', pairId));
    const existingSnap = await getDocs(existingQuery);
    const legacyDirectQuery = query(friendshipsRef, where('userId', '==', userId), where('friendId', '==', targetUserId));
    const legacyReverseQuery = query(friendshipsRef, where('userId', '==', targetUserId), where('friendId', '==', userId));
    const [legacyDirectSnap, legacyReverseSnap] = await Promise.all([
      getDocs(legacyDirectQuery),
      getDocs(legacyReverseQuery),
    ]);

    if (!existingSnap.empty || !legacyDirectSnap.empty || !legacyReverseSnap.empty) {
      return { success: false, message: 'Ya existe un vinculo o una solicitud con este usuario' };
    }

    await addDoc(friendshipsRef, {
      userId,
      userName,
      userPhoto,
      friendId: targetUserId,
      friendName: targetUserName,
      friendPhoto: targetUserPhoto,
      pairId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return { success: true, message: 'Solicitud de amistad enviada' };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, message: 'Error al enviar solicitud' };
  }
}

// Aceptar solicitud de amistad
export async function acceptFriendRequest(
  friendshipId: string,
  currentUserId: string,
  currentUserName: string,
  currentUserPhoto: string
): Promise<void> {
  const docRef = doc(db, 'friendships', friendshipId);
  const friendshipSnap = await getDoc(docRef);
  if (!friendshipSnap.exists()) return;

  const friendship = friendshipSnap.data() as Friendship;
  const pairId = friendship.pairId || buildPairId(friendship.userId, friendship.friendId);

  await updateDoc(docRef, {
    status: 'accepted',
    pairId,
    friendName: friendship.friendName || currentUserName,
    friendPhoto: friendship.friendPhoto || currentUserPhoto,
  });

  const reverseQuery = query(
    collection(db, 'friendships'),
    where('pairId', '==', pairId),
    where('userId', '==', currentUserId)
  );
  const reverseSnap = await getDocs(reverseQuery);

  if (reverseSnap.empty) {
    await addDoc(collection(db, 'friendships'), {
      userId: currentUserId,
      userName: currentUserName,
      userPhoto: currentUserPhoto,
      friendId: friendship.userId,
      friendName: friendship.userName || friendship.friendName || 'Espectro',
      friendPhoto: friendship.userPhoto || friendship.friendPhoto || '',
      pairId,
      status: 'accepted',
      createdAt: friendship.createdAt || serverTimestamp(),
    });
    return;
  }

  await Promise.all(
    reverseSnap.docs.map((snapshot) =>
      updateDoc(snapshot.ref, {
        status: 'accepted',
        friendName: friendship.userName || friendship.friendName || 'Espectro',
        friendPhoto: friendship.userPhoto || friendship.friendPhoto || '',
        pairId,
      })
    )
  );
}

// Rechazar solicitud de amistad
export async function rejectFriendRequest(friendshipId: string): Promise<void> {
  await deleteDoc(doc(db, 'friendships', friendshipId));
}

// Eliminar amigo
export async function removeFriend(friendshipId: string): Promise<void> {
  const docRef = doc(db, 'friendships', friendshipId);
  const friendshipSnap = await getDoc(docRef);
  if (!friendshipSnap.exists()) return;

  const friendship = friendshipSnap.data() as Friendship;
  const pairId = friendship.pairId || buildPairId(friendship.userId, friendship.friendId);
  const pairQuery = query(collection(db, 'friendships'), where('pairId', '==', pairId));
  const pairSnap = await getDocs(pairQuery);

  if (pairSnap.empty) {
    await deleteDoc(docRef);
    return;
  }

  await Promise.all(pairSnap.docs.map((snapshot) => deleteDoc(snapshot.ref)));
}

// Obtener lista de amigos
export function getFriendsList(userId: string, callback: (friends: Friendship[]) => void) {
  const friendshipsRef = collection(db, 'friendships');
  const ownerQuery = query(friendshipsRef, where('userId', '==', userId), where('status', '==', 'accepted'));
  const receiverQuery = query(friendshipsRef, where('friendId', '==', userId), where('status', '==', 'accepted'));
  let ownerDocs: Friendship[] = [];
  let receiverDocs: Friendship[] = [];

  const emit = () => {
    const merged = [...ownerDocs, ...receiverDocs];
    const deduped = merged.filter((friendship, index, list) => {
      const key = friendship.pairId || `${friendship.userId}_${friendship.friendId}`;
      return index === list.findIndex((candidate) => (candidate.pairId || `${candidate.userId}_${candidate.friendId}`) === key);
    });
    callback(deduped);
  };

  const unsubscribeOwner = onSnapshot(ownerQuery, (snapshot) => {
    ownerDocs = snapshot.docs.map((friendshipDoc) =>
      mapFriendshipForUser(friendshipDoc.id, userId, friendshipDoc.data())
    );
    emit();
  });

  const unsubscribeReceiver = onSnapshot(receiverQuery, (snapshot) => {
    receiverDocs = snapshot.docs.map((friendshipDoc) =>
      mapFriendshipForUser(friendshipDoc.id, userId, friendshipDoc.data())
    );
    emit();
  });

  return () => {
    unsubscribeOwner();
    unsubscribeReceiver();
  };
}

// Obtener solicitudes pendientes
export function getPendingRequests(userId: string, callback: (requests: Friendship[]) => void) {
  const friendshipsRef = collection(db, 'friendships');
  const q = query(friendshipsRef, where('friendId', '==', userId), where('status', '==', 'pending'));

  return onSnapshot(q, (snapshot) => {
    const requests: Friendship[] = snapshot.docs.map((friendshipDoc) =>
      mapFriendshipForUser(friendshipDoc.id, userId, friendshipDoc.data())
    );
    callback(requests);
  });
}

// Buscar usuario por nombre
export async function searchUserByName(name: string): Promise<{ uid: string; displayName: string; photoURL: string }[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('specterName', '==', name));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((userDoc) => {
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        displayName: data.specterName || data.displayName,
        photoURL: data.photoURL || '',
      };
    });
  } catch (error) {
    console.error('Error searching user:', error);
    return [];
  }
}
