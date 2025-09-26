import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

export function useAutoRefresh(interval: number = 30000) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Обновляем данные при возвращении на вкладку
        queryClient.invalidateQueries(['cars']);
        queryClient.invalidateQueries(['owners']);
        queryClient.invalidateQueries(['carStatistics']);
        queryClient.invalidateQueries(['ownerStatistics']);
      }
    };

    const handleFocus = () => {
      // Обновляем данные при фокусе на окне
      queryClient.invalidateQueries(['cars']);
      queryClient.invalidateQueries(['owners']);
      queryClient.invalidateQueries(['carStatistics']);
      queryClient.invalidateQueries(['ownerStatistics']);
    };

    // Обновляем данные через заданный интервал
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries(['cars']);
      queryClient.invalidateQueries(['owners']);
      queryClient.invalidateQueries(['carStatistics']);
      queryClient.invalidateQueries(['ownerStatistics']);
    }, interval);

    // Слушаем изменения видимости страницы
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient, interval]);
}

