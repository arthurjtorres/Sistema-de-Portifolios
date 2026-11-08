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
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getFirebase } from '@/infrastructure/firebase/firebaseApp';
import {
  toDate,
  toNumber,
  toStoredImage,
  toStoredImages,
  toText,
} from '@/infrastructure/firebase/mappers';
import { FIRESTORE_PATHS } from '@/infrastructure/firebase/paths';
import { toAppError } from '@/lib/errors';
import type { Project, ProjectInput } from '../types';

function collectionRef(uid: string) {
  return collection(getFirebase().db, FIRESTORE_PATHS.projects(uid));
}

function docRef(uid: string, projectId: string) {
  return doc(getFirebase().db, FIRESTORE_PATHS.projects(uid), projectId);
}

/** Converte um documento do Firestore no modelo de domínio. */
function toProject(snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Project {
  const data = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    ownerId: toText(data.ownerId),
    portfolioId: toText(data.portfolioId),
    name: toText(data.name),
    description: toText(data.description),
    coverImage: toStoredImage(data.coverImage),
    images: toStoredImages(data.images),
    externalUrl: typeof data.externalUrl === 'string' ? data.externalUrl : null,
    sortOrder: toNumber(data.sortOrder),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

/** Ordena por `sortOrder` no cliente (evita índice composto ao filtrar por portfólio). */
function bySortOrder(a: Project, b: Project): number {
  return a.sortOrder - b.sortOrder;
}

/** Lista todos os projetos do usuário por ordem de exibição. */
export async function listProjects(uid: string): Promise<Project[]> {
  try {
    const snapshot = await getDocs(query(collectionRef(uid), orderBy('sortOrder', 'asc')));
    return snapshot.docs.map(toProject);
  } catch (error) {
    throw toAppError(error);
  }
}

/** Lista os projetos de um portfólio por ordem de exibição. */
export async function listProjectsByPortfolio(uid: string, portfolioId: string): Promise<Project[]> {
  try {
    const snapshot = await getDocs(query(collectionRef(uid), where('portfolioId', '==', portfolioId)));
    return snapshot.docs.map(toProject).sort(bySortOrder);
  } catch (error) {
    throw toAppError(error);
  }
}

/** Lista os projetos atualizados mais recentemente (para o painel). */
export async function listRecentProjects(uid: string, max: number): Promise<Project[]> {
  try {
    const snapshot = await getDocs(
      query(collectionRef(uid), orderBy('updatedAt', 'desc'), limit(max)),
    );
    return snapshot.docs.map(toProject);
  } catch (error) {
    throw toAppError(error);
  }
}

/** Conta os projetos do usuário sem baixar os documentos. */
export async function countProjects(uid: string): Promise<number> {
  try {
    const snapshot = await getCountFromServer(collectionRef(uid));
    return snapshot.data().count;
  } catch (error) {
    throw toAppError(error);
  }
}

/** Conta os projetos de um portfólio. */
export async function countProjectsByPortfolio(uid: string, portfolioId: string): Promise<number> {
  try {
    const snapshot = await getCountFromServer(
      query(collectionRef(uid), where('portfolioId', '==', portfolioId)),
    );
    return snapshot.data().count;
  } catch (error) {
    throw toAppError(error);
  }
}

/** Busca um projeto; retorna `null` quando não existe. */
export async function getProject(uid: string, projectId: string): Promise<Project | null> {
  try {
    const snapshot = await getDoc(docRef(uid, projectId));
    return snapshot.exists() ? toProject(snapshot) : null;
  } catch (error) {
    throw toAppError(error);
  }
}

/** Gera o ID de um novo projeto antes da gravação (necessário para o caminho das imagens). */
export function newProjectId(uid: string): string {
  return doc(collectionRef(uid)).id;
}

/**
 * Cria um projeto com o ID informado (obtido via `newProjectId`) ao final da ordem.
 * O ID pré-gerado permite que as imagens enviadas antes apontem para a pasta correta.
 */
export async function createProject(
  uid: string,
  projectId: string,
  input: ProjectInput,
): Promise<void> {
  try {
    await setDoc(docRef(uid, projectId), buildCreateData(uid, input));
  } catch (error) {
    throw toAppError(error);
  }
}

function buildCreateData(uid: string, input: ProjectInput) {
  return {
    ownerId: uid,
    portfolioId: input.portfolioId,
    name: input.name.trim(),
    description: input.description.trim(),
    coverImage: input.coverImage,
    images: input.images,
    externalUrl: input.externalUrl?.trim() || null,
    sortOrder: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/** Atualiza os campos editáveis. A regra do Firestore reconfirma que o portfólio é do usuário. */
export async function updateProject(
  uid: string,
  projectId: string,
  input: ProjectInput,
): Promise<void> {
  try {
    await updateDoc(docRef(uid, projectId), {
      portfolioId: input.portfolioId,
      name: input.name.trim(),
      description: input.description.trim(),
      coverImage: input.coverImage,
      images: input.images,
      externalUrl: input.externalUrl?.trim() || null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}

/** Define a posição de exibição sem alterar `updatedAt`. */
export async function setProjectSortOrder(
  uid: string,
  projectId: string,
  sortOrder: number,
): Promise<void> {
  try {
    await updateDoc(docRef(uid, projectId), { sortOrder });
  } catch (error) {
    throw toAppError(error);
  }
}

/** Remove o documento do projeto. */
export async function deleteProjectDocument(uid: string, projectId: string): Promise<void> {
  try {
    await deleteDoc(docRef(uid, projectId));
  } catch (error) {
    throw toAppError(error);
  }
}
