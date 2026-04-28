import express from 'express'
import cors from 'cors'
import path from 'path'
import { env } from './config/env'
import { testConnection } from './config/database'
import { errorHandler } from './middlewares/errorHandler'
import { handleMulterError } from './middlewares/upload'
import authRoutes from './routes/auth'
import babyRoutes from './routes/babies'
import feedingRecordRoutes from './routes/feedingRecords'
import mediaRoutes from './routes/media'
import uploadRoutes from './routes/upload'

const app = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务 — 提供上传文件的访问
app.use('/uploads', express.static(path.join(__dirname, '..', env.UPLOAD_DIR)))

// API 路由
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/babies', babyRoutes)
app.use('/api/v1/feeding-records', feedingRecordRoutes)
app.use('/api/v1/media', mediaRoutes)
app.use('/api/v1/upload', uploadRoutes)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: '服务运行中' })
})

// Multer 上传错误处理（需在全局错误处理之前）
app.use(handleMulterError)

// 全局错误处理
app.use(errorHandler)

// 启动服务
async function start() {
  try {
    await testConnection()
    app.listen(env.PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${env.PORT}`)
    })
  } catch (error) {
    console.error('启动失败:', error)
    process.exit(1)
  }
}

start()
