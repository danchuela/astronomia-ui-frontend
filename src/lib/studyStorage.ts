import { MAX_STUDY_BYTES, studyBytes, type Study } from './studyData.ts';

const DB_NAME = 'astronomia_studies';
const STORE = 'studies';
const MAX_TOTAL_BYTES = 128 * 1024 * 1024;

function notify(id: string, deleted: boolean) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('astronomia-studies-changed', { detail: { id, deleted } }));
}

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('storage_blocked'));
  });
}

async function transaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error ?? new Error('storage_aborted'));
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}

export async function listStudies(): Promise<Study[]> {
  return (await transaction('readonly', store => store.getAll()) as Study[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveStudy(study: Study): Promise<void> {
  const size = studyBytes(study);
  if (size > MAX_STUDY_BYTES) throw new Error('study_size');
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const read = store.getAll();
      let failure: Error | undefined;
      read.onsuccess = () => {
        const others = (read.result as Study[]).filter(row => row.id !== study.id);
        if (others.length >= 50 || others.reduce((sum, row) => sum + studyBytes(row), size) > MAX_TOTAL_BYTES) {
          failure = new Error('study_quota');
          tx.abort();
        } else store.put(study);
      };
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(failure ?? tx.error ?? new Error('storage_aborted'));
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
  notify(study.id, false);
}

export async function deleteStudy(id: string): Promise<void> {
  await transaction('readwrite', store => store.delete(id));
  notify(id, true);
}
