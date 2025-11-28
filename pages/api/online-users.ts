import type { NextApiRequest, NextApiResponse } from 'next'

// Almacenamiento en memoria de usuarios activos
// En producción, esto debería estar en Redis o similar
const activeUsers = new Map<string, number>();

// Tiempo de expiración: 2 minutos
const EXPIRATION_TIME = 2 * 60 * 1000;

// Limpiar usuarios inactivos
function cleanupInactiveUsers() {
    const now = Date.now();
    for (const [userId, lastSeen] of activeUsers.entries()) {
        if (now - lastSeen > EXPIRATION_TIME) {
            activeUsers.delete(userId);
        }
    }
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        // Registrar actividad de usuario
        const userId = req.headers['x-user-id'] as string ||
            req.headers['x-forwarded-for'] as string ||
            req.socket.remoteAddress ||
            `user-${Math.random().toString(36).substr(2, 9)}`;

        activeUsers.set(userId, Date.now());
        cleanupInactiveUsers();

        return res.status(200).json({
            success: true,
            onlineUsers: activeUsers.size
        });
    } else if (req.method === 'GET') {
        // Obtener cantidad de usuarios en línea
        cleanupInactiveUsers();

        return res.status(200).json({
            onlineUsers: activeUsers.size
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
