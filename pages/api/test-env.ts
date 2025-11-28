import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.status(200).json({
        keyExists: !!process.env.STACK_SECRET_SERVER_KEY,
        keyLength: process.env.STACK_SECRET_SERVER_KEY?.length,
        nodeEnv: process.env.NODE_ENV
    })
}
