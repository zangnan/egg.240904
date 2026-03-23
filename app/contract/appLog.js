'use strict';

/**
 * 应用日志分析验证模式
 */
module.exports = {
  // 概览仪表盘请求
  appLogOverviewRequest: {
    startDate: { type: 'string', required: false, description: '开始日期 (YYYY-MM-DD)' },
    endDate: { type: 'string', required: false, description: '结束日期 (YYYY-MM-DD)' },
  },
  // 级别分布请求
  appLogLevelDistributionRequest: {
    startDate: { type: 'string', required: false, description: '开始日期 (YYYY-MM-DD)' },
    endDate: { type: 'string', required: false, description: '结束日期 (YYYY-MM-DD)' },
  },
  // 趋势分析请求
  appLogTrendRequest: {
    startDate: { type: 'string', required: false, description: '开始日期 (YYYY-MM-DD)' },
    endDate: { type: 'string', required: false, description: '结束日期 (YYYY-MM-DD)' },
    type: { type: 'string', required: false, description: '趋势类型: hourly/daily' },
  },
  // 错误码统计请求
  appLogErrorCodesRequest: {
    startDate: { type: 'string', required: false, description: '开始日期 (YYYY-MM-DD)' },
    endDate: { type: 'string', required: false, description: '结束日期 (YYYY-MM-DD)' },
    limit: { type: 'integer', required: false, description: '返回条数 (默认10)' },
  },
  // 来源分布请求 (IP/URL)
  appLogBySourceRequest: {
    startDate: { type: 'string', required: false, description: '开始日期 (YYYY-MM-DD)' },
    endDate: { type: 'string', required: false, description: '结束日期 (YYYY-MM-DD)' },
    level: { type: 'string', required: false, description: '筛选级别: INFO/WARN/ERROR' },
    limit: { type: 'integer', required: false, description: '返回条数 (默认10)' },
  },
  // 时段分布请求
  appLogHourlyDistributionRequest: {
    startDate: { type: 'string', required: false, description: '开始日期 (YYYY-MM-DD)' },
    endDate: { type: 'string', required: false, description: '结束日期 (YYYY-MM-DD)' },
  },
};
