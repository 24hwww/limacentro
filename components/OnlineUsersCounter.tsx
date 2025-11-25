'use client';

import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const OnlineUsersCounter = () => {
    useEffect(() => {
        const ping = () => {
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'user_ping', { alive: true });
            }
        };

        ping();

        const intervalId = setInterval(ping, 30000);

        return () => clearInterval(intervalId);
    }, []);

    return null;
};
