import { MEDIA_LIMITS } from '@/config/media';
import { AppError } from '@/lib/errors';
import { deleteImages, uploadImages } from '@/modules/media/services/mediaService';
import type {
  CoverDraft,
  GalleryDraft,
  StoredImage,
  UploadProgressHandler,
} from '@/modules/media/types';
import { getPortfolio } from '@/modules/portfolios/repositories/portfolioRepository';
import {
  createProject,
  deleteProjectDocument,
  newProjectId,
  updateProject,
} from '../repositories/projectRepository';
import type { Project } from '../types';

/** Valores de texto do formulário de projeto. */
export interface ProjectFormValues {
  portfolioId: string;
  name: string;
  description: string;
  externalUrl: string;
}

/** Resultado do processamento de imagens de um formulário. */
interface ResolvedImages {
  coverImage: StoredImage | null;
  images: StoredImage[];
  /** Arquivos enviados nesta operação (para limpeza em caso de falha). */
  uploaded: StoredImage[];
}

/** Garante que o portfólio existe sob o usuário (as Security Rules reforçam no servidor). */
async function assertPortfolioOwned(uid: string, portfolioId: string): Promise<void> {
  const portfolio = await getPortfolio(uid, portfolioId);
  if (!portfolio) {
    throw new AppError('portfolioNotFound');
  }
}

/** Envia os novos arquivos (capa e galeria) e monta o conjunto final de imagens. */
async function resolveImages(
  uid: string,
  projectId: string,
  cover: CoverDraft,
  gallery: GalleryDraft,
  onProgress?: UploadProgressHandler,
): Promise<ResolvedImages> {
  if (gallery.kept.length + gallery.newFiles.length > MEDIA_LIMITS.maxGalleryImages) {
    throw new AppError('tooManyImages');
  }

  const files = cover.newFile ? [cover.newFile, ...gallery.newFiles] : [...gallery.newFiles];
  const uploaded =
    files.length > 0
      ? await uploadImages({ uid, kind: 'projects', resourceId: projectId, files, onProgress })
      : [];

  const coverImage = cover.newFile ? (uploaded[0] ?? null) : cover.current;
  const newGallery = cover.newFile ? uploaded.slice(1) : uploaded;

  return { coverImage, images: [...gallery.kept, ...newGallery], uploaded };
}

/**
 * Cria um projeto vinculado a um portfólio do próprio usuário.
 * Em caso de falha na gravação, remove as imagens enviadas.
 *
 * @returns ID do projeto criado.
 */
export async function createProjectWithImages(
  uid: string,
  values: ProjectFormValues,
  cover: CoverDraft,
  gallery: GalleryDraft,
  onProgress?: UploadProgressHandler,
): Promise<string> {
  await assertPortfolioOwned(uid, values.portfolioId);

  const projectId = newProjectId(uid);
  const { coverImage, images, uploaded } = await resolveImages(
    uid,
    projectId,
    cover,
    gallery,
    onProgress,
  );

  try {
    await createProject(uid, projectId, {
      portfolioId: values.portfolioId,
      name: values.name,
      description: values.description,
      externalUrl: values.externalUrl,
      coverImage,
      images,
    });
    return projectId;
  } catch (error) {
    await deleteImages(uploaded.map((image) => image.path));
    throw error;
  }
}

/**
 * Atualiza um projeto. Imagens removidas ou substituídas só são apagadas do Storage
 * depois que o documento é salvo.
 *
 * @returns `true` se alguma imagem antiga não pôde ser apagada (alteração salva mesmo assim).
 */
export async function updateProjectWithImages(
  uid: string,
  project: Project,
  values: ProjectFormValues,
  cover: CoverDraft,
  gallery: GalleryDraft,
  onProgress?: UploadProgressHandler,
): Promise<boolean> {
  if (values.portfolioId !== project.portfolioId) {
    await assertPortfolioOwned(uid, values.portfolioId);
  }

  const { coverImage, images, uploaded } = await resolveImages(
    uid,
    project.id,
    cover,
    gallery,
    onProgress,
  );

  try {
    await updateProject(uid, project.id, {
      portfolioId: values.portfolioId,
      name: values.name,
      description: values.description,
      externalUrl: values.externalUrl,
      coverImage,
      images,
    });
  } catch (error) {
    await deleteImages(uploaded.map((image) => image.path));
    throw error;
  }

  const keptPaths = new Set([coverImage?.path, ...images.map((image) => image.path)]);
  const previous = [project.coverImage, ...project.images].filter(
    (image): image is StoredImage => image !== null,
  );
  const orphaned = previous.filter((image) => !keptPaths.has(image.path)).map((image) => image.path);
  const failed = await deleteImages(orphaned);
  return failed.length > 0;
}

/**
 * Exclui um projeto e suas imagens.
 * O documento é removido primeiro; falhas ao apagar arquivos não revertem a exclusão.
 */
export async function deleteProject(uid: string, project: Project): Promise<void> {
  await deleteProjectDocument(uid, project.id);
  const paths = [project.coverImage, ...project.images]
    .filter((image): image is StoredImage => image !== null)
    .map((image) => image.path);
  await deleteImages(paths);
}
