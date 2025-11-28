'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

interface UserProfileRendererProps {
  children: (user: any) => React.ReactNode;
}

export default function UserProfileRenderer({ children }: UserProfileRendererProps) {
  const { data: session } = useSession();
  return <>{children(session?.user || null)}</>;
}
