# Tutu 宝宝成长记录

一款简洁美观的宝宝日常记录应用，支持记录喂养、睡眠、尿布、身高体重等成长数据。

## 功能特性

- **喂养记录**：母乳、配方奶、辅食、喝水等
- **睡眠记录**：记录宝宝睡眠时间
- **尿布记录**：记录换尿布情况
- **成长数据**：身高、体重跟踪
- **相册功能**：记录宝宝精彩瞬间
- **数据统计**：可视化喂养数据

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite
- Pinia 状态管理
- Vant 4 UI 组件库
- ECharts 数据可视化
- TailwindCSS

### 后端
- Express + TypeScript
- MySQL 数据库
- JWT 认证
- Multer 文件上传

## 项目结构

```
tutu/
├── backend/           # 后端服务
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── routes/       # 路由
│   │   ├── services/     # 业务逻辑
│   │   ├── middlewares/  # 中间件
│   │   └── config/       # 配置
│   └── uploads/          # 上传文件
├── frontend/          # 前端应用
│   └── src/
│       ├── components/   # 组件
│       ├── views/        # 页面
│       ├── stores/       # 状态管理
│       ├── composables/  # 组合式函数
│       └── utils/        # 工具函数
└── docker-compose.yml    # Docker 配置
```

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/mingqianyu/tutu.git
cd tutu
```

2. 启动后端
```bash
cd backend
npm install
npm run dev
```

3. 启动前端
```bash
cd frontend
npm install
npm run dev
```

### Docker 部署

```bash
docker-compose up -d
```

## API 文档

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 宝宝
- `GET /api/babies` - 获取宝宝列表
- `POST /api/babies` - 添加宝宝
- `PUT /api/babies/:id` - 更新宝宝信息
- `DELETE /api/babies/:id` - 删除宝宝

### 喂养记录
- `GET /api/feeding-records` - 获取记录列表
- `POST /api/feeding-records` - 创建记录
- `PUT /api/feeding-records/:id` - 更新记录
- `DELETE /api/feeding-records/:id` - 删除记录

### 媒体
- `POST /api/upload` - 上传图片
- `GET /api/media` - 获取媒体列表

## 截图

![首页](./screenshots/01-首页/首页-宝宝记录.jpg)
![记录页](./screenshots/02-记录页/记录页.jpg)
![统计页](./screenshots/03-统计页/统计页-今日数据.jpg)
![时间线](./screenshots/04-时间线/时间线-今日记录.jpg)

## License

MIT
