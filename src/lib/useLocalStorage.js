import { useEffect, useState } from "react";

/** localStorage에 값을 자동으로 저장/복원하는 useState 대체 훅. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage를 쓸 수 없는 환경(예: 프라이빗 모드)이면 조용히 무시한다.
    }
  }, [key, value]);

  return [value, setValue];
}
