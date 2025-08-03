import CreateMemoIcon from '@assets/create-memo.svg?react';
import type { ButtonHTMLAttributes } from 'react';

import { buttonSize, PrimaryButton } from '@/shared/ui';

type CreateMemoIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const CreateMemoIconButton = ({ ...props }: CreateMemoIconButtonProps) => {
  return (
    <PrimaryButton size={buttonSize.sm} {...props}>
      <CreateMemoIcon width={24} height={24} />
    </PrimaryButton>
  );
};
