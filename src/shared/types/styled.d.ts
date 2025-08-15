import 'styled-components';

import type { Theme } from '@/shared/config/theme';

// styled-components 타입 확장
declare module 'styled-components' {
  // 일반적인 패턴이므로 eslint rule 비활성화
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {}
}
