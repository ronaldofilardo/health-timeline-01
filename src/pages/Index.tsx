
import { useEffect } from 'react';
import Timeline from '@/components/timeline/Timeline';
import { AppLayout } from '@/components/layout/AppLayout';

export default function Index() {
  return (
    <AppLayout>
      <Timeline />
    </AppLayout>
  );
}
