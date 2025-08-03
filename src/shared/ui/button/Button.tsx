import type { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

import { useTheme } from '@/app/providers/ThemeProvider';
import {
  borderRadius,
  type ComponentSize,
  componentSize,
  fontSizes,
  spacing,
} from '@/shared/config/styles';
import type { Theme } from '@/shared/config/theme';

export const buttonSize = componentSize;
export type ButtonSize = ComponentSize;

// 버튼 사이즈별 스타일 매핑
export const buttonSizeStyle = {
  sm: {
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: fontSizes.small,
    borderRadius: borderRadius.md,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  md: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSizes.body,
    borderRadius: borderRadius.md,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  lg: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSizes.h5,
    borderRadius: borderRadius.md,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type ButtonSizeStyle = (typeof buttonSizeStyle)[keyof typeof buttonSizeStyle]; // 'sm'|'md'|'lg'

interface ButtonProps {
  width?: string;
  size: ButtonSize;
  disabled?: boolean;
  theme: Theme;
  children: React.ReactNode;
}

const BaseButtonStyle = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${({ width }) => width || 'auto'};
  min-width: 32px;
  padding: ${({ size }) => buttonSizeStyle[size].padding};

  border-radius: ${({ size }) => buttonSizeStyle[size].borderRadius};
  box-shadow: ${({ size }) => buttonSizeStyle[size].boxShadow};

  font-size: ${({ size }) => buttonSizeStyle[size].fontSize};
  font-weight: 900;
`;

const PrimaryButtonStyle = styled(BaseButtonStyle)<ButtonProps>`
  color: ${({ theme }) => theme.colors.components.text.onPrimary};
  background-color: ${({ theme }) => theme.colors.components.primary.active};

  &:hover {
    background-color: ${({ theme }) => theme.colors.components.primary.hover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.components.primary.active};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  width?: string;
  size?: ButtonSize;
  disabled?: boolean;
  children: React.ReactNode;
}

export const PrimaryButton = ({
  width,
  size = buttonSize.md,
  children,
  disabled,
  ...props
}: PrimaryButtonProps) => {
  const { theme } = useTheme();

  return (
    <PrimaryButtonStyle theme={theme} size={size} disabled={disabled} width={width} {...props}>
      {children}
    </PrimaryButtonStyle>
  );
};
