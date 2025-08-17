import { useEffect, useRef } from 'react';

export const useRequestAnimationFrame = () => {
  const rafIdRef = useRef<number | null>(null);

  const executeRAF = (callback: FrameRequestCallback) => {
    // 기존 RAF 취소
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // 새 RAF 등록
    rafIdRef.current = requestAnimationFrame((timestamp) => {
      rafIdRef.current = null;
      callback(timestamp);
    });

    return rafIdRef.current;
  };

  const cancelRAF = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cancelRAF;
  }, []);

  return { executeRAF, cancelRAF };
};
