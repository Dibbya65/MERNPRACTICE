import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequest = useRef([]);

  const sendRequest = useCallback(
    async (url, method = 'GET', requestData = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortCtrll = new AbortController();
      activeHttpRequest.current.push(httpAbortCtrll);
      try {
        const res = await fetch(url, {
          method: method,
          body: requestData,
          headers: headers,
          signal: httpAbortCtrll.signal,
        });
        const resData = await res.json();
        activeHttpRequest.current = activeHttpRequest.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrll
        );
        if (!res.ok) {
          throw new Error(resData.message);
        }
        setIsLoading(false);
        return resData;
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
        throw error;
      }
    },
    []
  );
  const clearError = () => {
    setError(null);
  };
  useEffect(() => {
    return () => {
      activeHttpRequest.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);
  return { isLoading, error, sendRequest, clearError };
};
