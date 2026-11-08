import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Cria o ambiente de testes apontando para os emuladores (host/porta vêm de `firebase emulators:exec`). */
export async function createEnv(projectId = 'demo-portfolio-manager'): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8') },
    storage: { rules: readFileSync(resolve(process.cwd(), 'storage.rules'), 'utf8') },
  });
}

/** Imagem de exemplo no formato salvo nos documentos. */
export function imageRef(uid: string, kind: 'portfolios' | 'projects', resourceId: string) {
  return { path: `users/${uid}/${kind}/${resourceId}/foto.jpg`, url: 'https://exemplo.test/foto.jpg' };
}
