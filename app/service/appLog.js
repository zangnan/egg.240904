'use strict';

const Service = require('egg').Service;

class AppLogService extends Service {

  /**
   * 构建日期范围条件
   * @param startDate
   * @param endDate
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
   * 默认查询近7天数据
   * @param startDate
   * @param endDate
   */
  async getOverview(startDate, endDate) {
    // 默认近7天
    if (!startDate) {
      const now = new Date();
      endDate = now.toISOString().split('T')[0];
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    const { condition, params } = this.buildDateCondition(startDate, endDate);

    // 今日日期
    const today = new Date().toISOString().split('T')[0];

    // 总日志量（时间范围内）
    const totalSql = `SELECT COUNT(*) as total FROM sys_app_log WHERE 1=1 ${condition}`;
    const totalResult = await this.app.mysql.query(totalSql, params);
    const totalCount = totalResult[0].total;

    // 今日日志量
    const todayCondition = condition + ' AND DATE(start_time) = ?';
    const todayResult = await this.app.mysql.query(
      `SELECT COUNT(*) as total FROM sys_app_log WHERE 1=1 ${todayCondition}`,
      [ ...params, today ]
    );
    const todayCount = todayResult[0].total;

    // 各级别统计
    const levelSql = `
      SELECT
        level,
        COUNT(*) as count
      FROM sys_app_log
      WHERE 1=1 ${condition}
      GROUP BY level
    `;
    const levelResult = await this.app.mysql.query(levelSql, params);

    const levelMap = {};
    let errorCount = 0;
    let warnCount = 0;
    let infoCount = 0;
    levelResult.forEach(r => {
      levelMap[r.level] = r.count;
      if (r.level === 'ERROR') errorCount = r.count;
      if (r.level === 'WARN') warnCount = r.count;
      if (r.level === 'INFO') infoCount = r.count;
    });

    // ERROR 占比
    const errorRate = totalCount > 0 ? ((errorCount / totalCount) * 100).toFixed(2) : 0;

    // 近7天趋势数据
    const trendSql = `
      SELECT
        DATE(start_time) as date,
        COUNT(*) as total,
        SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN level = 'WARN' THEN 1 ELSE 0 END) as warn
      FROM sys_app_log
      WHERE 1=1 ${condition}
      GROUP BY DATE(start_time)
      ORDER BY date DESC
      LIMIT 7
    `;
    const trendResult = await this.app.mysql.query(trendSql, params);

    return {
      totalCount,
      todayCount,
      errorCount,
      warnCount,
      infoCount,
      errorRate: Number(errorRate),
      trendData: trendResult.reverse().map(r => ({
        date: r.date,
        total: r.total,
        error: r.error,
        warn: r.warn,
      })),
    };
  }

  /**
   * 2. 级别分布
   * @param startDate
   * @param endDate
   */
  async getLevelDistribution(startDate, endDate) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    const sql = `
      SELECT
        level,
        COUNT(*) as count
      FROM sys_app_log
      WHERE 1=1 ${condition}
      GROUP BY level
      ORDER BY count DESC
    `;
    const result = await this.app.mysql.query(sql, params);

    const total = result.reduce((sum, r) => sum + r.count, 0);

    return result.map(r => ({
      level: r.level,
      count: r.count,
      percentage: total > 0 ? Number(((r.count / total) * 100).toFixed(2)) : 0,
    }));
  }

  /**
   * 3. 趋势分析
   * @param startDate
   * @param endDate
   * @param type
   */
  async getTrend(startDate, endDate, type = 'daily') {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    let dateFormat,
      groupFormat;
    if (type === 'hourly') {
      dateFormat = '%Y-%m-%d %H:00';
      groupFormat = '%Y-%m-%d %H';
    } else {
      dateFormat = '%Y-%m-%d';
      groupFormat = '%Y-%m-%d';
    }

    const sql = `
      SELECT
        DATE_FORMAT(start_time, '${dateFormat}') as time,
        COUNT(*) as total,
        SUM(CASE WHEN level = 'INFO' THEN 1 ELSE 0 END) as info,
        SUM(CASE WHEN level = 'WARN' THEN 1 ELSE 0 END) as warn,
        SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) as error
      FROM sys_app_log
      WHERE 1=1 ${condition}
      GROUP BY DATE_FORMAT(start_time, '${groupFormat}')
      ORDER BY time
    `;
    const result = await this.app.mysql.query(sql, params);

    return {
      trend: result.map(r => ({
        time: r.time,
        total: r.total,
        info: r.info,
        warn: r.warn,
        error: r.error,
      })),
    };
  }

  /**
   * 4. 错误码统计
   * error_code 为空或 null 单独统计为一组
   * @param startDate
   * @param endDate
   * @param limit
   */
  async getErrorCodes(startDate, endDate, limit = 10) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    const sql = `
      SELECT
        IFNULL(NULLIF(error_code, ''), 'UNKNOWN') as error_code,
        COUNT(*) as count,
        MIN(start_time) as firstTime,
        MAX(start_time) as lastTime
      FROM sys_app_log
      WHERE 1=1 ${condition}
        AND level = 'ERROR'
      GROUP BY IFNULL(NULLIF(error_code, ''), 'UNKNOWN')
      ORDER BY count DESC
      LIMIT ?
    `;
    const result = await this.app.mysql.query(sql, [ ...params, limit ]);

    return result.map(r => ({
      errorCode: r.error_code,
      count: r.count,
      firstTime: r.firstTime,
      lastTime: r.lastTime,
    }));
  }

  /**
   * 5. 来源分布 - 按 IP
   * IP 为空或 null 单独统计为一组
   * @param startDate
   * @param endDate
   * @param level
   * @param limit
   */
  async getByIp(startDate, endDate, level, limit = 10) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);
    let levelCondition = '';
    if (level) {
      levelCondition = ' AND level = ?';
      params.push(level);
    }

    const sql = `
      SELECT
        IFNULL(NULLIF(ip_address, ''), 'UNKNOWN') as ip,
        COUNT(*) as totalCount,
        SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) as errorCount,
        SUM(CASE WHEN level = 'WARN' THEN 1 ELSE 0 END) as warnCount,
        MIN(start_time) as firstTime
      FROM sys_app_log
      WHERE 1=1 ${condition} ${levelCondition}
      GROUP BY IFNULL(NULLIF(ip_address, ''), 'UNKNOWN')
      ORDER BY errorCount DESC
      LIMIT ?
    `;
    const result = await this.app.mysql.query(sql, [ ...params, limit ]);

    return result.map(r => ({
      ip: r.ip,
      totalCount: r.totalCount,
      errorCount: r.errorCount,
      warnCount: r.warnCount,
      firstTime: r.firstTime,
    }));
  }

  /**
   * 6. 来源分布 - 按 URL
   * URL 为空或 null 单独统计为一组
   * @param startDate
   * @param endDate
   * @param level
   * @param limit
   */
  async getByUrl(startDate, endDate, level, limit = 10) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);
    let levelCondition = '';
    if (level) {
      levelCondition = ' AND level = ?';
      params.push(level);
    }

    const sql = `
      SELECT
        IFNULL(NULLIF(request_url, ''), 'UNKNOWN') as url,
        COUNT(*) as totalCount,
        SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) as errorCount,
        SUM(CASE WHEN level = 'WARN' THEN 1 ELSE 0 END) as warnCount
      FROM sys_app_log
      WHERE 1=1 ${condition} ${levelCondition}
      GROUP BY IFNULL(NULLIF(request_url, ''), 'UNKNOWN')
      ORDER BY errorCount DESC
      LIMIT ?
    `;
    const result = await this.app.mysql.query(sql, [ ...params, limit ]);

    return result.map(r => ({
      url: r.url,
      totalCount: r.totalCount,
      errorCount: r.errorCount,
      warnCount: r.warnCount,
    }));
  }

  /**
   * 7. 24小时分布
   * @param startDate
   * @param endDate
   */
  async getHourlyDistribution(startDate, endDate) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    const sql = `
      SELECT
        HOUR(start_time) as hour,
        COUNT(*) as total,
        SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN level = 'WARN' THEN 1 ELSE 0 END) as warn
      FROM sys_app_log
      WHERE 1=1 ${condition}
      GROUP BY HOUR(start_time)
      ORDER BY hour
    `;
    const result = await this.app.mysql.query(sql, params);

    // 填充 0-23 点
    const hourMap = {};
    result.forEach(r => {
      hourMap[r.hour] = r;
    });
    const hourlyDistribution = [];
    for (let i = 0; i < 24; i++) {
      hourlyDistribution.push({
        hour: i,
        total: hourMap[i] ? hourMap[i].total : 0,
        error: hourMap[i] ? hourMap[i].error : 0,
        warn: hourMap[i] ? hourMap[i].warn : 0,
      });
    }

    // 高峰时段
    let peakHour = { hour: 0, count: 0 };
    hourlyDistribution.forEach(h => {
      if (h.total > peakHour.count) {
        peakHour = { hour: h.hour, count: h.total };
      }
    });

    return {
      hourlyDistribution,
      peakHour,
    };
  }

  /**
   * 8. 星期分布
   * @param startDate
   * @param endDate
   */
  async getWeeklyDistribution(startDate, endDate) {
    const { condition, params } = this.buildDateCondition(startDate, endDate);

    const sql = `
      SELECT
        DAYOFWEEK(start_time) as dayOfWeek,
        COUNT(*) as total,
        SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN level = 'WARN' THEN 1 ELSE 0 END) as warn
      FROM sys_app_log
      WHERE 1=1 ${condition}
      GROUP BY DAYOFWEEK(start_time)
      ORDER BY dayOfWeek
    `;
    const result = await this.app.mysql.query(sql, params);

    const dayNames = [ '', '周日', '周一', '周二', '周三', '周四', '周五', '周六' ];
    const dayOfWeekMap = {};
    result.forEach(r => {
      dayOfWeekMap[r.dayOfWeek] = r;
    });

    const distribution = [];
    for (let i = 1; i <= 7; i++) {
      distribution.push({
        dayOfWeek: i,
        dayName: dayNames[i],
        total: dayOfWeekMap[i] ? dayOfWeekMap[i].total : 0,
        error: dayOfWeekMap[i] ? dayOfWeekMap[i].error : 0,
        warn: dayOfWeekMap[i] ? dayOfWeekMap[i].warn : 0,
      });
    }

    return { distribution };
  }
}

module.exports = AppLogService;
