import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getFirebase } from '@/infrastructure/firebase/firebaseApp';
import { STORAGE_PATHS, type MediaOwnerKind } from '@/infrastructure/firebase/paths';
import { AppError, logError, mapErrorCode, toAppError } from '@/lib/errors';
import type { StoredImage, UploadProgressHandler } from '../types';
import { EXTENSION_BY_MIME, isAllowedImageType, validateImageFile } from '../validation/fileValidation';

/** Parâmetros de upload de uma imagem vinculada a um portfólio ou projeto. */
export interface UploadImageParams {
  uid: string;
  kind: MediaOwnerKind;
  resourceId: string;
  file: File;
  onProgress?: UploadProgressHandler;
}

/**
 * Envia uma imagem ao Storage com nome aleatório (evita colisões e nomes previsíveis).
 * Valida tipo e tamanho antes de iniciar a transferência.
 */
export async function uploadImage({
  uid,
  kind,
  resourceId,
  file,
  onProgress,
}: UploadImageParams): Promise<StoredImage> {
  const validationError = validateImageFile(file);
  if (validationError || !isAllowedImageType(file.type)) {
    throw new AppError(validationError ?? 'invalidFileType');
  }

  const { storage } = getFirebase();
  const fileName = `${crypto.randomUUID()}.${EXTENSION_BY_MIME[file.type]}`;
  const path = `${STORAGE_PATHS.resourceFolder(uid, kind, resourceId)}/${fileName}`;
  const storageRef = ref(storage, path);

  try {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      cacheControl: 'private, max-age=31536000',
    });

    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
          }
        },
        reject,
        () => resolve(),
      );
    });

    const url = await getDownloadURL(storageRef);
    return { path, url };
  } catch (error) {
    const appError = toAppError(error);
    throw appError.code === 'unknown'
      ? new AppError('uploadFailed', { message: appError.message, cause: error })
      : appError;
  }
}

/** Exclui um arquivo do Storage. Arquivo já inexistente é tratado como sucesso. */
export async function deleteImage(path: string): Promise<void> {
  try {
    await deleteObject(ref(getFirebase().storage, path));
  } catch (error) {
    if (mapErrorCode(error) === 'notFound') {
      return;
    }
    throw toAppError(error);
  }
}

/**
 * Exclui vários arquivos em paralelo.
 * @returns os caminhos que não puderam ser excluídos (já registrados em log).
 */
export async function deleteImages(paths: string[]): Promise<string[]> {
  const results = await Promise.allSettled(paths.map((path) => deleteImage(path)));
  const failed: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const path = paths[index];
      if (path) {
        failed.push(path);
      }
      logError('media.deleteImages', result.reason);
    }
  });
  return failed;
}

/** Parâmetros de envio de várias imagens. */
export interface UploadImagesParams extends Omit<UploadImageParams, 'file' | 'onProgress'> {
  files: File[];
  /** Progresso agregado de 0 a 100. */
  onProgress?: UploadProgressHandler;
}

/**
 * Envia imagens em sequência, com progresso agregado.
 * Se uma falhar, as já enviadas nesta chamada são removidas e o erro é propagado.
 */
export async function uploadImages({
  files,
  onProgress,
  ...params
}: UploadImagesParams): Promise<StoredImage[]> {
  const uploaded: StoredImage[] = [];
  try {
    for (const [index, file] of files.entries()) {
      const image = await uploadImage({
        ...params,
        file,
        onProgress: (percent) => onProgress?.(Math.round((index * 100 + percent) / files.length)),
      });
      uploaded.push(image);
    }
    return uploaded;
  } catch (error) {
    await deleteImages(uploaded.map((image) => image.path));
    throw error;
  }
}
