import { createBrowserRouter } from 'react-router';

import { RootLayout } from '@/app/layout/RootLayout';
import { loadIdbMemos } from '@/entities/memo/lib';
import { EntryPage } from '@/pages/entry/ui/EntryPage';
import { MemoPage } from '@/pages/memo/ui/MemoPage';
import { Loading } from '@/shared/ui';
import { IndexedDBLoading } from '@/shared/ui/loading/IndexedDBLoading';

/** React Router (Data Mode)
 * Data Mode vs FrameworkMode
 *
 * 복잡한 앱, 서버 중심의 설계 지향 → Data 모드(Framework 모드) 추천
 * 간단한 SPA, 기존 방식 익숙 → 일반 모드도 충분
 *
 * React Router 팀이 공식적으로는 **Data 모드(Framework 스타일)**를 권장하고 있음.
 * 특히 React Router v6.4+ 문서는 전부 Data APIs 기반으로 작성됨.
 */

/** 데이터베이스 초기화 로더 */
const localDataLoader = async () => {
  // indexedDb(로컬)에 있는 데이터 가져와서 atoms에 저장하기
  await loadIdbMemos();
};

export const router = createBrowserRouter(
  [
    {
      Component: RootLayout,
      loader: localDataLoader,
      children: [
        {
          index: true,
          Component: EntryPage,
          // @TEMP : memos를 root에서 로드하는 중. 추후 필요없는게 확정되면 삭제
          // loader: entryLoader,
          hydrateFallbackElement: <IndexedDBLoading />,
        },
        {
          path: 'memo/:memoId',
          hydrateFallbackElement: <Loading />,
          Component: MemoPage,
        },
      ],
    },
  ],
  {
    basename: '/project-scriptly-front',
  },
);
