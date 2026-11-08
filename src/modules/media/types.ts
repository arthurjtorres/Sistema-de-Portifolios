/** Referência a uma imagem armazenada no Firebase Storage, persistida nos documentos. */
export interface StoredImage {
  /** Caminho completo no bucket. Usado para exclusão e verificado pelas Security Rules. */
  path: string;
  /** URL de download. Ver ADR-013 sobre a natureza de "capacidade" desse link. */
  url: string;
}

/** Callback de progresso do upload, de 0 a 100. */
export type UploadProgressHandler = (percent: number) => void;

/** Rascunho da imagem de capa em um formulário: imagem já salva e/ou novo arquivo escolhido. */
export interface CoverDraft {
  /** Imagem atualmente salva; `null` se não há ou se o usuário a removeu. */
  current: StoredImage | null;
  /** Novo arquivo selecionado; quando presente, substitui `current` ao salvar. */
  newFile: File | null;
}

/** Rascunho da galeria: imagens mantidas e novos arquivos a enviar. */
export interface GalleryDraft {
  kept: StoredImage[];
  newFiles: File[];
}
