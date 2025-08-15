import styled, { css } from 'styled-components';

const baseBlockStyles = css`
  outline: none;

  &:empty::before {
    content: attr(data-placeholder);
    color: ${({ theme }) => theme.colors.components.text.muted};
    pointer-events: none;
  }
`;

export const Block = styled.div`
  ${baseBlockStyles}
`;

export const H1 = styled.h1`
  ${baseBlockStyles}
`;

export const H2 = styled.h2`
  ${baseBlockStyles}
`;

export const H3 = styled.h3`
  ${baseBlockStyles}
`;

export const H4 = styled.h4`
  ${baseBlockStyles}
`;

export const H5 = styled.h5`
  ${baseBlockStyles}
`;

export const H6 = styled.h6`
  ${baseBlockStyles}
`;
