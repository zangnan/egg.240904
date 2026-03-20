# API 日志分析接口说明

基于 `sys_api_log` 表的接口使用情况分析功能。

## 基础信息

- **基础路径**: `/api/analysis`
- **请求方法**: POST
- **认证方式**: 无需认证（所有接口均为 POST 请求，自动跳过 JWT 验证）
- **响应格式**:
```json
{
  "code": "200",
  "msg": "success",
  "body": { }
}
```

---

## 1. 概览仪表盘

### 接口地址
`POST /api/analysis/overview`

### 接口描述
获取总调用次数、日均调用量、平均响应时间、接口数量、用户数、错误率等核心指标。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

### 请求示例
```
POST /api/analysis/overview
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| totalCalls | number | 总调用次数 |
| dailyAvg | number | 日均调用量 |
| avgResponseTime | number | 平均响应时间 (ms) |
| apiCount | number | 涉及的不同接口数 |
| userCount | number | 涉及的访问用户数 |
| errorRate | number | 错误率 (%)，保留两位小数 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "totalCalls": 12580,
    "dailyAvg": 406,
    "avgResponseTime": 235,
    "apiCount": 45,
    "userCount": 12,
    "errorRate": 2.35
  }
}
```

---

## 2. 趋势分析

### 接口地址
`POST /api/analysis/trend`

### 接口描述
按小时/天/周统计调用量趋势和响应时间变化。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| type | string | 否 | 趋势类型：`hourly`(按小时) / `daily`(按天，默认) / `weekly`(按周) |

### 请求示例
```
POST /api/analysis/trend
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
| volumeTrend | array | 调用量趋势列表 |
| volumeTrend[].date | string | 日期 |
| volumeTrend[].count | number | 调用次数 |
| timeTrend | array | 响应时间趋势列表 |
| timeTrend[].date | string | 日期 |
| timeTrend[].avgTime | number | 平均响应时间 (ms) |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "volumeTrend": [
      { "date": "2024-01-01", "count": 420 },
      { "date": "2024-01-02", "count": 385 }
    ],
    "timeTrend": [
      { "date": "2024-01-01", "avgTime": 230 },
      { "date": "2024-01-02", "avgTime": 215 }
    ]
  }
}
```

---

## 3. 按接口统计

### 接口地址
`POST /api/analysis/byInterface`

### 接口描述
按接口地址统计调用次数、平均响应时间、错误率等信息。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| limit | number | 否 | 返回条数，默认：20 |

### 请求示例
```
POST /api/analysis/byInterface
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
| interface | string | 接口地址 |
| callCount | number | 调用次数 |
| avgTime | number | 平均响应时间 (ms) |
| maxTime | number | 最大响应时间 (ms) |
| minTime | number | 最小响应时间 (ms) |
| errorCount | number | 错误次数 |
| errorRate | string | 错误率 (%)，保留两位小数 |
| lastCallTime | string | 最后调用时间 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": [
    {
      "interface": "/ns/base/list/user",
      "callCount": 2500,
      "avgTime": 156,
      "maxTime": 1250,
      "minTime": 45,
      "errorCount": 12,
      "errorRate": "0.48",
      "lastCallTime": "2024-01-31T18:30:00.000Z"
    }
  ]
}
```

---

## 4. 按用户统计

### 接口地址
`POST /api/analysis/byUser`

### 接口描述
按用户统计调用次数、使用的接口分布、平均响应时间等。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| limit | number | 否 | 返回条数，默认：20 |

### 请求示例
```
POST /api/analysis/byUser
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
| userId | string | 用户 ID |
| callCount | number | 调用次数 |
| avgTime | number | 平均响应时间 (ms) |
| firstCallTime | string | 首次访问时间 |
| lastCallTime | string | 最后访问时间 |
| apiDistribution | array | 该用户使用的接口分布 |
| apiDistribution[].interface | string | 接口地址 |
| apiDistribution[].count | number | 调用次数 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": [
    {
      "userId": "admin",
      "callCount": 5800,
      "avgTime": 198,
      "firstCallTime": "2024-01-01T08:00:00.000Z",
      "lastCallTime": "2024-01-31T18:30:00.000Z",
      "apiDistribution": [
        { "interface": "/ns/base/list/user", "count": 1200 },
        { "interface": "/ns/base/list/order", "count": 980 }
      ]
    }
  ]
}
```

---

## 5. 按响应码统计

### 接口地址
`POST /api/analysis/byStatusCode`

### 接口描述
按 HTTP 响应码统计分布，并提供错误请求的详细列表。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

### 请求示例
```
POST /api/analysis/byStatusCode
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| distribution | array | 响应码分布列表 |
| distribution[].statusCode | number | HTTP 响应码 |
| distribution[].count | number | 出现次数 |
| errorDetails | array | 错误请求详情 (最多50条) |
| errorDetails[].interface | string | 接口地址 |
| errorDetails[].statusCode | number | 响应码 |
| errorDetails[].userId | string | 用户 ID |
| errorDetails[].ip | string | IP 地址 |
| errorDetails[].callTime | string | 调用时间 |
| errorDetails[].responseTime | number | 响应时间 (ms) |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "distribution": [
      { "statusCode": 200, "count": 11500 },
      { "statusCode": 400, "count": 320 },
      { "statusCode": 401, "count": 45 },
      { "statusCode": 500, "count": 12 }
    ],
    "errorDetails": [
      {
        "interface": "/ns/base/list/user",
        "statusCode": 500,
        "userId": "admin",
        "ip": "192.168.1.100",
        "callTime": "2024-01-31T15:30:00.000Z",
        "responseTime": 1523
      }
    ]
  }
}
```

---

## 6. 按 IP 地址统计

### 接口地址
`POST /api/analysis/byIp`

### 接口描述
按 IP 地址统计调用次数、涉及的用户数和接口数，以及 IP 使用的接口分布。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| limit | number | 否 | 返回条数，默认：20 |

### 请求示例
```
POST /api/analysis/byIp
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
| callCount | number | 调用次数 |
| userCount | number | 涉及的用户数 |
| apiCount | number | 涉及的接口数 |
| apiDistribution | array | 该 IP 使用的接口分布 |
| apiDistribution[].interface | string | 接口地址 |
| apiDistribution[].count | number | 调用次数 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": [
    {
      "ip": "192.168.1.100",
      "callCount": 3500,
      "userCount": 3,
      "apiCount": 15,
      "apiDistribution": [
        { "interface": "/ns/base/list/user", "count": 1200 },
        { "interface": "/ns/base/list/order", "count": 800 }
      ]
    }
  ]
}
```

---

## 7. 性能分析

### 接口地址
`POST /api/analysis/performance`

### 接口描述
分析接口性能，包括慢接口排行和响应时间分布。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| limit | number | 否 | 返回条数，默认：20 |

### 请求示例
```
POST /api/analysis/performance
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
| slowInterfaces | array | 慢接口排行 (按平均响应时间降序) |
| slowInterfaces[].interface | string | 接口地址 |
| slowInterfaces[].avgTime | number | 平均响应时间 (ms) |
| slowInterfaces[].maxTime | number | 最大响应时间 (ms) |
| slowInterfaces[].callCount | number | 调用次数 |
| timeDistribution | array | 响应时间分布 |
| timeDistribution[].category | string | 分类：`lt100ms`(小于100ms) / `100-500ms` / `500ms-1s` / `gt1s`(大于1秒) |
| timeDistribution[].count | number | 请求数量 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "slowInterfaces": [
      {
        "interface": "/ns/base/exportExcel/report",
        "avgTime": 3250,
        "maxTime": 8500,
        "callCount": 45
      }
    ],
    "timeDistribution": [
      { "category": "lt100ms", "count": 5200 },
      { "category": "100-500ms", "count": 4800 },
      { "category": "500ms-1s", "count": 1800 },
      { "category": "gt1s", "count": 780 }
    ]
  }
}
```

---

## 8. 时段分析

### 接口地址
`POST /api/analysis/hourly`

### 接口描述
分析每小时调用量分布，识别高峰时段。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

### 请求示例
```
POST /api/analysis/hourly
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| hourlyDistribution | array | 每小时调用量分布 (0-23点) |
| hourlyDistribution[].hour | number | 小时 (0-23) |
| hourlyDistribution[].count | number | 调用次数 |
| peakHour | object | 高峰时段 |
| peakHour.hour | number | 高峰小时 |
| peakHour.count | number | 高峰时段的调用次数 |

### 响应示例
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "hourlyDistribution": [
      { "hour": 0, "count": 120 },
      { "hour": 1, "count": 45 },
      { "hour": 2, "count": 30 },
      ...
      { "hour": 9, "count": 580 },
      ...
      { "hour": 14, "count": 720 },
      ...
      { "hour": 23, "count": 350 }
    ],
    "peakHour": { "hour": 14, "count": 720 }
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

`sys_api_log` 表字段：

| 字段名 | 说明 |
|--------|------|
| uuid | 主键 |
| request_url | 请求地址 |
| request_header | 请求头 (JSON) |
| request_body | 请求体 (JSON) |
| response_body | 响应体 (JSON) |
| response_code | 响应码 |
| used_time | 响应时间 (ms) |
| start_time | 开始时间 |
| end_time | 结束时间 |
| user_id | 用户 ID |
| ip_address | IP 地址 |
| user_agent | 用户代理 |
| api_type | API 类型 |
| api_remark | API 备注 |
| controller | 控制器 |
