'use strict';

const Service = require('egg').Service;

class ApiAnalysisService extends Service {

  /**
   * 构建日期范围条件
   */
  buildDateCondition(startDate, endDate) {
    let condition = '';
    const params = [];
    if (startDate) {
      condition += ' AND start_time >= ?';
      params.push(new Date(startDate));
    }
    if (endDate) {
      condition += ' AND start_time <= ?';
      params.push(new Date(endDate + ' 23:59:59'));
    }
    return { condition, params };
  }

  /**
   * 1. 概览仪表盘
   */
  async getOverview(startDate, endDate) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    // 总调用次数
    const totalSql = `SELECT COUNT(*) as total FROM sys_api_log WHERE 1=1 ${condition}`;
    const totalResult = await this.app.mysql.query(totalSql, params);
    const totalCalls = totalResult[0].total;

    // 计算天数
    let days = 1;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    }

    // 日均调用量
    const dailyAvg = Math.round(totalCalls / days);

    // 平均响应时间
    const avgTimeSql = `SELECT AVG(used_time) as avgTime FROM sys_api_log WHERE 1=1 ${condition}`;
    const avgTimeResult = await this.app.mysql.query(avgTimeSql, params);
    const avgResponseTime = Math.round(avgTimeResult[0].avgTime || 0);

    // 接口数量
    const apiCountSql = `SELECT COUNT(DISTINCT request_url) as count FROM sys_api_log WHERE 1=1 ${condition}`;
    const apiCountResult = await this.app.mysql.query(apiCountSql, params);
    const apiCount = apiCountResult[0].count;

    // 用户数
    const userCountSql = `SELECT COUNT(DISTINCT user_id) as count FROM sys_api_log WHERE 1=1 ${condition}`;
    const userCountResult = await this.app.mysql.query(userCountSql, params);
    const userCount = userCountResult[0].count;

    // 错误率 (response_code != 200)
    const errorSql = `SELECT COUNT(*) as count FROM sys_api_log WHERE 1=1 ${condition} AND response_code != 200`;
    const errorResult = await this.app.mysql.query(errorSql, params);
    const errorRate = totalCalls > 0 ? ((errorResult[0].count / totalCalls) * 100).toFixed(2) : 0;

    return {
      totalCalls,
      dailyAvg,
      avgResponseTime,
      apiCount,
      userCount,
      errorRate: Number(errorRate),
    };
  }

  /**
   * 2. 趋势分析
   */
  async getTrend(startDate, endDate, type = 'daily') {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    let dateFormat, groupFormat;
    switch (type) {
      case 'hourly':
        dateFormat = '%Y-%m-%d %H:00';
        groupFormat = '%Y-%m-%d %H';
        break;
      case 'weekly':
        dateFormat = '%Y-W%u';
        groupFormat = '%Y-W%u';
        break;
      default: // daily
        dateFormat = '%Y-%m-%d';
        groupFormat = '%Y-%m-%d';
    }

    // 调用量趋势
    const volumeSql = `
      SELECT
        DATE_FORMAT(start_time, '${dateFormat}') as date,
        COUNT(*) as count
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY DATE_FORMAT(start_time, '${groupFormat}')
      ORDER BY date
    `;
    const volumeResult = await this.app.mysql.query(volumeSql, params);

    // 响应时间趋势
    const timeSql = `
      SELECT
        DATE_FORMAT(start_time, '${dateFormat}') as date,
        AVG(used_time) as avgTime
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY DATE_FORMAT(start_time, '${groupFormat}')
      ORDER BY date
    `;
    const timeResult = await this.app.mysql.query(timeSql, params);

    return {
      volumeTrend: volumeResult.map(r => ({ date: r.date, count: r.count })),
      timeTrend: timeResult.map(r => ({ date: r.date, avgTime: Math.round(r.avgTime) })),
    };
  }

  /**
   * 3. 按接口统计
   */
  async getByInterface(startDate, endDate, limit = 20) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    const sql = `
      SELECT
        request_url as interface,
        COUNT(*) as callCount,
        AVG(used_time) as avgTime,
        MAX(used_time) as maxTime,
        MIN(used_time) as minTime,
        SUM(CASE WHEN response_code != 200 THEN 1 ELSE 0 END) as errorCount,
        MAX(start_time) as lastCallTime
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY request_url
      ORDER BY callCount DESC
      LIMIT ?
    `;
    const result = await this.app.mysql.query(sql, [...params, limit]);
    return result.map(r => ({
      interface: r.interface,
      callCount: r.callCount,
      avgTime: Math.round(r.avgTime || 0),
      maxTime: r.maxTime,
      minTime: r.minTime,
      errorCount: r.errorCount,
      errorRate: r.callCount > 0 ? ((r.errorCount / r.callCount) * 100).toFixed(2) : 0,
      lastCallTime: r.lastCallTime,
    }));
  }

  /**
   * 4. 按用户统计
   */
  async getByUser(startDate, endDate, limit = 20) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    // 用户调用排名
    const userSql = `
      SELECT
        user_id,
        COUNT(*) as callCount,
        AVG(used_time) as avgTime,
        MIN(start_time) as firstCallTime,
        MAX(start_time) as lastCallTime
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY user_id
      ORDER BY callCount DESC
      LIMIT ?
    `;
    const userResult = await this.app.mysql.query(userSql, [...params, limit]);

    // 用户使用的接口分布
    const userApiSql = `
      SELECT
        user_id,
        request_url,
        COUNT(*) as count
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY user_id, request_url
      ORDER BY user_id, count DESC
    `;
    const userApiResult = await this.app.mysql.query(userApiSql, params);

    // 按用户分组接口分布
    const userApiMap = {};
    userApiResult.forEach(r => {
      if (!userApiMap[r.user_id]) {
        userApiMap[r.user_id] = [];
      }
      userApiMap[r.user_id].push({ interface: r.request_url, count: r.count });
    });

    return userResult.map(r => ({
      userId: r.user_id,
      callCount: r.callCount,
      avgTime: Math.round(r.avgTime || 0),
      firstCallTime: r.firstCallTime,
      lastCallTime: r.lastCallTime,
      apiDistribution: userApiMap[r.user_id] || [],
    }));
  }

  /**
   * 5. 按响应码统计
   */
  async getByStatusCode(startDate, endDate) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    const sql = `
      SELECT
        response_code as statusCode,
        COUNT(*) as count
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY response_code
      ORDER BY count DESC
    `;
    const result = await this.app.mysql.query(sql, params);

    // 错误请求详情
    const errorSql = `
      SELECT
        request_url as interface,
        response_code as statusCode,
        user_id,
        ip_address as ip,
        start_time as callTime,
        used_time as responseTime
      FROM sys_api_log
      WHERE 1=1 ${condition} AND response_code != 200
      ORDER BY start_time DESC
      LIMIT 50
    `;
    const errorResult = await this.app.mysql.query(errorSql, params);

    return {
      distribution: result.map(r => ({ statusCode: r.statusCode, count: r.count })),
      errorDetails: errorResult,
    };
  }

  /**
   * 6. 按 IP 地址统计
   */
  async getByIp(startDate, endDate, limit = 20) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    // IP 调用排名
    const ipSql = `
      SELECT
        ip_address as ip,
        COUNT(*) as callCount,
        COUNT(DISTINCT user_id) as userCount,
        COUNT(DISTINCT request_url) as apiCount
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY ip_address
      ORDER BY callCount DESC
      LIMIT ?
    `;
    const ipResult = await this.app.mysql.query(ipSql, [...params, limit]);

    // IP 使用的接口分布
    const ipApiSql = `
      SELECT
        ip_address,
        request_url,
        COUNT(*) as count
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY ip_address, request_url
      ORDER BY ip_address, count DESC
    `;
    const ipApiResult = await this.app.mysql.query(ipApiSql, params);

    // 按 IP 分组接口分布
    const ipApiMap = {};
    ipApiResult.forEach(r => {
      const ip = r.ip_address;
      if (!ipApiMap[ip]) {
        ipApiMap[ip] = [];
      }
      ipApiMap[ip].push({ interface: r.request_url, count: r.count });
    });

    return ipResult.map(r => ({
      ip: r.ip,
      callCount: r.callCount,
      userCount: r.userCount,
      apiCount: r.apiCount,
      apiDistribution: ipApiMap[r.ip] || [],
    }));
  }

  /**
   * 7. 性能分析
   */
  async getPerformance(startDate, endDate, limit = 20) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    // 慢接口排行
    const slowSql = `
      SELECT
        request_url as interface,
        AVG(used_time) as avgTime,
        MAX(used_time) as maxTime,
        COUNT(*) as callCount
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY request_url
      ORDER BY avgTime DESC
      LIMIT ?
    `;
    const slowResult = await this.app.mysql.query(slowSql, [...params, limit]);

    // 响应时间分布
    const distSql = `
      SELECT
        CASE
          WHEN used_time < 100 THEN 'lt100ms'
          WHEN used_time >= 100 AND used_time < 500 THEN '100-500ms'
          WHEN used_time >= 500 AND used_time < 1000 THEN '500ms-1s'
          ELSE 'gt1s'
        END as category,
        COUNT(*) as count
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY category
      ORDER BY
        CASE category
          WHEN 'lt100ms' THEN 1
          WHEN '100-500ms' THEN 2
          WHEN '500ms-1s' THEN 3
          ELSE 4
        END
    `;
    const distResult = await this.app.mysql.query(distSql, params);

    return {
      slowInterfaces: slowResult.map(r => ({
        interface: r.interface,
        avgTime: Math.round(r.avgTime),
        maxTime: r.maxTime,
        callCount: r.callCount,
      })),
      timeDistribution: distResult.map(r => ({ category: r.category, count: r.count })),
    };
  }

  /**
   * 8. 时段分析
   */
  async getHourly(startDate, endDate) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    // 每小时调用量分布
    const hourlySql = `
      SELECT
        HOUR(start_time) as hour,
        COUNT(*) as count
      FROM sys_api_log
      WHERE 1=1 ${condition}
      GROUP BY HOUR(start_time)
      ORDER BY hour
    `;
    const hourlyResult = await this.app.mysql.query(hourlySql, params);

    // 填充 0-23 点
    const hourlyMap = {};
    hourlyResult.forEach(r => {
      hourlyMap[r.hour] = r.count;
    });
    const hourlyDistribution = [];
    for (let i = 0; i < 24; i++) {
      hourlyDistribution.push({ hour: i, count: hourlyMap[i] || 0 });
    }

    // 高峰时段识别
    const peakHour = hourlyResult.reduce((max, r) => r.count > max.count ? r : max, { hour: 0, count: 0 });

    return {
      hourlyDistribution,
      peakHour: { hour: peakHour.hour, count: peakHour.count },
    };
  }

  /**
   * 9. 详细日志列表
   */
  async getLogs(startDate, endDate, page = 1, pageSize = 20) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    const offset = (page - 1) * pageSize;

    // 总数
    const countSql = `SELECT COUNT(*) as total FROM sys_api_log WHERE 1=1 ${condition}`;
    const countResult = await this.app.mysql.query(countSql, params);
    const total = countResult[0].total;

    // 分页数据
    const sql = `
      SELECT
        start_time as requestTime,
        request_url as requestUrl,
        request_header as requestHeader,
        response_code as responseCode,
        used_time as responseTime,
        user_id,
        ip_address as ipAddress,
        user_agent as userAgent,
        api_type as apiType,
        api_remark as apiRemark
      FROM sys_api_log
      WHERE 1=1 ${condition}
      ORDER BY start_time DESC
      LIMIT ? OFFSET ?
    `;
    const result = await this.app.mysql.query(sql, [...params, Number(pageSize), offset]);

    return {
      list: result,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

module.exports = ApiAnalysisService;
