import { useEffect } from 'react';
import { usePageTitle } from '@/contexts/page-context';
import { PortalDetail } from '@/components/features/collab';

export default function PortalDetailPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Detalle del Portal');
  }, [setTitle]);

  return <PortalDetail />;
}
