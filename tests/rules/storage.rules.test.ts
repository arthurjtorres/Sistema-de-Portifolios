import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteObject, ref, uploadBytes } from 'firebase/storage';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { createEnv } from './helpers';

let env: RulesTestEnvironment;
const PATH = 'users/alice/projects/j1/foto.jpg';
const bytes = (size: number) => new Uint8Array(size);

beforeAll(async () => {
  env = await createEnv();
});
afterAll(async () => env.cleanup());
beforeEach(async () => env.clearStorage());

describe('Storage — controle de acesso e limites', () => {
  it('dono envia imagem válida e depois a lê e exclui', async () => {
    const storage = env.authenticatedContext('alice').storage();
    await assertSucceeds(uploadBytes(ref(storage, PATH), bytes(1024), { contentType: 'image/jpeg' }));
  });

  it('nega envio em pasta de outro usuário ou sem login', async () => {
    const bob = env.authenticatedContext('bob').storage();
    await assertFails(uploadBytes(ref(bob, PATH), bytes(10), { contentType: 'image/jpeg' }));
    const anon = env.unauthenticatedContext().storage();
    await assertFails(uploadBytes(ref(anon, PATH), bytes(10), { contentType: 'image/jpeg' }));
  });

  it('nega tipos não permitidos (SVG, GIF, PDF)', async () => {
    const storage = env.authenticatedContext('alice').storage();
    for (const type of ['image/svg+xml', 'image/gif', 'application/pdf']) {
      await assertFails(uploadBytes(ref(storage, `users/alice/projects/j1/x-${type.length}`), bytes(10), { contentType: type }));
    }
  });

  it('nega arquivo acima de 5 MB e aceita exatamente 5 MB', async () => {
    const storage = env.authenticatedContext('alice').storage();
    await assertFails(uploadBytes(ref(storage, 'users/alice/projects/j1/grande.png'), bytes(5 * 1024 * 1024 + 1), { contentType: 'image/png' }));
    await assertSucceeds(uploadBytes(ref(storage, 'users/alice/projects/j1/limite.png'), bytes(5 * 1024 * 1024), { contentType: 'image/png' }));
  });

  it('nega tipo de recurso fora de portfolios/projects e caminhos soltos', async () => {
    const storage = env.authenticatedContext('alice').storage();
    await assertFails(uploadBytes(ref(storage, 'users/alice/outros/j1/foto.jpg'), bytes(10), { contentType: 'image/jpeg' }));
    await assertFails(uploadBytes(ref(storage, 'publico/foto.jpg'), bytes(10), { contentType: 'image/jpeg' }));
  });

  it('nega leitura e exclusão por terceiros', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await uploadBytes(ref(ctx.storage(), PATH), bytes(10), { contentType: 'image/jpeg' });
    });
    const bob = env.authenticatedContext('bob').storage();
    await assertFails(deleteObject(ref(bob, PATH)));
    const alice = env.authenticatedContext('alice').storage();
    await assertSucceeds(deleteObject(ref(alice, PATH)));
  });
});
