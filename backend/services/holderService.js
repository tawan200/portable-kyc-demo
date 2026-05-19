import { createECDH } from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../db.js'

export function registerHolder() {
  const ecdh = createECDH('secp256k1')
  ecdh.generateKeys()

  const privateKeyHex = ecdh.getPrivateKey('hex')
  const publicKeyHex = ecdh.getPublicKey('hex')
  const did = `did:example:holder-${uuidv4().slice(0, 8)}`
  const now = Math.floor(Date.now() / 1000)

  getDb()
    .prepare(
      'INSERT INTO holders (did, public_key_hex, private_key_hex, created_at) VALUES (?, ?, ?, ?)'
    )
    .run(did, publicKeyHex, privateKeyHex, now)

  // Returns privateKeyHex so the holder can store it client-side (demo only)
  return { did, publicKeyHex, privateKeyHex }
}

export function getHolder(did) {
  return getDb()
    .prepare('SELECT did, public_key_hex, created_at FROM holders WHERE did = ?')
    .get(did)
}
