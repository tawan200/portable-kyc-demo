import { createVerifiableCredentialJwt } from 'did-jwt-vc'
import { v4 as uuidv4 } from 'uuid'
import { issuer, ISSUER_DID } from '../did/setup.js'
import { getDb } from '../db.js'

const VC_TYPES = {
  kyc: 'KYCCredential',
  income: 'IncomeCredential',
  workHistory: 'WorkHistoryCredential',
  tax: 'TaxCredential',
}

async function issueOneVC(holderDid, type, claims) {
  const id = uuidv4()
  const now = Math.floor(Date.now() / 1000)

  const vcPayload = {
    jti: `urn:uuid:${id}`,
    sub: holderDid,
    iss: ISSUER_DID,
    nbf: now,
    exp: now + 365 * 24 * 60 * 60,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', VC_TYPES[type]],
      id: `urn:uuid:${id}`,
      credentialSubject: { id: holderDid, ...claims },
    },
  }

  const jwt = await createVerifiableCredentialJwt(vcPayload, issuer)

  getDb()
    .prepare(
      'INSERT INTO credentials (id, holder_did, type, jwt, claims, status, issued_at) VALUES (?, ?, ?, ?, ?, \'active\', ?)'
    )
    .run(id, holderDid, type, jwt, JSON.stringify(claims), now)

  return { id, type, jwt, holderDid, claims, issuedAt: now }
}

export async function issueVC({ holderDid, claims }) {
  const types = Object.keys(claims).filter((t) => VC_TYPES[t])
  if (types.length === 0) throw new Error('No valid claim types: use kyc, income, workHistory, tax')

  const credentials = await Promise.all(
    types.map((type) => issueOneVC(holderDid, type, claims[type]))
  )
  return credentials
}

export function getVC(id) {
  const row = getDb().prepare('SELECT * FROM credentials WHERE id = ?').get(id)
  if (!row) return null
  return { ...row, claims: JSON.parse(row.claims) }
}

export function listCredentials(holderDid) {
  const db = getDb()
  const rows = holderDid
    ? db
        .prepare('SELECT * FROM credentials WHERE holder_did = ? ORDER BY issued_at DESC')
        .all(holderDid)
    : db.prepare('SELECT * FROM credentials ORDER BY issued_at DESC').all()
  return rows.map((r) => ({ ...r, claims: JSON.parse(r.claims) }))
}

export function revokeVC(id) {
  const result = getDb()
    .prepare("UPDATE credentials SET status = 'revoked' WHERE id = ?")
    .run(id)
  return result.changes > 0
}
