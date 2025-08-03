import { useMutateData } from '@/shared/hooks/useMutateData';
import type { UseMutateDataOptions } from '@/shared/types';

import { getIdbMemoRepository } from '../api';
import type { Memo } from '../model';

interface UseDeleteMemoOptions extends UseMutateDataOptions<Memo> {
  useHttp?: boolean;
}

export const useDeleteMemo = (options?: UseDeleteMemoOptions) => {
  const deleteMemo = async (id: string) => {
    const repository = await getIdbMemoRepository();
    return await repository.deleteMemo(id);
  };

  return useMutateData<Memo, string>(deleteMemo, options);
};
