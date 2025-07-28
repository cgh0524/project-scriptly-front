import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { MemoHeader, type UpdateMemoRequest } from '@/entities';
import { useGetMemo } from '@/entities/memo/lib/useGetMemo';
import { useGetMemos } from '@/entities/memo/lib/useGetMemos';
import { useUpdateMemo } from '@/entities/memo/lib/useUpdateMemo';
import { MarkdownEditor } from '@/features/memoEdit';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { EmptyContent } from '@/shared/ui';

import * as S from './MemoPage.styles';

export const MemoPage = () => {
  const { memoId } = useParams();

  const { data: memo } = useGetMemo(memoId);
  const { refetch: refetchMemos } = useGetMemos({ immediate: false });
  const { mutate: mutateMemo } = useUpdateMemo({
    onSuccess: () => {
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
    mutateMemo({ memoId, params });
  };

  // 메모 저장 디바운싱
  useDebounce(saveMemo, {
    value: memoRequestParams,
    delay: 2000,
    immediate: false,
  });

  // 메모 제목 변경 핸들러
  const handleChangeTitle = (title: string) => {
    setMemoRequestParams((prev) => ({
      ...prev,
      title,
    }));
  };

  // 메모 내용 변경 핸들러
  const handleChangeContent = (content: string) => {
    setMemoRequestParams((prev) => ({
      ...prev,
      content,
    }));
  };

  // 메모 데이터 초기화
  useEffect(() => {
    setMemoRequestParams((prev) => ({
      ...prev,
      ...memo,
    }));
  }, [memo]);

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
