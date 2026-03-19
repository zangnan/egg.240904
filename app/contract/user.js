'use strict';

module.exports = {
  // 创建用户请求参数 [3](@ref)
  createUserRequest: {
    username: {
      type: 'string',
      required: true,
      description: '用户名',
      example: 'john_doe',
      format: /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/,
    },
    password: {
      type: 'string',
      required: true,
      description: '密码',
      example: '123456',
      min: 6,
      max: 20,
    },
    email: {
      type: 'string',
      required: false,
      description: '邮箱',
      example: 'john@example.com',
      format: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    age: {
      type: 'integer',
      required: false,
      description: '年龄',
      example: 25,
      min: 0,
      max: 150,
    },
  },

  // 用户登录请求参数
  loginRequest: {
    username: { type: 'string', required: true, description: '用户名' },
    password: { type: 'string', required: true, description: '密码' },
  },

  // 用户信息响应
  userResponse: {
    id: { type: 'string', example: '1' },
    username: { type: 'string', example: 'john_doe' },
    email: { type: 'string', example: 'john@example.com' },
    age: { type: 'integer', example: 25 },
    createTime: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
  },

  // 用户查询参数
  queryUserRequest: {
    page: { type: 'integer', required: false, description: '页码', example: 1 },
    pageSize: { type: 'integer', required: false, description: '每页数量', example: 10 },
    keyword: { type: 'string', required: false, description: '搜索关键词' },
  },
};
