import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const API_KEY = process.env.LIVEKIT_API_KEY || ''
const API_SECRET = process.env.LIVEKIT_API_SECRET || ''
const LIVEKIT_URL = process.env.LIVEKIT_URL || ''

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { roomId, nickname } = req.body
  
  if (!roomId || !nickname) {
    return res.status(400).json({ error: 'roomId and nickname required' })
  }

  const participantId = nickname + '_' + uuidv4().slice(0, 8)
  
  const token = jwt.sign(
    {
      sub: participantId,
      name: nickname,
      iss: API_KEY,
      room: roomId,
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    API_SECRET,
    { algorithm: 'HS256' }
  )

  res.json({
    token,
    url: LIVEKIT_URL,
    participantId
  })
}