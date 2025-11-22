'use client';

import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const OnlineUsersCounter = () => {
    const [onlineCount, setOnlineCount] = useState<number>(0);

    useEffect(() => {
        // 1. Identify User
        let userId = localStorage.getItem('analytics_user_id');
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('analytics_user_id', userId);
        }

        const ping = async () => {
            try {
                // Ping Backend
                await fetch('/api/analytics/ping', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: userId }),
                });

                // Ping GA4
                if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'user_ping', { alive: true });
                }

                // Update Count
                const res = await fetch('/api/analytics/online');
                if (res.ok) {
                    const data = await res.json();
                    setOnlineCount(data.count);
                }
            } catch (error) {
                console.error('Ping failed', error);
            }
        };

        // Initial ping
        ping();

        // Interval
        const intervalId = setInterval(ping, 30000); // 30 seconds

        return () => clearInterval(intervalId);
    }, []);

    if (onlineCount === 0) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <Users className="w-4 h-4" />
            <span>{onlineCount} en línea</span>
        </div>
    );
};
