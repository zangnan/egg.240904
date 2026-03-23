# 应用日志分析接口说明

基于 `sys_app_log` 表的系统级日志统计分析功能。

## 基础信息

- **基础路径**: `/api/appLog`
- **请求方法**: POST
- **认证方式**: 无需认证（所有接口均为 POST 请求，自动跳过 JWT 验证）
- **响应格式**:
```json
{
  "code": "200",
  "msg": "success",
  "body": {}
}
```

---

## 1. 概览仪表盘

### 接口地址
`POST /api/appLog/overview`

### 接口描述
获取近7天日志总量、今日日志量、各级别统计（ERROR/WARN/INFO）、ERROR 占比、近7天趋势等核心指标。**默认查询近7天数据**。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD（不传默认近7天） |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD（不传默认近7天） |

### 请求示例
```
POST /api/appLog/overview
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| totalCount | number | 日志总量 |
| todayCount | number | 今日日志量 |
| errorCount | number | ERROR 总数 |
| warnCount | number | WARN 总数 |
| infoCount | number | INFO 总数 |
| errorRate | number | ERROR 占比 (%)，保留两位小数 |
| trendData | array | 近7天趋势数据 |
| trendData[].date | string | 日期 |
| trendData[].total | number | 当日总量 |
| trendData[].error | number | 当日 ERROR 数 |
| trendData[].warn | number | 当日 WARN 数 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "totalCount": 12580,
    "todayCount": 406,
    "errorCount": 56,
    "warnCount": 123,
    "infoCount": 12401,
    "errorRate": 0.45,
    "trendData": [
      { "date": "2024-01-25", "total": 380, "error": 5, "warn": 12 },
      { "date": "2024-01-26", "total": 420, "error": 8, "warn": 15 }
    ]
  }
}
```

---

## 2. 级别分布

### 接口地址
`POST /api/appLog/levelDistribution`

### 接口描述
获取日志级别分布，用于饼图展示。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

### 请求示例
```
POST /api/appLog/levelDistribution
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| level | string | 级别名称：INFO / ERROR / WARN |
| count | number | 数量 |
| percentage | number | 占比 (%)，保留两位小数 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": [
    { "level": "INFO", "count": 11500, "percentage": 91.45 },
    { "level": "WARN", "count": 800, "percentage": 6.36 },
    { "level": "ERROR", "count": 280, "percentage": 2.23 }
  ]
}
```

---

## 3. 趋势分析

### 接口地址
`POST /api/appLog/trend`

### 接口描述
按小时/天统计日志量趋势。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| type | string | 否 | 趋势类型：`hourly`(按小时) / `daily`(按天，默认) |

### 请求示例
```
POST /api/appLog/trend
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "type": "daily"
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| trend | array | 趋势数据列表 |
| trend[].time | string | 时间点（小时或日期） |
| trend[].total | number | 总量 |
| trend[].info | number | INFO 数量 |
| trend[].warn | number | WARN 数量 |
| trend[].error | number | ERROR 数量 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "trend": [
      { "time": "2024-01-01", "total": 420, "info": 380, "warn": 30, "error": 10 },
      { "time": "2024-01-02", "total": 385, "info": 350, "warn": 25, "error": 10 }
    ]
  }
}
```

---

## 4. 错误码统计

### 接口地址
`POST /api/appLog/errorCodes`

### 接口描述
统计 ERROR 的 error_code 分布，用于柱状图展示。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| limit | number | 否 | 返回条数，默认：10 |

### 请求示例
```
POST /api/appLog/errorCodes
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "limit": 10
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| errorCode | string | 错误码 |
| count | number | 出现次数 |
| firstTime | string | 首次出现时间 |
| lastTime | string | 最后出现时间 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": [
    { "errorCode": "E1001", "count": 45, "firstTime": "2024-01-01T08:00:00.000Z", "lastTime": "2024-01-31T18:30:00.000Z" },
    { "errorCode": "E1002", "count": 32, "firstTime": "2024-01-05T10:00:00.000Z", "lastTime": "2024-01-28T15:00:00.000Z" }
  ]
}
```

---

## 5. 来源分布 - 按 IP

### 接口地址
`POST /api/appLog/byIp`

### 接口描述
按 IP 地址统计日志分布，用于柱状图展示。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| level | string | 否 | 筛选级别：INFO / WARN / ERROR |
| limit | number | 否 | 返回条数，默认：10 |

### 请求示例
```
POST /api/appLog/byIp
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "limit": 10
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| ip | string | IP 地址 |
| totalCount | number | 日志总量 |
| errorCount | number | ERROR 数量 |
| warnCount | number | WARN 数量 |
| firstTime | string | 首次日志时间 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": [
    { "ip": "192.168.1.100", "totalCount": 3500, "errorCount": 45, "warnCount": 120, "firstTime": "2024-01-01T08:00:00.000Z" },
    { "ip": "192.168.1.101", "totalCount": 2800, "errorCount": 30, "warnCount": 80, "firstTime": "2024-01-02T09:00:00.000Z" }
  ]
}
```

---

## 6. 来源分布 - 按 URL

### 接口地址
`POST /api/appLog/byUrl`

### 接口描述
按请求 URL 统计日志分布，用于柱状图展示。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| level | string | 否 | 筛选级别：INFO / WARN / ERROR |
| limit | number | 否 | 返回条数，默认：10 |

### 请求示例
```
POST /api/appLog/byUrl
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "limit": 10
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| url | string | 请求 URL |
| totalCount | number | 日志总量 |
| errorCount | number | ERROR 数量 |
| warnCount | number | WARN 数量 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": [
    { "url": "/api/user/login", "totalCount": 1200, "errorCount": 45, "warnCount": 80 },
    { "url": "/api/order/create", "totalCount": 980, "errorCount": 32, "warnCount": 55 }
  ]
}
```

---

## 7. 24小时分布

### 接口地址
`POST /api/appLog/hourlyDistribution`

### 接口描述
分析每小时日志分布，用于柱状图展示。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

### 请求示例
```
POST /api/appLog/hourlyDistribution
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| hourlyDistribution | array | 每小时分布 (0-23点) |
| hourlyDistribution[].hour | number | 小时 (0-23) |
| hourlyDistribution[].total | number | 总量 |
| hourlyDistribution[].error | number | ERROR 数 |
| hourlyDistribution[].warn | number | WARN 数 |
| peakHour | object | 高峰时段 |
| peakHour.hour | number | 高峰小时 |
| peakHour.count | number | 高峰时段的日志数 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "hourlyDistribution": [
      { "hour": 0, "total": 120, "error": 5, "warn": 10 },
      { "hour": 1, "total": 45, "error": 2, "warn": 5 },
      { "hour": 2, "total": 30, "error": 1, "warn": 3 },
      ...
      { "hour": 14, "total": 720, "error": 25, "warn": 45 },
      ...
      { "hour": 23, "total": 350, "error": 15, "warn": 20 }
    ],
    "peakHour": { "hour": 14, "count": 720 }
  }
}
```

---

## 8. 星期分布

### 接口地址
`POST /api/appLog/weeklyDistribution`

### 接口描述
按星期统计日志分布。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

### 请求示例
```
POST /api/appLog/weeklyDistribution
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| distribution | array | 星期分布列表 |
| distribution[].dayOfWeek | number | 星期 (1=周日, 7=周六) |
| distribution[].dayName | string | 星期名称 |
| distribution[].total | number | 总量 |
| distribution[].error | number | ERROR 数 |
| distribution[].warn | number | WARN 数 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "distribution": [
      { "dayOfWeek": 1, "dayName": "周日", "total": 720, "error": 12, "warn": 35 },
      { "dayOfWeek": 2, "dayName": "周一", "total": 1850, "error": 45, "warn": 120 },
      { "dayOfWeek": 3, "dayName": "周二", "total": 1920, "error": 38, "warn": 105 },
      { "dayOfWeek": 4, "dayName": "周三", "total": 1880, "error": 42, "warn": 110 },
      { "dayOfWeek": 5, "dayName": "周四", "total": 1950, "error": 50, "warn": 115 },
      { "dayOfWeek": 6, "dayName": "周五", "total": 1900, "error": 48, "warn": 108 },
      { "dayOfWeek": 7, "dayName": "周六", "total": 850, "error": 15, "warn": 40 }
    ]
  }
}
```

---

## 错误码说明

| code | 说明 |
|------|------|
| 200 | 成功 |
| 500 | 服务器内部错误 |

---

## 数据表字段参考

`sys_app_log` 表字段：

| 字段名 | 说明 |
|--------|------|
| uuid | 主键 |
| level | 日志级别 (INFO / ERROR / WARN) |
| log_name | 日志名称 |
| message | 日志消息 |
| err_stack | 错误堆栈 |
| error_code | 错误码 |
| start_time | 日志时间 |
| ip_address | IP 地址 |
| user_agent | 用户代理 |
| request_url | 请求 URL |
| request_header | 请求头 (JSON) |
| request_body | 请求体 (JSON) |
