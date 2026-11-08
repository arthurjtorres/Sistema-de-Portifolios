import { AppError } from '@/lib/errors';
import { deleteImages, uploadImage } from '@/modules/media/services/mediaService';
import type { CoverDraft, StoredImage, UploadProgressHandler } from '@/modules/media/types';
import { countProjectsByPortfolio } from '@/modules/projects/repositories/projectRepository';
import {
  createPortfolio,
  deletePortfolioDocument,
  newPortfolioId,
  updatePortfolio,
} from '../repositories/portfolioRepository';
import type { Portfolio } from '../types';

/** Valores de texto do formulário de portfólio. */
export interface PortfolioFormValues {
  name: string;
  description: string;
}

/**
 * Cria um portfólio, enviando a capa (se houver) antes de gravar o documento.
 * Se a gravação falhar, a capa enviada é removida para não deixar arquivo órfão.
 *
 * @returns ID do portfólio criado.
 */
export async function createPortfolioWithCover(
  uid: string,
  values: PortfolioFormValues,
  cover: CoverDraft,
  onProgress?: UploadProgressHandler,
): Promise<string> {
  const portfolioId = newPortfolioId(uid);
  let coverImage: StoredImage | null = null;

  if (cover.newFile) {
    coverImage = await uploadImage({
      uid,
      kind: 'portfolios',
      resourceId: portfolioId,
      file: cover.newFile,
      onProgress,
    });
  }

  try {
    await createPortfolio(uid, portfolioId, { ...values, coverImage });
    return portfolioId;
  } catch (error) {
    if (coverImage) {
      await deleteImages([coverImage.path]);
    }
    throw error;
  }
}

/**
 * Atualiza um portfólio. A capa antiga só é apagada após o documento ser salvo com sucesso.
 *
 * @returns `true` se alguma imagem antiga não pôde ser apagada (alteração salva mesmo assim).
 */
export async function updatePortfolioWithCover(
  uid: string,
  portfolio: Portfolio,
  values: PortfolioFormValues,
  cover: CoverDraft,
  onProgress?: UploadProgressHandler,
): Promise<boolean> {
  let coverImage: StoredImage | null = cover.current;

  if (cover.newFile) {
    coverImage = await uploadImage({
      uid,
      kind: 'portfolios',
      resourceId: portfolio.id,
      file: cover.newFile,
      onProgress,
    });
  }

  try {
    await updatePortfolio(uid, portfolio.id, { ...values, coverImage });
  } catch (error) {
    if (cover.newFile && coverImage) {
      await deleteImages([coverImage.path]);
    }
    throw error;
  }

  const previous = portfolio.coverImage;
  if (previous && previous.path !== coverImage?.path) {
    const failed = await deleteImages([previous.path]);
    return failed.length > 0;
  }
  return false;
}

/**
 * Exclui um portfólio.
 *
 * DECISÃO PENDENTE (ADR-009): o comportamento ao excluir um portfólio com projetos ainda não
 * foi aprovado. Por segurança e reversibilidade, a exclusão é BLOQUEADA enquanto houver
 * projetos vinculados — nenhum dado é apagado em cascata.
 *
 * @throws {AppError} `portfolioHasProjects` se houver projetos vinculados.
 */
export async function deletePortfolio(uid: string, portfolio: Portfolio): Promise<void> {
  const projectCount = await countProjectsByPortfolio(uid, portfolio.id);
  if (projectCount > 0) {
    throw new AppError('portfolioHasProjects');
  }

  await deletePortfolioDocument(uid, portfolio.id);
  if (portfolio.coverImage) {
    await deleteImages([portfolio.coverImage.path]);
  }
}
