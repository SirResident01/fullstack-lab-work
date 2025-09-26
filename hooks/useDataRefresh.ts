import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';

export function useDataRefresh() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      // Обновляем данные при переходе между страницами
      queryClient.invalidateQueries(['cars']);
      queryClient.invalidateQueries(['owners']);
      queryClient.invalidateQueries(['carStatistics']);
      queryClient.invalidateQueries(['ownerStatistics']);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [queryClient, router.events]);
}

