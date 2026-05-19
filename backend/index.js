import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDb } from './db.js'
import vcRoutes from './routes/vc.js'
import vpRoutes from './routes/vp.js'
import holderRoutes from './routes/holder.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api', vcRoutes)
app.use('/api', vpRoutes)
app.use('/api', holderRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

initDb()
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))
