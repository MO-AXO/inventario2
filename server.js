import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const prisma = new PrismaClient()
const port = Number(process.env.PORT || 3000)

app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true, database: 'connected' })
  } catch {
    res.status(503).json({ ok: false, database: 'unavailable' })
  }
})

app.get('/api/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  res.json(categories)
})

app.post('/api/categories', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' })
  const category = await prisma.category.upsert({ where: { name }, update: {}, create: { name } })
  res.status(201).json(category)
})

app.delete('/api/categories/:id', async (req, res) => {
  const products = await prisma.product.count({ where: { categoryId: req.params.id } })
  if (products > 0) return res.status(409).json({ error: 'No se puede eliminar una categoría con productos.' })
  await prisma.category.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

app.get('/api/products', async (_req, res) => {
  const products = await prisma.product.findMany({ include: { category: true, inventory: true }, orderBy: { name: 'asc' } })
  res.json(products)
})

app.post('/api/products', async (req, res) => {
  const body = req.body || {}
  const name = String(body.name || '').trim()
  const categoryName = String(body.category || '').trim()
  if (!name || !categoryName) return res.status(400).json({ error: 'Nombre y categoría son obligatorios.' })
  const category = await prisma.category.upsert({ where: { name: categoryName }, update: {}, create: { name: categoryName } })
  const product = await prisma.product.create({
    data: {
      name,
      categoryId: category.id,
      station: String(body.station || 'Ninguna'),
      price: Number(body.price || 0),
      emoji: String(body.emoji || '🍔'),
      prepMinutes: Number(body.prepMinutes || 15),
      inventory: {
        create: {
          name,
          type: 'RAW',
          unit: String(body.unit || 'UNIDAD'),
          minStock: Number(body.minStock || 0),
        },
      },
    },
    include: { category: true, inventory: true },
  })
  res.status(201).json(product)
})

app.get('/api/inventory', async (_req, res) => {
  const items = await prisma.inventoryItem.findMany({ include: { product: true }, orderBy: { name: 'asc' } })
  res.json(items)
})

app.post('/api/inventory', async (req, res) => {
  const body = req.body || {}
  const name = String(body.name || '').trim()
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' })
  const item = await prisma.inventoryItem.create({
    data: {
      name,
      type: body.type === 'FINISHED' ? 'FINISHED' : 'RAW',
      unit: String(body.unit || 'UNIDAD'),
      minStock: Number(body.minStock || 0),
      perishable: Boolean(body.perishable),
    },
  })
  res.status(201).json(item)
})

app.post('/api/inventory/:id/movements', async (req, res) => {
  const quantity = Number(req.body?.quantity)
  const reason = String(req.body?.reason || 'Ajuste manual').trim()
  if (!Number.isFinite(quantity) || quantity === 0) return res.status(400).json({ error: 'La cantidad debe ser distinta de cero.' })
  const item = await prisma.inventoryItem.update({ where: { id: req.params.id }, data: { currentStock: { increment: quantity }, movements: { create: { quantity, reason } } } })
  res.json(item)
})

app.use(express.static(path.join(__dirname, 'dist')))
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) return res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  next()
})

app.listen(port, () => console.log(`inventario2 server listening on port ${port}`))

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
