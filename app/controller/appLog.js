'use strict';

const Controller = require('egg').Controller;

/**
 * @Controller 应用日志分析
 */
class AppLogController extends Controller {

  /**
   * @summary 概览仪表盘
   * @description 获取日志总量、今日数量、各级别统计、近7天趋势
   * @router post /api/appLog/overview
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @response 200 baseResponse
   */
  async getOverview() {
    const { ctx } = this;
    const { startDate, endDate } = ctx.request.body;

    try {
      const result = await ctx.service.appLog.getOverview(startDate, endDate);
      ctx.body = {
        code: '200',
        msg: 'success',
        body: result,
      };
      ctx.status = 200;
    } catch (err) {
      ctx.body = {
        code: '500',
        msg: err.message,
        body: null,
      };
      ctx.status = 500;
    }
  }

  /**
   * @summary 级别分布
   * @description 获取日志级别分布，用于饼图展示
   * @router post /api/appLog/levelDistribution
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @response 200 baseResponse
   */
  async getLevelDistribution() {
    const { ctx } = this;
    const { startDate, endDate } = ctx.request.body;

    try {
      const result = await ctx.service.appLog.getLevelDistribution(startDate, endDate);
      ctx.body = {
        code: '200',
        msg: 'success',
        body: result,
      };
      ctx.status = 200;
    } catch (err) {
      ctx.body = {
        code: '500',
        msg: err.message,
        body: null,
      };
      ctx.status = 500;
    }
  }

  /**
   * @summary 趋势分析
   * @description 按小时/天统计日志量趋势
   * @router post /api/appLog/trend
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query string type 趋势类型 (hourly/daily)
   * @response 200 baseResponse
   */
  async getTrend() {
    const { ctx } = this;
    const { startDate, endDate, type = 'daily' } = ctx.request.body;

    try {
      const result = await ctx.service.appLog.getTrend(startDate, endDate, type);
      ctx.body = {
        code: '200',
        msg: 'success',
        body: result,
      };
      ctx.status = 200;
    } catch (err) {
      ctx.body = {
        code: '500',
        msg: err.message,
        body: null,
      };
      ctx.status = 500;
    }
  }

  /**
   * @summary 错误码统计
   * @description 统计 ERROR 的 error_code 分布，用于柱状图展示
   * @router post /api/appLog/errorCodes
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query number limit 返回条数 (默认10)
   * @response 200 baseResponse
   */
  async getErrorCodes() {
    const { ctx } = this;
    const { startDate, endDate, limit = 10 } = ctx.request.body;

    try {
      const result = await ctx.service.appLog.getErrorCodes(startDate, endDate, Number(limit));
      ctx.body = {
        code: '200',
        msg: 'success',
        body: result,
      };
      ctx.status = 200;
    } catch (err) {
      ctx.body = {
        code: '500',
        msg: err.message,
        body: null,
      };
      ctx.status = 500;
    }
  }

  /**
   * @summary 来源分布 - 按 IP
   * @description 按 IP 地址统计日志分布，用于柱状图展示
   * @router post /api/appLog/byIp
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query string level 筛选级别 (INFO/WARN/ERROR)
   * @request query number limit 返回条数 (默认10)
   * @response 200 baseResponse
   */
  async getByIp() {
    const { ctx } = this;
    const { startDate, endDate, level, limit = 10 } = ctx.request.body;

    try {
      const result = await ctx.service.appLog.getByIp(startDate, endDate, level, Number(limit));
      ctx.body = {
        code: '200',
        msg: 'success',
        body: result,
      };
      ctx.status = 200;
    } catch (err) {
      ctx.body = {
        code: '500',
        msg: err.message,
        body: null,
      };
      ctx.status = 500;
    }
  }

  /**
   * @summary 来源分布 - 按 URL
   * @description 按请求 URL 统计日志分布，用于柱状图展示
   * @router post /api/appLog/byUrl
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query string level 筛选级别 (INFO/WARN/ERROR)
   * @request query number limit 返回条数 (默认10)
   * @response 200 baseResponse
   */
  async getByUrl() {
    const { ctx } = this;
    const { startDate, endDate, level, limit = 10 } = ctx.request.body;

    try {
      const result = await ctx.service.appLog.getByUrl(startDate, endDate, level, Number(limit));
      ctx.body = {
        code: '200',
        msg: 'success',
        body: result,
      };
      ctx.status = 200;
    } catch (err) {
      ctx.body = {
        code: '500',
        msg: err.message,
        body: null,
      };
      ctx.status = 500;
    }
  }

  /**
   * @summary 24小时分布
   * @description 分析每小时日志分布，用于柱状图展示
   * @router post /api/appLog/hourlyDistribution
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @response 200 baseResponse
   */
  async getHourlyDistribution() {
    const { ctx } = this;
    const { startDate, endDate } = ctx.request.body;

    try {
      const result = await ctx.service.appLog.getHourlyDistribution(startDate, endDate);
      ctx.body = {
        code: '200',
        msg: 'success',
        body: result,
      };
      ctx.status = 200;
    } catch (err) {
      ctx.body = {
        code: '500',
        msg: err.message,
        body: null,
      };
      ctx.status = 500;
    }
  }

  /**
   * @summary 星期分布
   * @description 按星期统计日志分布
   * @router post /api/appLog/weeklyDistribution
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @response 200 baseResponse
   */
  async getWeeklyDistribution() {
    const { ctx } = this;
    const { startDate, endDate } = ctx.request.body;

    try {
      const result = await ctx.service.appLog.getWeeklyDistribution(startDate, endDate);
      ctx.body = {
        code: '200',
        msg: 'success',
        body: result,
      };
      ctx.status = 200;
    } catch (err) {
      ctx.body = {
        code: '500',
        msg: err.message,
        body: null,
      };
      ctx.status = 500;
    }
  }
}

module.exports = AppLogController;
