import { ES256KSigner } from 'did-jwt'
import { Resolver } from 'did-resolver'
import { createECDH } from 'crypto'
import { getDb } from '../db.js'

const ISSUER_PRIVATE_KEY =
  process.env.ISSUER_PRIVATE_KEY ||
  '1da6c16de2cbaf7ad8cfd0f68d9209b36f6af65b3bbc29ecc54b7d4a9793be57'

export const ISSUER_DID = process.env.ISSUER_DID || 'did:example:kyc-issuer'

const ecdh = createECDH('secp256k1')
ecdh.setPrivateKey(Buffer.from(ISSUER_PRIVATE_KEY, 'hex'))
const issuerPublicKeyHex = ecdh.getPublicKey('hex')

export const issuer = {
  did: ISSUER_DID,
  signer: ES256KSigner(Buffer.from(ISSUER_PRIVATE_KEY, 'hex')),
  alg: 'ES256K',
}

function buildDidDocument(did, publicKeyHex) {
  return {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyHex,
      },
    ],
    authentication: [`${did}#key-1`],
  }
}

export function createResolver() {
  return new Resolver({
    example: async (did) => {
      if (did === ISSUER_DID) {
        return {
          didResolutionMetadata: { contentType: 'application/did+ld+json' },
          didDocument: buildDidDocument(ISSUER_DID, issuerPublicKeyHex),
          didDocumentMetadata: {},
        }
      }

      const holder = getDb()
        ?.prepare('SELECT public_key_hex FROM holders WHERE did = ?')
        .get(did)

      if (holder) {
        return {
          didResolutionMetadata: { contentType: 'application/did+ld+json' },
          didDocument: buildDidDocument(did, holder.public_key_hex),
          didDocumentMetadata: {},
        }
      }

      return {
        didResolutionMetadata: { error: 'notFound' },
        didDocument: null,
        didDocumentMetadata: {},
      }
    },
  })
}
