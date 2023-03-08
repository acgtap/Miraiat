import {  get,  } from '../core/request'


export const getList = data => {
  return get('/im/getList', data)
}
export const getChatRecord = data => {
  return get('/im/getChatRecord', data)
}