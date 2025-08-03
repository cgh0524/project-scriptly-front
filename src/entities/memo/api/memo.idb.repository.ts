import dayjs from 'dayjs';

import type { IdbMemo } from '@/entities/memo/model/idb.types';
import type { CreateMemoRequest, Memo, UpdateMemoRequest } from '@/entities/memo/model/types';
import { schema } from '@/shared/lib/indexedDB';
import { executeTransaction } from '@/shared/lib/indexedDB/transaction';

import type { MemoRepository } from './memo.repository';

const toDomain = (dbMemo: IdbMemo): Memo => ({
  id: dbMemo.id,
  title: dbMemo.title,
  content: dbMemo.content,
  createdAt: dayjs(dbMemo.createdAt).format('YYYY-MM-DD HH:mm:ss'),
  updatedAt: dayjs(dbMemo.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
  isPinned: dbMemo.isPinned,
  isPublic: dbMemo.isPublic,
  password: dbMemo.password,
  folderId: dbMemo.folderId,
});

const toIdb = (memo: CreateMemoRequest, createdAt?: string): IdbMemo => ({
  id: crypto.randomUUID(),
  title: memo.title,
  content: memo.content,
  isPinned: false,
  isPublic: memo.isPublic,
  password: memo.password,
  folderId: memo.folderId,
  createdAt: createdAt ?? dayjs().toISOString(),
  updatedAt: dayjs().toISOString(),
});

/**
 * IndexedDB는 삭제/수정 할 데이터의 존재여부와 상관없이 항상 성공을 반환함.
 * REST API교체를 대비해서 삭제/수정할 데이터가 없는 경우까지 고려하여 코드 작성.
 *
 * Promise 객체로 반환하도록 작성하여 비동기 처리 가능하도록 함.
 */

export const createIdbMemoRepository = (db: IDBDatabase): MemoRepository => {
  const getMemos = async (): Promise<Memo[]> => {
    const idbMemos = await executeTransaction<IdbMemo[]>(
      db,
      schema.memo.name,
      'readonly',
      async (store) => {
        const request = store.getAll();
        return new Promise<IdbMemo[]>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },
    );
    return idbMemos?.map(toDomain).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) ?? [];
  };

  const getMemo = async (id: string): Promise<Memo> => {
    const idbMemo = await executeTransaction<IdbMemo | undefined>(
      db,
      schema.memo.name,
      'readonly',
      async (store) => {
        const request = store.get(id);
        return new Promise<IdbMemo | undefined>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },
    );

    if (!idbMemo) {
      throw new Error(`Memo with id ${id} not found`);
    }
    return toDomain(idbMemo);
  };

  const createMemo = async (memo: CreateMemoRequest): Promise<Memo> => {
    const idbMemo = await executeTransaction<IdbMemo>(
      db,
      schema.memo.name,
      'readwrite',
      async (store) => {
        const newIdbMemo = toIdb(memo);
        await new Promise<void>((resolve, reject) => {
          const req = store.add(newIdbMemo);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        return newIdbMemo;
      },
    );

    if (!idbMemo) {
      throw new Error('Failed to create memo');
    }
    return toDomain(idbMemo);
  };

  const updateMemo = async (id: string, data: UpdateMemoRequest): Promise<Memo> => {
    // 존재 확인 및 도메인 변환
    const existing = await getMemo(id);

    const updatedDomain: Memo = {
      ...existing,
      ...data,
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    const updatedIdb = await executeTransaction<IdbMemo>(
      db,
      schema.memo.name,
      'readwrite',
      async (store) => {
        const entity = toIdb(updatedDomain, existing.createdAt);
        await new Promise<void>((resolve, reject) => {
          const req = store.put({ ...entity, id });
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        return entity;
      },
    );

    if (!updatedIdb) {
      throw new Error(`Failed to update memo with id ${id}`);
    }
    return toDomain(updatedIdb);
  };

  const deleteMemo = async (id: string): Promise<Memo> => {
    const idbMemo = await executeTransaction<IdbMemo | undefined>(
      db,
      schema.memo.name,
      'readwrite',
      async (store) => {
        const existing = await new Promise<IdbMemo | undefined>((resolve, reject) => {
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result as IdbMemo | undefined);
          req.onerror = () => reject(req.error);
        });
        if (!existing) return undefined;

        await new Promise<void>((resolve, reject) => {
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        return existing;
      },
    );

    if (!idbMemo) {
      throw new Error(`Memo with id ${id} not found`);
    }
    return toDomain(idbMemo);
  };

  return { getMemos, getMemo, createMemo, updateMemo, deleteMemo };
};
