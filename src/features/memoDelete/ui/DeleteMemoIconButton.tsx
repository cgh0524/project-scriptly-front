import DeleteMemoIcon from '@assets/delete-memo.svg?react';
import type { ButtonHTMLAttributes } from 'react';

import { buttonSize, PrimaryButton } from '@/shared/ui';

type DeleteMemoIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const DeleteMemoIconButton = ({ ...props }: DeleteMemoIconButtonProps) => {
  return (
    <PrimaryButton size={buttonSize.sm} {...props}>
      <DeleteMemoIcon width={24} height={24} />
    </PrimaryButton>
  );
};
