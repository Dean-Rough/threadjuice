'use client';

import { useParams } from 'next/navigation';
import { QueryProvider } from '@/providers/QueryProvider';
import SimplePostDetail from '@/components/features/SimplePostDetail';

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <QueryProvider>
      <SimplePostDetail postId={slug} showSidebar={true} showRelated={true} />
    </QueryProvider>
  );
}
