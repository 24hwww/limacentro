'use client';

import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const OnlineUsersCounter = () => {
    const [onlineUsers, setOnlineUsers] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [userId] = useState(() => {
        // Generar ID único para este usuario
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem('user-session-id');
            if (!id) {
                id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('user-session-id', id);
            }
            return id;
        }
        return `user-${Math.random().toString(36).substr(2, 9)}`;
    });

    const sendHeartbeat = async () => {
        try {
            const response = await fetch('/api/online-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setOnlineUsers(data.onlineUsers);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error sending heartbeat:', error);
        }
    };

    const fetchOnlineUsers = async () => {
        try {
            const response = await fetch('/api/online-users');
            if (response.ok) {
                const data = await response.json();
                setOnlineUsers(data.onlineUsers);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching online users:', error);
        }
    };

    useEffect(() => {
        // Enviar heartbeat inicial
        sendHeartbeat();

        // Enviar heartbeat cada 30 segundos
        const heartbeatInterval = setInterval(sendHeartbeat, 30000);

        // Actualizar contador cada 10 segundos
        const updateInterval = setInterval(fetchOnlineUsers, 10000);

        // Enviar evento a Google Analytics
        const pingGA = () => {
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'user_active', {
                    user_id: userId,
                    timestamp: Date.now()
                });
            }
        };
        pingGA();
        const gaInterval = setInterval(pingGA, 30000);

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(updateInterval);
            clearInterval(gaInterval);
        };
    }, [userId]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                <Users className="w-3 h-3 animate-pulse" />
                <span className="font-medium">...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            <Users className="w-3 h-3 text-green-600" />
            <span className="font-medium text-green-700">{onlineUsers}</span>
            <span className="text-green-600">en línea</span>
        </div>
    );
};
