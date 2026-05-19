import { createVerifiablePresentationJwt, verifyCredential } from 'did-jwt-vc'
import { decodeJWT, ES256KSigner } from 'did-jwt'
import { v4 as uuidv4 } from 'uuid'
import { createResolver } from '../did/setup.js'
import { getDb } from '../db.js'

export async function createVP({ holderDid, vcJwts }) {
  const holder = getDb()
    .prepare('SELECT * FROM holders WHERE did = ?')
    .get(holderDid)
  if (!holder) throw new Error('Holder not found')

  const holderIssuer = {
    did: holderDid,
    signer: ES256KSigner(Buffer.from(holder.private_key_hex, 'hex')),
    alg: 'ES256K',
  }

  const vpPayload = {
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: vcJwts,
    },
  }

  return createVerifiablePresentationJwt(vpPayload, holderIssuer)
}

export async function verifyVP(vpJwt) {
  const id = uuidv4()
  const now = Math.floor(Date.now() / 1000)
  const resolver = createResolver()

  try {
    // Decode VP (holder signature not verified — demo limitation)
    const { payload } = decodeJWT(vpJwt)
    const vcJwts = payload.vp?.verifiableCredential || []
    const holderDid = payload.iss || null

    // Verify each embedded VC's issuer signature (proper cryptographic check)
    const credentials = await Promise.all(
      vcJwts.map(async (vcJwt) => {
        const { verifiableCredential: vc } = await verifyCredential(vcJwt, resolver)
        return {
          type: vc.type,
          credentialSubject: vc.credentialSubject,
          issuer: vc.issuer,
          issuanceDate: vc.issuanceDate,
          expirationDate: vc.expirationDate,
        }
      })
    )

    const result = { success: true, holderDid, credentials }
    getDb()
      .prepare(
        'INSERT INTO verifications (id, vp_jwt, holder_did, success, result, verified_at) VALUES (?, ?, ?, 1, ?, ?)'
      )
      .run(id, vpJwt, holderDid, JSON.stringify(result), now)

    return result
  } catch (err) {
    const result = { success: false, error: err.message }
    getDb()
      .prepare(
        'INSERT INTO verifications (id, vp_jwt, holder_did, success, result, verified_at) VALUES (?, ?, NULL, 0, ?, ?)'
      )
      .run(id, vpJwt, JSON.stringify(result), now)

    return result
  }
}
