import styled from 'styled-components';

import { fontSizes, spacing } from '@/shared/config/styles';
import type { Theme } from '@/shared/config/theme';
import { ListItem } from '@/shared/ui/layout/ListItem';

interface MemoListItemProps {
  $isSelected: boolean;
  theme: Theme;
}

export const MemoListItem = styled(ListItem)<MemoListItemProps>`
  display: flex;
  flex-direction: column;

  width: 100%;
  min-height: 68px;
  padding: ${spacing.sm};

  font-size: ${fontSizes.small};
  font-weight: 600;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.components.background.surfaceHover : 'transparent'};
`;

export const MemoTitle = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  font-size: ${fontSizes.h5};
  font-weight: 600;
`;

export const MemoCreatedAt = styled.span`
  font-size: ${fontSizes.small};
  font-weight: 400;
`;
