import { type CreateMemoRequest, type Memo } from '@/entities';
import { getIdbMemoRepository } from '@/entities/memo/api';
import { useMutateData } from '@/shared/hooks/useMutateData';
import type { UseMutateDataOptions } from '@/shared/types';

interface UseCreateMemoOptions extends UseMutateDataOptions<Memo> {
  useHttp?: boolean;
}

export const useCreateMemo = (options?: UseCreateMemoOptions) => {
  const createMemo = async (params: CreateMemoRequest) => {
    // @TODO : Http 메모 리포지토리 추가 시 조건부 처리
    const repository = await getIdbMemoRepository();
    return await repository.createMemo(params);
  };

  return useMutateData<Memo, CreateMemoRequest>(createMemo, options);
};
