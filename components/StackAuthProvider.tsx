'use client';

import { StackProvider } from "@stackframe/stack";

export default function StackAuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <StackProvider
            app={{
                projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
            }}
        >
            {children}
        </StackProvider>
    );
}
