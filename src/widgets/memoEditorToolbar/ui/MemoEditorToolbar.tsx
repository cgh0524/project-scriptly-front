import { useEffect, useRef } from 'react';
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

  const isDisabledCreateMemoButton = useRef(false);
  const { mutate: createMemo, loading: createMemoLoading } = useCreateMemo({
    useHttp: false,
    onSuccess: async () => {
      await refetch();
    },
  });

  const { mutate: deleteMemo, loading: deleteMemoLoading } = useDeleteMemo({
    useHttp: false,
    onSuccess: async () => {
      await refetch();
    },
  });

  const handleCreateMemo = async () => {
    if (isDisabledCreateMemoButton.current) return;

    await createMemo({
      title: '',
      content: '',
      isPublic: true,
    });

    setTimeout(() => {
      isDisabledCreateMemoButton.current = false;
    }, 300);
  };

  const handleDeleteMemo = () => {
    if (!memoId) return;
    deleteMemo(memoId);
  };

  useEffect(() => {
    if (memos.length === 0) {
      navigate('/', { replace: true });
      return;
    }

    navigate(`/memo/${memos[memos.length - 1].id}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memos.length]);

  return (
    <S.Container>
      <CreateMemoIconButton disabled={createMemoLoading} onClick={handleCreateMemo} />
      {memos.length > 0 && (
        <DeleteMemoIconButton disabled={deleteMemoLoading} onClick={handleDeleteMemo} />
      )}
    </S.Container>
  );
};
