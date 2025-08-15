import styled from 'styled-components';

export const Block = styled.div`
  outline: none;

  &:empty::before {
    content: attr(data-placeholder);
    color: #999;
  }
`;
