'use strict';
const Controller = require('egg').Controller;
const { handleErrorCommon } = require('../extend/errorUtil');

/**
 * @Controller DB 数据库管理
 */
class Db extends Controller {

  /**
   * @summary 创建单张表
   * @description 创建单张表
   * @router post /ns/db/createTable
   * @request body createTableRequest
   * @response 200 baseDBResponse 操作成功
   */
  async createTable() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.createTableRequest);
    try {
      const reVal = await ctx.service.baseService.createTable(ctx.request.body);
      ctx.body = {
        body: reVal,
        code: 200,
      };
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900220', err);
    }
  }

  /**
   * @summary 删除单张表
   * @description 删除多张表
   * @router post /ns/db/dropTable
   * @request body dropTableRequest
   * @response 200 baseDBResponse 操作成功
   */
  async dropTable() {
    const { ctx } = this;
    ctx.validate(ctx.rule.dropTableRequest);
    try {
      const reVal = await ctx.service.baseService.dropTable(ctx.request.body);
      ctx.body = {
        body: reVal,
        code: 200,
      };
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900240', err);
    }
  }

  /**
   * @summary 创建多张表
   * @description 创建多张表
   * @router post /ns/db/createTables
   * @request body createTablesRequest
   * @response 200 baseDBResponse 操作成功
   */
  async createTables() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.createTablesRequest);
    try {
      ctx.body = await ctx.service.baseService.createTables(ctx.request.body.tables);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900230', err);
    }
  }

  /**
   * @summary 删除多张表
   * @description 删除多张表
   * @router post /ns/db/dropTables
   * @request body dropTablesRequest
   * @response 200 baseDBResponse 操作成功
   */
  async dropTables() {
    const { ctx } = this;
    ctx.validate(ctx.rule.dropTablesRequest);
    try {
      ctx.body = await ctx.service.baseService.dropTables(ctx.request.body.tables);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900250', err);
    }
  }

  /**
   * @summary 初始化数据库表数据
   * @description 初始化数据库表数据
   * @router post /ns/base/initDbData
   * @request body initDbDataRequest
   * @response 200 baseDBResponse 操作成功
   */
  async initDbData() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.initDbDataRequest);
    try {
      const result = await ctx.service.baseService.initDbData(ctx.request.body);
      ctx.body = result;
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900210', err);
    }
  }

}

module.exports = Db;
