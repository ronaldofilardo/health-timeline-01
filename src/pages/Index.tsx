
import { useEffect } from 'react';
import Timeline from '@/components/timeline/Timeline';
import { MainLayout } from '@/components/layout/MainLayout';

export default function Index() {
  return (
    <MainLayout title="Timeline">
      <Timeline />
    </MainLayout>
  );
}
