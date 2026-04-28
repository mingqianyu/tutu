import axios from 'axios'
import { showToast } from 'vant'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

// 防止多个 401 响应重复跳转登录页
let isRedirectingToLogin = false

// 请求拦截器 — 自动附加 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 — 统一错误处理，提取 { success, data } 中的 data
request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && body.success) {
      // 带分页 meta 的响应，保留 { data, meta } 结构
      if (body.meta) {
        return { data: body.data, meta: body.meta }
      }
      // 普通响应，直接返回 data
      if (body.data !== undefined) {
        return body.data
      }
    }
    return body
  },
  (error) => {
    const { response } = error

    if (response) {
      switch (response.status) {
        case 401:
          // Token 过期，清除状态并跳转登录（防止重复跳转）
          if (!isRedirectingToLogin) {
            isRedirectingToLogin = true
            localStorage.removeItem('token')
            showToast('登录已过期，请重新登录')
            router.replace('/login').finally(() => {
              isRedirectingToLogin = false
            })
          }
          break
        case 403:
          showToast('没有权限')
          break
        case 404:
          showToast('请求的资源不存在')
          break
        default:
          showToast(response.data?.error || '请求失败，请稍后重试')
      }
    } else {
      showToast('网络异常，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

export default request
