'use client';

import { ReactNode } from 'react';

// Force dynamic rendering for all auth pages
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}