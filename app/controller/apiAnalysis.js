'use strict';

const Controller = require('egg').Controller;

/**
 * @Controller API 日志分析
 */
class ApiAnalysisController extends Controller {

  /**
   * @summary 概览仪表盘
   * @description 获取总调用次数、日均调用量、平均响应时间、接口数量、用户数、错误率
   * @router post /api/analysis/overview
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @response 200 baseResponse
   */
  async getOverview() {
    const { ctx } = this;
    const { startDate, endDate } = ctx.request.body;

    try {
      const result = await ctx.service.apiAnalysis.getOverview(startDate, endDate);
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
   * @description 按小时/天/周统计调用量趋势和响应时间趋势
   * @router post /api/analysis/trend
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query string type 趋势类型 (hourly/daily/weekly)
   * @response 200 baseResponse
   */
  async getTrend() {
    const { ctx } = this;
    const { startDate, endDate, type = 'daily' } = ctx.request.body;

    try {
      const result = await ctx.service.apiAnalysis.getTrend(startDate, endDate, type);
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
   * @summary 按接口统计
   * @description 调用次数排名、平均响应时间、最大/最小响应时间、错误率
   * @router post /api/analysis/byInterface
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query number limit 返回条数 (默认20)
   * @response 200 baseResponse
   */
  async getByInterface() {
    const { ctx } = this;
    const { startDate, endDate, limit = 20 } = ctx.request.body;

    try {
      const result = await ctx.service.apiAnalysis.getByInterface(startDate, endDate, Number(limit));
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
   * @summary 按用户统计
   * @description 用户调用次数排名、接口分布、平均响应时间
   * @router post /api/analysis/byUser
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query number limit 返回条数 (默认20)
   * @response 200 baseResponse
   */
  async getByUser() {
    const { ctx } = this;
    const { startDate, endDate, limit = 20 } = ctx.request.body;

    try {
      const result = await ctx.service.apiAnalysis.getByUser(startDate, endDate, Number(limit));
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
   * @summary 按响应码统计
   * @description 各响应码分布及错误请求详情
   * @router post /api/analysis/byStatusCode
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @response 200 baseResponse
   */
  async getByStatusCode() {
    const { ctx } = this;
    const { startDate, endDate } = ctx.request.body;

    try {
      const result = await ctx.service.apiAnalysis.getByStatusCode(startDate, endDate);
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
   * @summary 按 IP 地址统计
   * @description IP 调用次数排名、接口分布
   * @router post /api/analysis/byIp
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query number limit 返回条数 (默认20)
   * @response 200 baseResponse
   */
  async getByIp() {
    const { ctx } = this;
    const { startDate, endDate, limit = 20 } = ctx.request.body;

    try {
      const result = await ctx.service.apiAnalysis.getByIp(startDate, endDate, Number(limit));
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
   * @summary 性能分析
   * @description 慢接口排行、响应时间分布
   * @router post /api/analysis/performance
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query number limit 返回条数 (默认20)
   * @response 200 baseResponse
   */
  async getPerformance() {
    const { ctx } = this;
    const { startDate, endDate, limit = 20 } = ctx.request.body;

    try {
      const result = await ctx.service.apiAnalysis.getPerformance(startDate, endDate, Number(limit));
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
   * @summary 时段分析
   * @description 每小时调用量分布、高峰时段识别
   * @router post /api/analysis/hourly
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @response 200 baseResponse
   */
  async getHourly() {
    const { ctx } = this;
    const { startDate, endDate } = ctx.request.body;

    try {
      const result = await ctx.service.apiAnalysis.getHourly(startDate, endDate);
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
   * @summary 详细日志列表
   * @description 分页查询详细日志
   * @router post /api/analysis/logs
   * @request query string startDate 开始日期 (YYYY-MM-DD)
   * @request query string endDate 结束日期 (YYYY-MM-DD)
   * @request query number page 页码 (默认1)
   * @request query number pageSize 每页条数 (默认20)
   * @response 200 baseResponse
   */
  async getLogs() {
    const { ctx } = this;
    const { startDate, endDate, page = 1, pageSize = 20 } = ctx.request.body;

    try {
      const result = await ctx.service.apiAnalysis.getLogs(startDate, endDate, Number(page), Number(pageSize));
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

module.exports = ApiAnalysisController;
