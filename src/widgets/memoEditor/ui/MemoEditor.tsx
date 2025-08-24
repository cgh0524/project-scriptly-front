import { useEffect, useState } from 'react';

import { MemoHeader, type UpdateMemoRequest } from '@/entities';
import { useGetMemos } from '@/entities/memo/lib';
import { useGetMemo } from '@/entities/memo/lib/useGetMemo';
import { useUpdateMemo } from '@/entities/memo/lib/useUpdateMemo';
import { MarkdownEditor } from '@/features/memoEdit';
import { EmptyContent } from '@/shared/ui';

import * as S from './MemoEditor.styles';

export const MemoEditor = ({ memoId }: { memoId?: string }) => {
  const { data: memo, refetch: refetchMemo } = useGetMemo(memoId);
  const { refetch: refetchMemos } = useGetMemos({ immediate: false });
  const { mutate: mutateMemo } = useUpdateMemo({
    onSuccess: () => {
      refetchMemo();
      refetchMemos();
      // @TODO : 메모 저장 성공 시 토스트 메시지 표시
    },
    onError: () => {
      // @TODO : 메모 저장 실패 시 토스트 메시지 표시
    },
  });

  const [memoRequestParams, setMemoRequestParams] = useState<UpdateMemoRequest>({
    title: '',
    content: '',
    isPublic: false,
    isPinned: false,
  });

  const saveMemo = (params: UpdateMemoRequest) => {
    if (!memoId) return;
    if (memo?.title === params.title && memo?.content === params.content) return;

    mutateMemo({ memoId, params });
  };

  // 메모 제목 변경 핸들러
  const handleChangeTitle = (title: string) => {
    setMemoRequestParams((prev) => ({
      ...prev,
      title,
    }));

    saveMemo({
      ...memoRequestParams,
      title,
    });
  };

  // 메모 내용 변경 핸들러
  const handleChangeContent = (content: string) => {
    setMemoRequestParams((prev) => ({
      ...prev,
      content,
    }));

    saveMemo({
      ...memoRequestParams,
      content,
    });
  };

  // 메모 데이터 초기화
  useEffect(() => {
    setMemoRequestParams((prev) => ({
      ...prev,
      ...memo,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memo?.id]);

  return memo ? (
    <S.Container>
      <MemoHeader
        title={memoRequestParams.title}
        createdAt={memo.createdAt}
        titlePlaceholder="제목 없음"
        onChangeTitle={handleChangeTitle}
      />
      <MarkdownEditor content={memoRequestParams.content} onChangeContent={handleChangeContent} />
    </S.Container>
  ) : (
    <EmptyContent title="메모를 찾을 수 없습니다." />
  );
};
