import { Router } from 'express'
import { verifyVP } from '../services/vpService.js'

const router = Router()

router.post('/verify-vp', async (req, res) => {
  const { vpJwt } = req.body
  if (!vpJwt) return res.status(400).json({ error: 'vpJwt is required' })
  try {
    const result = await verifyVP(vpJwt)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
