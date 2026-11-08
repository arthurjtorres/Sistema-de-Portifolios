import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getFirebase } from '@/infrastructure/firebase/firebaseApp';
import {
  toDate,
  toNumber,
  toStoredImage,
  toText,
} from '@/infrastructure/firebase/mappers';
import { FIRESTORE_PATHS } from '@/infrastructure/firebase/paths';
import { toAppError } from '@/lib/errors';
import type { Portfolio, PortfolioInput } from '../types';

function collectionRef(uid: string) {
  return collection(getFirebase().db, FIRESTORE_PATHS.portfolios(uid));
}

function docRef(uid: string, portfolioId: string) {
  return doc(getFirebase().db, FIRESTORE_PATHS.portfolios(uid), portfolioId);
}

/** Converte um documento do Firestore no modelo de domínio. */
function toPortfolio(snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Portfolio {
  const data = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    ownerId: toText(data.ownerId),
    name: toText(data.name),
    description: toText(data.description),
    coverImage: toStoredImage(data.coverImage),
    sortOrder: toNumber(data.sortOrder),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

/** Lista todos os portfólios do usuário por ordem de exibição. */
export async function listPortfolios(uid: string): Promise<Portfolio[]> {
  try {
    const snapshot = await getDocs(query(collectionRef(uid), orderBy('sortOrder', 'asc')));
    return snapshot.docs.map(toPortfolio);
  } catch (error) {
    throw toAppError(error);
  }
}

/** Lista os portfólios atualizados mais recentemente (para o painel). */
export async function listRecentPortfolios(uid: string, max: number): Promise<Portfolio[]> {
  try {
    const snapshot = await getDocs(
      query(collectionRef(uid), orderBy('updatedAt', 'desc'), limit(max)),
    );
    return snapshot.docs.map(toPortfolio);
  } catch (error) {
    throw toAppError(error);
  }
}

/** Conta os portfólios do usuário sem baixar os documentos. */
export async function countPortfolios(uid: string): Promise<number> {
  try {
    const snapshot = await getCountFromServer(collectionRef(uid));
    return snapshot.data().count;
  } catch (error) {
    throw toAppError(error);
  }
}

/** Busca um portfólio; retorna `null` quando não existe. */
export async function getPortfolio(uid: string, portfolioId: string): Promise<Portfolio | null> {
  try {
    const snapshot = await getDoc(docRef(uid, portfolioId));
    return snapshot.exists() ? toPortfolio(snapshot) : null;
  } catch (error) {
    throw toAppError(error);
  }
}

/** Gera o ID de um novo portfólio antes da gravação (necessário para o caminho das imagens). */
export function newPortfolioId(uid: string): string {
  return doc(collectionRef(uid)).id;
}

/**
 * Cria um portfólio com o ID informado (obtido via `newPortfolioId`) ao final da ordem.
 * `sortOrder` usa o horário de criação, evitando leitura prévia para descobrir o maior valor.
 */
export async function createPortfolio(
  uid: string,
  portfolioId: string,
  input: PortfolioInput,
): Promise<void> {
  try {
    await setDoc(docRef(uid, portfolioId), {
      ownerId: uid,
      name: input.name.trim(),
      description: input.description.trim(),
      coverImage: input.coverImage,
      sortOrder: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}

/** Atualiza os campos editáveis de um portfólio. */
export async function updatePortfolio(
  uid: string,
  portfolioId: string,
  input: PortfolioInput,
): Promise<void> {
  try {
    await updateDoc(docRef(uid, portfolioId), {
      name: input.name.trim(),
      description: input.description.trim(),
      coverImage: input.coverImage,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}

/** Define a posição de exibição sem alterar `updatedAt` (as regras permitem apenas esse caso). */
export async function setPortfolioSortOrder(
  uid: string,
  portfolioId: string,
  sortOrder: number,
): Promise<void> {
  try {
    await updateDoc(docRef(uid, portfolioId), { sortOrder });
  } catch (error) {
    throw toAppError(error);
  }
}

/** Remove apenas o documento do portfólio. Regras de negócio ficam em `portfolioService`. */
export async function deletePortfolioDocument(uid: string, portfolioId: string): Promise<void> {
  try {
    await deleteDoc(docRef(uid, portfolioId));
  } catch (error) {
    throw toAppError(error);
  }
}
