import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' })
    }

    const debugToken = process.env.DEBUG_API_TOKEN
    if (debugToken && req.headers['x-debug-token'] !== debugToken) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    res.status(200).json({
        keyExists: !!process.env.STACK_SECRET_SERVER_KEY,
        keyLength: process.env.STACK_SECRET_SERVER_KEY?.length,
        nodeEnv: process.env.NODE_ENV
    })
}
