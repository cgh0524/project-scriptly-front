import styled from 'styled-components';

import { spacing } from '@/shared/config/styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  gap: ${spacing.md};

  max-width: 100%;
  overflow-wrap: break-word;
`;
