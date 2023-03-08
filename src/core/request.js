import axios from 'axios'
import config from '../config/config'

import { Snackbar } from '@varlet/ui'

function createSnackbar(type,message) {
  let ok= Snackbar[type](message);
    setTimeout(() => {
     ok.clear();
    }, 5000)

}
// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: config.BASE_API_URL,

  // 请求超时时间
  timeout: 20000,
})

/**
 * 异常拦截处理器
 *
 * @param {*} error
 */
const errorHandler = error => {
  // 判断是否是响应错误信息
  if (error.response) {
    if (error.response.status == 401) {
      //qingchu
      location.reload()
    } else if (error.response.status == 403) {
      console.log("无权限操作")
      createSnackbar('error',"无权限操作")
    } else {
      console.log("网络异常,请稍后再试...")
      createSnackbar('error',"网络异常,请稍后再试...")
    }
  }
  if(error.code === 'ECONNABORTED' ||
  error.message === 'Network Error'){
    console.log("连接数据库服务器超时！")
    createSnackbar('error',"连接数据库服务器超时")
  }
  console.log("无网络调试信息",error)

  return Promise.reject(error)
}

// 请求拦截器
request.interceptors.request.use(config => {
  const token = '123'
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
}, errorHandler)

// 响应拦截器
request.interceptors.response.use(response => {
  return response.data
}, errorHandler)

/**
 * GET 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const get = (url, data = {}, options = {}) => {
  return request({
    url,
    params: data,
    method: 'get',
    ...options,
  })
}

/**
 * POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'post',
    data: data,
    ...options,
  })
}

/**
 * 上传文件 POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const upload = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'post',
    data: data,
    ...options,
  })
}
