import { Router } from 'express'
import { registerHolder, getHolder } from '../services/holderService.js'
import { createVP } from '../services/vpService.js'

const router = Router()

router.post('/holder/register', (req, res) => {
  try {
    const holder = registerHolder()
    res.status(201).json(holder)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/holder/:did', (req, res) => {
  const holder = getHolder(decodeURIComponent(req.params.did))
  if (!holder) return res.status(404).json({ error: 'Holder not found' })
  res.json(holder)
})

router.post('/create-vp', async (req, res) => {
  const { holderDid, vcJwts } = req.body
  if (!holderDid || !vcJwts?.length) {
    return res.status(400).json({ error: 'holderDid and vcJwts are required' })
  }
  try {
    const vpJwt = await createVP({ holderDid, vcJwts })
    res.json({ vpJwt })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
