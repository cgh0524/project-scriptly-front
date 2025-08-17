import styled, { css } from 'styled-components';

import { fontSizes, spacing } from '@/shared/config/styles';

const baseBlockStyles = css`
  margin-bottom: calc(${spacing.sm} + 4px);

  outline: none;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;

  &:empty::before {
    content: attr(data-placeholder);
    color: ${({ theme }) => theme.colors.components.text.muted};
    pointer-events: none;
  }
`;

export const Block = styled.div`
  ${baseBlockStyles}
  font-size: ${fontSizes.body};
`;

export const H1 = styled.h1`
  ${baseBlockStyles}
  font-size: ${fontSizes.h1};
`;

export const H2 = styled.h2`
  ${baseBlockStyles}
  font-size: ${fontSizes.h2};
`;

export const H3 = styled.h3`
  ${baseBlockStyles}
  font-size: ${fontSizes.h3};
`;

export const H4 = styled.h4`
  ${baseBlockStyles}
  font-size: ${fontSizes.h4};
`;

export const H5 = styled.h5`
  ${baseBlockStyles}
  font-size: ${fontSizes.h5};
`;

export const H6 = styled.h6`
  ${baseBlockStyles}
  font-size: ${fontSizes.h6};
`;
