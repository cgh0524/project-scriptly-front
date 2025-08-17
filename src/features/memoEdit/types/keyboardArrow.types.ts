export const KEYBOARD_ARROW_DIRECTION = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
} as const;

export type KeyboardArrowDirection =
  (typeof KEYBOARD_ARROW_DIRECTION)[keyof typeof KEYBOARD_ARROW_DIRECTION];
