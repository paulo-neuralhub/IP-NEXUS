import { useEffect } from 'react';
import { usePageTitle } from '@/contexts/page-context';
import { WatchlistForm } from '@/components/features/spider/watchlist-form';

export default function NewWatchlistPage() {
  const { setTitle } = usePageTitle();
  
  useEffect(() => {
    setTitle('Nueva Vigilancia');
  }, [setTitle]);
  
  return (
    <div className="py-6 px-4 md:px-6">
      <WatchlistForm />
    </div>
  );
}
