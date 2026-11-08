import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ImageThumb } from '@/components/shared/ImageThumb';
import { ROUTES } from '@/config/routes';
import type { Project } from '../types';

/** Cartão de projeto; opcionalmente mostra o nome do portfólio de origem. */
export function ProjectCard({ project, portfolioName }: { project: Project; portfolioName?: string }) {
  const { t } = useTranslation(['projects']);
  return (
    <Link
      to={ROUTES.projectDetail(project.id)}
      aria-label={t('projects:item.open', { name: project.name })}
      className="group block overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-accent"
    >
      <ImageThumb image={project.coverImage} alt="" />
      <div className="p-4">
        <h3 className="text-lg font-semibold break-words group-hover:text-accent">{project.name}</h3>
        {portfolioName && (
          <p className="mt-0.5 text-sm text-muted">{t('projects:item.inPortfolio', { name: portfolioName })}</p>
        )}
      </div>
    </Link>
  );
}
