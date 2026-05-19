import { Router } from 'express'
import QRCode from 'qrcode'
import { issueVC, getVC, listCredentials, revokeVC } from '../services/vcService.js'

const router = Router()

router.post('/issue-vc', async (req, res) => {
  const { holderDid, claims } = req.body
  if (!holderDid || !claims) {
    return res.status(400).json({ error: 'holderDid and claims are required' })
  }
  try {
    const credentials = await issueVC({ holderDid, claims })
    res.status(201).json({ credentials })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/credentials', (req, res) => {
  const { holderDid } = req.query
  res.json(listCredentials(holderDid))
})

router.get('/vc/:id', (req, res) => {
  const vc = getVC(req.params.id)
  if (!vc) return res.status(404).json({ error: 'Credential not found' })
  res.json(vc)
})

router.get('/vc/:id/qr', async (req, res) => {
  const vc = getVC(req.params.id)
  if (!vc) return res.status(404).json({ error: 'Credential not found' })
  try {
    const qr = await QRCode.toDataURL(vc.jwt)
    res.json({ qr, jwt: vc.jwt })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/vc/:id', (req, res) => {
  if (!revokeVC(req.params.id)) {
    return res.status(404).json({ error: 'Credential not found' })
  }
  res.json({ message: 'Credential revoked' })
})

export default router
