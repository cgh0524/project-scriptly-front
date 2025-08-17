import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useCreateMemo, useGetMemos } from '@/entities/memo/lib';
import { buttonSize, PrimaryButton } from '@/shared/ui/button';
import { EmptyContent } from '@/shared/ui/empty/EmptyContent';

/** 메모가 하나도 없을 때 보여줄 페이지 */
export const EntryPage = () => {
  const navigate = useNavigate();

  const { data: memos, refetch } = useGetMemos({ immediate: false });
  const { mutate: createMemo, loading: createMemoLoading } = useCreateMemo({
    useHttp: false,
    onSuccess: async () => {
      await refetch();
    },
  });

  const handleCreateMemo = async () => {
    if (createMemoLoading) return;

    await createMemo({
      title: '',
      content: '',
      isPublic: true,
    });
  };

  useEffect(() => {
    if (memos.length === 0) {
      navigate('/', { replace: true });
      return;
    }

    navigate(`/memo/${memos[memos.length - 1].id}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memos.length]);

  if (memos.length === 0) {
    return (
      <EmptyContent title="메모가 없습니다.">
        <PrimaryButton width="140px" size={buttonSize.lg} onClick={handleCreateMemo}>
          메모 추가
        </PrimaryButton>
      </EmptyContent>
    );
  }

  return null;
};
