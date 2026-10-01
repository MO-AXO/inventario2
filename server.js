import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const prisma = new PrismaClient()
const port = Number(process.env.PORT || 3000)
const authSecret = new TextEncoder().encode(process.env.AUTH_SECRET || 'inventario2-development-secret-change-me')

app.use(express.json())

function readCookie(request, name) {
  const cookies = request.headers.cookie?.split(';').map((cookie) => cookie.trim()) || []
  return cookies.find((cookie) => cookie.startsWith(`${name}=`))?.slice(name.length + 1)
}

async function createSession(user) {
  return new SignJWT({ userId: user.id, role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(authSecret)
}

async function currentUser(request) {
  const token = readCookie(request, 'inventario_session')
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, authSecret)
    return prisma.user.findUnique({ where: { id: String(payload.userId) } })
  } catch {
    return null
  }
}

function requireUser(handler) {
  return async (request, response) => {
    const user = await currentUser(request)
    if (!user) return response.status(401).json({ error: 'Sesión requerida.' })
    request.user = user
    return handler(request, response)
  }
}

function requireOwner(handler) {
  return requireUser((request, response) => request.user.role === 'OWNER' ? handler(request, response) : response.status(403).json({ error: 'Se requieren permisos de administrador.' }))
}

function setSessionCookie(response, token) {
  response.setHeader('Set-Cookie', `inventario_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
}

function clearSessionCookie(response) {
  response.setHeader('Set-Cookie', 'inventario_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0')
}

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true, database: 'connected' })
  } catch {
    res.status(503).json({ ok: false, database: 'unavailable' })
  }
})

app.get('/api/auth/status', async (_req, res) => {
  res.json({ hasUsers: await prisma.user.count() > 0 })
})

app.get('/api/auth/me', async (req, res) => {
  const user = await currentUser(req)
  if (!user) return res.status(401).json({ error: 'No hay una sesión activa.' })
  res.json({ id: user.id, name: user.name, role: user.role })
})

app.post('/api/auth/bootstrap', async (req, res) => {
  if (await prisma.user.count() > 0) return res.status(409).json({ error: 'El administrador inicial ya fue creado.' })
  const name = String(req.body?.name || '').trim()
  const pin = String(req.body?.pin || '').trim()
  if (!name || !/^\d{4,8}$/.test(pin)) return res.status(400).json({ error: 'Nombre y PIN numérico de 4 a 8 dígitos son obligatorios.' })
  const user = await prisma.user.create({ data: { name, pin: await bcrypt.hash(pin, 12), role: 'OWNER' } })
  const token = await createSession(user)
  setSessionCookie(res, token)
  res.status(201).json({ id: user.id, name: user.name, role: user.role })
})

app.post('/api/auth/login', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const pin = String(req.body?.pin || '').trim()
  const user = await prisma.user.findFirst({ where: { name, active: true } })
  if (!user || !(await bcrypt.compare(pin, user.pin))) return res.status(401).json({ error: 'Usuario o PIN incorrecto.' })
  const token = await createSession(user)
  setSessionCookie(res, token)
  res.json({ id: user.id, name: user.name, role: user.role })
})

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res)
  res.status(204).end()
})

app.get('/api/users', requireOwner(async (_req, res) => {
  res.json(await prisma.user.findMany({ select: { id: true, name: true, role: true, active: true, createdAt: true }, orderBy: { name: 'asc' } }))
}))

app.post('/api/users', requireOwner(async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const pin = String(req.body?.pin || '').trim()
  const role = req.body?.role === 'OWNER' ? 'OWNER' : 'EMPLOYEE'
  if (!name || !/^\d{4,8}$/.test(pin)) return res.status(400).json({ error: 'Nombre y PIN numérico de 4 a 8 dígitos son obligatorios.' })
  const user = await prisma.user.create({ data: { name, pin: await bcrypt.hash(pin, 12), role } })
  res.status(201).json({ id: user.id, name: user.name, role: user.role, active: user.active })
}))

app.patch('/api/users/:id/active', requireOwner(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { active: Boolean(req.body?.active) } })
  res.json({ id: user.id, active: user.active })
}))

app.get('/api/categories', requireUser(async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  res.json(categories)
}))

app.post('/api/categories', requireOwner(async (req, res) => {
  const name = String(req.body?.name || '').trim()
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' })
  const category = await prisma.category.upsert({ where: { name }, update: {}, create: { name } })
  res.status(201).json(category)
}))

app.delete('/api/categories/:id', requireOwner(async (req, res) => {
  const products = await prisma.product.count({ where: { categoryId: req.params.id } })
  if (products > 0) return res.status(409).json({ error: 'No se puede eliminar una categoría con productos.' })
  await prisma.category.delete({ where: { id: req.params.id } })
  res.status(204).end()
}))

app.get('/api/products', requireUser(async (_req, res) => {
  const products = await prisma.product.findMany({ include: { category: true, inventory: true }, orderBy: { name: 'asc' } })
  res.json(products)
}))

app.post('/api/products', requireOwner(async (req, res) => {
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
}))

app.get('/api/inventory', requireUser(async (_req, res) => {
  const items = await prisma.inventoryItem.findMany({ include: { product: true }, orderBy: { name: 'asc' } })
  res.json(items)
}))

app.post('/api/inventory', requireOwner(async (req, res) => {
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
}))

app.post('/api/inventory/:id/movements', requireUser(async (req, res) => {
  const quantity = Number(req.body?.quantity)
  const reason = String(req.body?.reason || 'Ajuste manual').trim()
  if (!Number.isFinite(quantity) || quantity === 0) return res.status(400).json({ error: 'La cantidad debe ser distinta de cero.' })
  const item = await prisma.inventoryItem.update({ where: { id: req.params.id }, data: { currentStock: { increment: quantity }, movements: { create: { quantity, reason } } } })
  res.json(item)
}))

app.get('/api/recipes', requireUser(async (_req, res) => {
  const recipes = await prisma.recipe.findMany({ include: { outputItem: true, ingredients: { include: { item: true } }, productions: { orderBy: { producedAt: 'desc' }, take: 5 } }, orderBy: { name: 'asc' } })
  res.json(recipes)
}))

app.post('/api/recipes', requireOwner(async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const outputItemId = String(req.body?.outputItemId || '')
  const yieldQuantity = Number(req.body?.yieldQuantity)
  const yieldUnit = String(req.body?.yieldUnit || 'UNIDAD')
  const ingredients = Array.isArray(req.body?.ingredients) ? req.body.ingredients : []
  if (!name || !outputItemId || !Number.isFinite(yieldQuantity) || yieldQuantity <= 0 || !ingredients.length) return res.status(400).json({ error: 'Nombre, elaborado, rendimiento e ingredientes son obligatorios.' })
  const recipe = await prisma.recipe.create({ data: { name, outputItemId, yieldQuantity, yieldUnit, ingredients: { create: ingredients.map((ingredient) => ({ itemId: String(ingredient.itemId), quantity: Number(ingredient.quantity) })) } }, include: { outputItem: true, ingredients: { include: { item: true } } } })
  res.status(201).json(recipe)
}))

app.post('/api/recipes/:id/produce', requireUser(async (req, res) => {
  const quantity = Number(req.body?.quantity)
  if (!Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ error: 'La cantidad a producir debe ser mayor que cero.' })
  const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id }, include: { ingredients: { include: { item: true } }, outputItem: true } })
  if (!recipe) return res.status(404).json({ error: 'Fórmula no encontrada.' })
  const factor = quantity / Number(recipe.yieldQuantity)
  const required = recipe.ingredients.map((ingredient) => ({ ...ingredient, amount: Number(ingredient.quantity) * factor }))
  const missing = required.find((ingredient) => Number(ingredient.item.currentStock) < ingredient.amount)
  if (missing) return res.status(409).json({ error: `Stock insuficiente para ${missing.itemId}.` })
  const totalCost = required.reduce((sum, ingredient) => sum + ingredient.amount * Number(ingredient.item.cost), 0)
  const result = await prisma.$transaction(async (transaction) => {
    for (const ingredient of required) await transaction.inventoryItem.update({ where: { id: ingredient.itemId }, data: { currentStock: { decrement: ingredient.amount }, movements: { create: { quantity: -ingredient.amount, reason: `Producción: ${recipe.name}` } } } })
    await transaction.inventoryItem.update({ where: { id: recipe.outputItemId }, data: { currentStock: { increment: quantity }, movements: { create: { quantity, reason: `Producción: ${recipe.name}` } } } })
    return transaction.productionBatch.create({ data: { recipeId: recipe.id, quantity, unitCost: totalCost / quantity } })
  })
  res.status(201).json(result)
}))

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
