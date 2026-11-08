import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { createEnv, imageRef } from './helpers';

let env: RulesTestEnvironment;

const portfolio = (uid: string, overrides: Record<string, unknown> = {}) => ({
  ownerId: uid,
  name: 'Design',
  description: '',
  coverImage: null,
  sortOrder: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

const project = (uid: string, portfolioId: string, overrides: Record<string, unknown> = {}) => ({
  ownerId: uid,
  portfolioId,
  name: 'App',
  description: '',
  coverImage: null,
  images: [],
  externalUrl: null,
  sortOrder: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

beforeAll(async () => {
  env = await createEnv();
});
afterAll(async () => env.cleanup());
beforeEach(async () => env.clearFirestore());

describe('Firestore — isolamento por usuário', () => {
  it('permite ao dono criar, ler, editar e excluir o próprio portfólio', async () => {
    const db = env.authenticatedContext('alice').firestore();
    const ref = doc(db, 'users/alice/portfolios/p1');
    await assertSucceeds(setDoc(ref, portfolio('alice')));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(updateDoc(ref, { name: 'Novo nome', updatedAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(ref));
  });

  it('nega acesso sem autenticação', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'users/alice/portfolios/p1')));
    await assertFails(setDoc(doc(db, 'users/alice/portfolios/p1'), portfolio('alice')));
  });

  it('nega a outro usuário ler, listar, criar, editar e excluir dados de terceiros', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/alice/portfolios/p1'), {
        ...portfolio('alice'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    const bob = env.authenticatedContext('bob').firestore();
    await assertFails(getDoc(doc(bob, 'users/alice/portfolios/p1')));
    await assertFails(getDocs(collection(bob, 'users/alice/portfolios')));
    await assertFails(setDoc(doc(bob, 'users/alice/portfolios/p2'), portfolio('alice')));
    await assertFails(setDoc(doc(bob, 'users/alice/portfolios/p2'), portfolio('bob')));
    await assertFails(updateDoc(doc(bob, 'users/alice/portfolios/p1'), { name: 'x', updatedAt: serverTimestamp() }));
    await assertFails(deleteDoc(doc(bob, 'users/alice/portfolios/p1')));
  });

  it('nega ownerId diferente do caminho e campos extras ou inválidos', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(db, 'users/alice/portfolios/p1'), portfolio('alice', { ownerId: 'bob' })));
    await assertFails(setDoc(doc(db, 'users/alice/portfolios/p1'), portfolio('alice', { isPublic: true })));
    await assertFails(setDoc(doc(db, 'users/alice/portfolios/p1'), portfolio('alice', { name: '' })));
    await assertFails(setDoc(doc(db, 'users/alice/portfolios/p1'), portfolio('alice', { name: 'x'.repeat(101) })));
  });

  it('nega alterar o proprietário de um documento existente', async () => {
    const alice = env.authenticatedContext('alice').firestore();
    await setDoc(doc(alice, 'users/alice/portfolios/p1'), portfolio('alice'));
    await assertFails(updateDoc(doc(alice, 'users/alice/portfolios/p1'), { ownerId: 'bob', updatedAt: serverTimestamp() }));
  });

  it('nega capa apontando para pasta de outro usuário', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(
      setDoc(doc(db, 'users/alice/portfolios/p1'), portfolio('alice', { coverImage: imageRef('bob', 'portfolios', 'p1') })),
    );
    await assertSucceeds(
      setDoc(doc(db, 'users/alice/portfolios/p1'), portfolio('alice', { coverImage: imageRef('alice', 'portfolios', 'p1') })),
    );
  });

  it('nega coleções fora do modelo', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(db, 'qualquer/coisa'), { a: 1 }));
    await assertFails(setDoc(doc(db, 'users/alice/outros/x'), { a: 1 }));
  });
});

describe('Firestore — projetos', () => {
  it('exige que o portfólio exista sob o mesmo usuário', async () => {
    const alice = env.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(alice, 'users/alice/projects/j1'), project('alice', 'inexistente')));
    await assertSucceeds(setDoc(doc(alice, 'users/alice/portfolios/p1'), portfolio('alice')));
    await assertSucceeds(setDoc(doc(alice, 'users/alice/projects/j1'), project('alice', 'p1')));
  });

  it('impede vincular projeto a portfólio de outro usuário', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/bob/portfolios/pb'), { ...portfolio('bob'), createdAt: new Date(), updatedAt: new Date() });
    });
    const alice = env.authenticatedContext('alice').firestore();
    // O ID "pb" só existe sob bob; sob alice não existe → negado.
    await assertFails(setDoc(doc(alice, 'users/alice/projects/j1'), project('alice', 'pb')));
  });

  it('impede mover projeto existente para portfólio inexistente', async () => {
    const alice = env.authenticatedContext('alice').firestore();
    await setDoc(doc(alice, 'users/alice/portfolios/p1'), portfolio('alice'));
    await setDoc(doc(alice, 'users/alice/projects/j1'), project('alice', 'p1'));
    await assertFails(updateDoc(doc(alice, 'users/alice/projects/j1'), { portfolioId: 'x', updatedAt: serverTimestamp() }));
  });

  it('limita galeria a 8 imagens e valida URL externa', async () => {
    const alice = env.authenticatedContext('alice').firestore();
    await setDoc(doc(alice, 'users/alice/portfolios/p1'), portfolio('alice'));
    const nine = Array.from({ length: 9 }, (_, i) => ({ path: `users/alice/projects/j1/${i}.jpg`, url: 'https://x.test/a.jpg' }));
    await assertFails(setDoc(doc(alice, 'users/alice/projects/j1'), project('alice', 'p1', { images: nine })));
    await assertFails(setDoc(doc(alice, 'users/alice/projects/j1'), project('alice', 'p1', { externalUrl: 'javascript:alert(1)' })));
    await assertSucceeds(setDoc(doc(alice, 'users/alice/projects/j1'), project('alice', 'p1', { externalUrl: 'https://exemplo.com' })));
  });

  it('permite reordenar (somente sortOrder) sem alterar updatedAt', async () => {
    const alice = env.authenticatedContext('alice').firestore();
    await setDoc(doc(alice, 'users/alice/portfolios/p1'), portfolio('alice'));
    await assertSucceeds(updateDoc(doc(alice, 'users/alice/portfolios/p1'), { sortOrder: 99 }));
    await assertFails(updateDoc(doc(alice, 'users/alice/portfolios/p1'), { name: 'sem updatedAt' }));
  });
});
