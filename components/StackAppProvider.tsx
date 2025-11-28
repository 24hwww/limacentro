'use client';

import React from 'react';
import { StackProvider } from '@stackframe/stack';
import { stackClientApp } from '../stack';

interface StackAppProviderProps {
  children: React.ReactNode;
}

export const StackAppProvider: React.FC<StackAppProviderProps> = ({ children }) => {
  return <StackProvider app={stackClientApp}>{children}</StackProvider>;
};
