import styled from 'styled-components';

import { fontSizes } from '@/shared/config/styles';
import type { Theme } from '@/shared/config/theme';

interface MemoHeaderProps {
  theme: Theme;
}

export const MemoHeader = styled.div<MemoHeaderProps>`
  display: flex;
  flex-direction: column;
`;

export const CreatedAt = styled.div`
  text-align: center;

  font-size: ${fontSizes.small};
  font-weight: 600;
`;

export const Title = styled.div<MemoHeaderProps>`
  font-size: ${fontSizes.h3};
  font-weight: bold;

  outline: none;

  word-wrap: break-word;
  white-space: pre-wrap;

  &:empty::before {
    content: attr(data-placeholder);
    color: ${({ theme }) => theme.colors.components.text.muted};
    pointer-events: none;
  }
`;
