import { useNavigate, useParams } from 'react-router';

import { useCreateMemo, useGetMemos } from '@/entities/memo/lib';
import { useDeleteMemo } from '@/entities/memo/lib/useDeleteMemo';
import { CreateMemoIconButton } from '@/features/memoCreate/ui';
import { DeleteMemoIconButton } from '@/features/memoDelete/ui';

import * as S from './MemoEditorToolbar.styles';

export const MemoEditorToolbar = () => {
  const navigate = useNavigate();
  const { memoId } = useParams();

  const { data: memos, refetch } = useGetMemos();

  const { mutate: createMemo, loading: createMemoLoading } = useCreateMemo({
    useHttp: false,
    onSuccess: async (data) => {
      await refetch();
      navigate(`/memo/${data.id}`, { replace: true });
    },
  });

  const { mutate: deleteMemo, loading: deleteMemoLoading } = useDeleteMemo({
    useHttp: false,
    onSuccess: async () => {
      await refetch();

      const oldMemos = memos;
      const deletedMemoIndex = oldMemos.findIndex((memo) => memo.id === memoId);

      const nextMemo = oldMemos[deletedMemoIndex + 1];
      if (nextMemo) {
        navigate(`/memo/${nextMemo.id}`, { replace: true });
        return;
      }

      const prevMemo = oldMemos[deletedMemoIndex - 1];
      if (prevMemo) {
        navigate(`/memo/${prevMemo.id}`, { replace: true });
        return;
      }
      navigate('/', { replace: true });
    },
  });

  const handleCreateMemo = () => {
    createMemo({
      title: '',
      content: '',
      isPublic: true,
    });
  };

  const handleDeleteMemo = () => {
    if (!memoId) return;
    deleteMemo(memoId);
  };

  return (
    <S.Container>
      <CreateMemoIconButton disabled={createMemoLoading} onClick={handleCreateMemo} />
      {memos.length > 0 && (
        <DeleteMemoIconButton disabled={deleteMemoLoading} onClick={handleDeleteMemo} />
      )}
    </S.Container>
  );
};
