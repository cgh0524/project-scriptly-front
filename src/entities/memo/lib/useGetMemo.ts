import type { Memo } from '@/entities';
import { getIdbMemoRepository } from '@/entities/memo/api';
import { useFetchData } from '@/shared/hooks/useFetchData';

type UseGetMemosOptions = {
  useHttp?: boolean;
  immediate?: boolean;
};

export const useGetMemo = (memoId: string = '', options?: UseGetMemosOptions) => {
  const { immediate = true } = options || {};

  const getMemo = async (memoId: string) => {
    // @TODO : 에러 모달 추가 필요
    if (!memoId) throw new Error('memoId is required');

    // @TODO : Http 메모 리포지토리 추가 시 조건부 처리
    const repository = await getIdbMemoRepository();
    return await repository.getMemo(memoId);
  };

  return useFetchData<Memo>(() => getMemo(memoId), {
    immediate,
    deps: [memoId],
  });
};
