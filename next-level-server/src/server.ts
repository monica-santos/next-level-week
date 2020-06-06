import express from 'express'
import cors from 'cors'
import path from 'path'
import routes from './routes'

const app = express()

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  console.log('req', req.originalUrl)
  next()
})
app.use(routes)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

app.listen(3333)
