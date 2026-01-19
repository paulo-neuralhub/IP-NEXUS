import { useEffect } from 'react';
import { usePageTitle } from '@/contexts/page-context';
import { PortalList } from '@/components/features/collab';

export default function CollabPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Portales de Cliente');
  }, [setTitle]);

  return <PortalList />;
}
