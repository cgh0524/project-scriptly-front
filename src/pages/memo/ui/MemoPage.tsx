import { useParams } from 'react-router';

import { MemoEditor } from '@/widgets/memoEditor';

export const MemoPage = () => {
  const { memoId } = useParams();

  return <MemoEditor memoId={memoId} />;
};
