import { Routes, Route } from 'react-router-dom'
import HolderWallet from './views/holder/holder-wallet.jsx'
import Issuer from './views/issuer/issuer.jsx'
import Verifier from './views/verifier/verifier.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HolderWallet />} />
      <Route path="/holder" element={<HolderWallet />} />
      <Route path="/issuer" element={<Issuer />} />
      <Route path="/verifier" element={<Verifier />} />
    </Routes>
  )
}
