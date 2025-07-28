import { useEffect, useRef } from 'react';

interface Options<T> {
  value: T;
  delay: number;
  immediate?: boolean;
}

export const useDebounce = <T>(
  callback: (value: T) => void,
  { value, delay, immediate = false }: Options<T>,
): void => {
  const immediateRef = useRef(immediate);

  useEffect(() => {
    if (immediateRef.current) {
      immediateRef.current = false;
      return;
    }

    const handler = setTimeout(() => {
      callback(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay, immediate]);

  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     if (isRunning.current) {
  //       isRunning.current = false;
  //       return;
  //     }

  //     callback(value);
  //   }, delay);

  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [value, delay, callback, immediate]);
};
