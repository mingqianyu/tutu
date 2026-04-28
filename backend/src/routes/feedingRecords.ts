import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import * as feedingRecordController from '../controllers/feedingRecordController'

const router = Router()

// 所有路由都需要鉴权
router.use(authMiddleware)

// 获取日汇总数据（必须在 /:id 之前）
router.get('/summary', feedingRecordController.getSummary)

// 获取统计数据（必须在 /:id 之前）
router.get('/statistics', feedingRecordController.getStatistics)

// 获取某类型最近一条记录（必须在 /:id 之前）
router.get('/last/:type', feedingRecordController.getLastByType)

// 获取喂养记录列表
router.get('/', feedingRecordController.getList)

// 获取喂养记录详情
router.get('/:id', feedingRecordController.getDetail)

// 创建喂养记录
router.post('/', feedingRecordController.create)

// 更新喂养记录
router.put('/:id', feedingRecordController.update)

// 删除喂养记录
router.delete('/:id', feedingRecordController.remove)

export default router
