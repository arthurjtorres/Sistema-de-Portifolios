import type { StoredImage } from '@/modules/media/types';

/**
 * Miniatura de capa com proporção fixa. Sem imagem, mostra um bloco neutro decorativo
 * (não é um dado fictício: apenas ocupa o espaço da capa ausente).
 */
export function ImageThumb({ image, alt, className = '' }: { image: StoredImage | null; alt: string; className?: string }) {
  return (
    <div className={`aspect-[16/10] overflow-hidden bg-accent-soft ${className}`}>
      {image ? (
        <img src={image.url} alt={alt} loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="grid size-full place-items-center text-accent/50" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="m21 16-5-5-8 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
