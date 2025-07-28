import type { Memo, UpdateMemoRequest } from '@/entities';
import { useMutateData } from '@/shared/hooks/useMutateData';
import type { UseMutateDataOptions } from '@/shared/types';

import { getIdbMemoRepository } from '../api';

interface UpdateMemoPayload {
  memoId: string;
  params: UpdateMemoRequest;
}

interface UseUpdateMemoOptions extends UseMutateDataOptions<Memo> {
  useHttp?: boolean;
}

export const useUpdateMemo = (options?: UseUpdateMemoOptions) => {
  const updateMemo = async ({ memoId, params }: UpdateMemoPayload) => {
    // @TODO : Http 메모 리포지토리 추가 시 조건부 처리
    const repository = await getIdbMemoRepository();
    return await repository.updateMemo(memoId, params);
  };

  return useMutateData<Memo, UpdateMemoPayload>(updateMemo, options);
};
