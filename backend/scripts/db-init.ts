/**
 * 数据库初始化/重置脚本
 * 用法: npm run db:init
 * 功能: 读取 init.sql 并执行，重置数据库到初始状态
 * 注意: 会 DROP 并重建数据库，仅限开发环境使用
 */
import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  // 生产环境保护
  if (process.env.NODE_ENV === 'production') {
    console.error('禁止在生产环境执行数据库重置！')
    process.exit(1)
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  })

  try {
    const sqlPath = path.resolve(__dirname, '..', 'init.sql')
    console.log(`正在读取 ${sqlPath} ...`)
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    const dbName = process.env.DB_NAME || 'tutu_baby'
    console.log(`正在删除数据库 ${dbName} ...`)
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``)

    console.log('正在执行 init.sql ...')
    await connection.query(sql)

    console.log('数据库初始化完成!')
  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

main()
