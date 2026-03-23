# 应用日志统计分析功能规划

## 一、需求概述

基于 `sys_app_log` 表实现系统级日志统计分析功能，以图表展示为主，针对 ERROR 和 WARN 级别进行重点分析。

---

## 二、数据表字段参考

`sys_app_log` 表主要字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| uuid | varchar(36) | 主键，UUID |
| level | varchar(10) | 日志级别：INFO / ERROR（建议扩展 WARN） |
| log_name | varchar(100) | 日志名称 |
| message | text | 日志消息 |
| err_stack | text | 错误堆栈 |
| error_code | varchar(50) | 错误码 |
| start_time | datetime | 日志时间 |
| ip_address | varchar(50) | IP 地址 |
| user_agent | text | 用户代理 |
| request_url | varchar(500) | 请求 URL |
| request_header | text | 请求头 (JSON) |
| request_body | text | 请求体 (JSON) |

---

## 三、前端展示板块设计

### 板块 1：日志概览仪表盘
- 时间范围：今天 / 近7天(默认) / 近30天 / 自定义
- **数字卡片**：近7天总量、近7天ERROR、近7天WARN、近7天INFO
- **近 7 天趋势迷你折线图**

### 板块 2：日志级别分布（饼图）
- 时间范围：今天 / 近7天(默认) / 近30天 / 自定义
- 展示 INFO / ERROR / WARN 占比
- 点击可下钻（联动其他图表筛选）

### 板块 3：日志趋势分析（折线图）
- 时间范围：今天 / 近7天 / 近30天 / 自定义
- X轴：时间（小时/天）
- Y轴：日志数量
- 支持切换显示 INFO / ERROR / WARN 趋势线

### 板块 4：错误分析（重点，全部图表展示）
- 时间范围：今天 / 近7天 / 近30天 / 自定义
- **ERROR 错误码 TOP10 柱状图**：按 error_code 统计出现频率
- **ERROR 来源分布柱状图**：按 IP 或 request_url 统计错误数量
- **ERROR 时段分析**：24小时分布柱状图

### 板块 5：来源分布
- 时间范围：今天 / 近7天 / 近30天 / 自定义
- **按 IP 分布柱状图**：TOP10 IP 及日志量
- **按请求 URL 分布**：TOP10 出错接口

### 板块 6：时间维度分析
- 时间范围：今天 / 近7天 / 近30天 / 自定义
- **24小时分布柱状图**：各时段日志量
- **按星期分布**：工作日 vs 周末日志量

---

## 四、API 接口设计（完整规范）

### 基础信息
- **基础路径**: `/api/appLog`
- **请求方法**: POST
- **认证方式**: 无需认证
- **响应格式**:
```json
{
  "code": "200",
  "msg": "success",
  "body": {}
}
```

---

### 1. 概览仪表盘

**接口地址**: `POST /api/appLog/overview`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

**请求示例**:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| totalCount | number | 日志总量 |
| todayCount | number | 今日日志量 |
| errorCount | number | ERROR 总数 |
| warnCount | number | WARN 总数 |
| infoCount | number | INFO 总数 |
| errorRate | number | ERROR 占比 (%) |
| trendData | array | 近7天趋势数据 |
| trendData[].date | string | 日期 |
| trendData[].total | number | 当日总量 |
| trendData[].error | number | 当日 ERROR 数 |
| trendData[].warn | number | 当日 WARN 数 |

**响应示例**:
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

### 2. 级别分布

**接口地址**: `POST /api/appLog/levelDistribution`

**接口描述**: 获取日志级别分布，用于饼图展示

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

**响应参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| level | string | 级别名称：INFO / ERROR / WARN |
| count | number | 数量 |
| percentage | number | 占比 (%)，保留两位小数 |

**响应示例**:
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

### 3. 趋势分析

**接口地址**: `POST /api/appLog/trend`

**接口描述**: 按小时/天统计日志量趋势

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| type | string | 否 | 趋势类型：`hourly`(按小时) / `daily`(按天，默认) |

**响应参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| trend | array | 趋势数据列表 |
| trend[].time | string | 时间点（小时或日期） |
| trend[].total | number | 总量 |
| trend[].info | number | INFO 数量 |
| trend[].warn | number | WARN 数量 |
| trend[].error | number | ERROR 数量 |

**响应示例**:
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

### 4. 错误码统计

**接口地址**: `POST /api/appLog/errorCodes`

**接口描述**: 统计 ERROR 的 error_code 分布，用于柱状图展示

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| limit | number | 否 | 返回条数，默认：10 |

**响应参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| errorCode | string | 错误码 |
| count | number | 出现次数 |
| firstTime | string | 首次出现时间 |
| lastTime | string | 最后出现时间 |

**响应示例**:
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

### 5. 来源分布 - 按 IP

**接口地址**: `POST /api/appLog/byIp`

**接口描述**: 按 IP 地址统计日志分布，用于柱状图展示

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| level | string | 否 | 筛选级别：INFO / WARN / ERROR |
| limit | number | 否 | 返回条数，默认：10 |

**响应参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| ip | string | IP 地址 |
| totalCount | number | 日志总量 |
| errorCount | number | ERROR 数量 |
| warnCount | number | WARN 数量 |
| firstTime | string | 首次日志时间 |

**响应示例**:
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

### 6. 来源分布 - 按 URL

**接口地址**: `POST /api/appLog/byUrl`

**接口描述**: 按请求 URL 统计日志分布，用于柱状图展示

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |
| level | string | 否 | 筛选级别：INFO / WARN / ERROR |
| limit | number | 否 | 返回条数，默认：10 |

**响应参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| url | string | 请求 URL |
| totalCount | number | 日志总量 |
| errorCount | number | ERROR 数量 |
| warnCount | number | WARN 数量 |

**响应示例**:
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

### 7. 24小时分布

**接口地址**: `POST /api/appLog/hourlyDistribution`

**接口描述**: 分析每小时日志分布，用于柱状图展示

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

**响应参数**:

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

**响应示例**:
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "hourlyDistribution": [
      { "hour": 0, "total": 120, "error": 5, "warn": 10 },
      { "hour": 1, "total": 45, "error": 2, "warn": 5 },
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

### 8. 星期分布

**接口地址**: `POST /api/appLog/weeklyDistribution`

**接口描述**: 按星期统计日志分布

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

**响应参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| distribution | array | 星期分布列表 |
| distribution[].dayOfWeek | number | 星期 (1=周一, 7=周日) |
| distribution[].dayName | string | 星期名称 |
| distribution[].total | number | 总量 |
| distribution[].error | number | ERROR 数 |
| distribution[].warn | number | WARN 数 |

**响应示例**:
```json
{
  "code": "200",
  "msg": "success",
  "body": {
    "distribution": [
      { "dayOfWeek": 1, "dayName": "周一", "total": 1850, "error": 45, "warn": 120 },
      { "dayOfWeek": 2, "dayName": "周二", "total": 1920, "error": 38, "warn": 105 },
      ...
      { "dayOfWeek": 6, "dayName": "周六", "total": 850, "error": 15, "warn": 40 },
      { "dayOfWeek": 7, "dayName": "周日", "total": 720, "error": 12, "warn": 35 }
    ]
  }
}
```

---

## 五、错误码说明

| code | 说明 |
|------|------|
| 200 | 成功 |
| 500 | 服务器内部错误 |

---

## 六、关键文件路径

| 文件 | 说明 |
|------|------|
| `app/controller/appLog.js` | 新建控制器 |
| `app/service/appLog.js` | 新建服务层 |
| `app/router.js` | 添加路由配置 |
| `app/contract/appLog.js` | 新建验证模式 |
| `app/docs/app-log-analysis.md` | 接口文档 |

---

## 七、实现步骤

1. **创建 Contract 验证模式** - 定义请求参数验证规则
2. **创建 Service 层** - 实现各接口的数据库查询逻辑
3. **创建 Controller 层** - 接收请求、调用 Service、返回响应
4. **配置路由** - 在 `app/router.js` 中注册所有 API 路由
5. **编写接口文档** - 按规范编写 `app/docs/app-log-analysis.md`
6. **前端对接** - 按板块设计实现图表页面

---

## 八、验证方式

1. 启动开发服务器 `npm run dev`
2. 使用 Swagger UI (`/swagger-ui.html`) 测试各接口
3. 验证各接口返回数据格式是否符合规范
4. 检查图表数据是否正确（折线图趋势、饼图占比、柱状图排名等）
