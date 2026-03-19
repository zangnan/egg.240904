'use strict';
const Controller = require('egg').Controller;
const { AppError, BaseServiceError } = require('../extend/errorUtil');

const handleErrorCommon = (ctx, code, err = {}) => {
  let errorCode;
  let cause;
  if (err instanceof AppError) {
    errorCode = err.errorCode;
    cause = err.cause;
  } else {
    errorCode = code;
    err.errorCode = errorCode;
    cause = err;
  }
  ctx.logger.error(err, { ctx });
  ctx.body = {
    code: errorCode,
    msg: err.message,
    err: cause.stack,
  };
  ctx.status = 200;
};

/**
 * @Controller Sdp 敏捷开发管理
 */
class Sdp extends Controller {
  constructor(ctx) {
    super(ctx);
    this.createRule = {
      // name: { type: 'string', max: 30, required: false },
      // sex: { type: 'enum', values: [ '0', '1', '2' ], required: false },
    };
  }

  /**
   * @summary 前端模块config组装数据
   * @description 根据主键获取表单详细信息
   * @router post /dict/automatic/exp/pageDef/{moduleKey}
   * @request path string moduleKey eg:eg_m_tag 模块Key
   * @request body pageDefRequest
   * @response 200 baseResponse 查询成功
   */
  async pageDef() {
    const { ctx } = this;
    ctx.validate(ctx.rule.pageDefRequest);
    try {
      ctx.body = await ctx.service.baseService.pageDef(this.ctx.params.moduleKey);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900150', err);
    }
  }

  /**
   * @summary 删除(单条或批量)
   * @description 根据uuids删除数据
   * @router post /dict/automatic/exp/bs/delete/{moduleKey}
   * @request path string moduleKey eg:eg_m_tag 模块Key
   * @request body baseDeleteRequest
   * @response 200 baseResponse 操作成功
   */
  async baseDelete() {
    const { ctx } = this;

    // ctx.validate(ctx.rule.baseDeleteRequest);

    // let aaa;
    try {
      // aaa.bb = 1;
      // const url = ctx.request.url;
      // const serviceName = url.indexOf('/ns/base/delete/') > -1 ? 'delete' : 'delete2';
      const serviceName = 'delete2';
      const result = await ctx.service.baseService[serviceName](ctx.params.moduleKey, ctx.request.body);
      ctx.body = result;
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900110', err);
    }
  }

  /**
   * @summary 获取表单详情
   * @description 根据主键获取表单详细信息
   * @router post /dict/automatic/exp/bs/queryForm/{moduleKey}
   * @request path string moduleKey eg:eg_m_mts_tsjh 模块Key
   * @request body baseShowRequest
   * @response 200 baseResponse 操作成功
   */
  async baseShow() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.baseShowRequest);
    try {
      // let ab;
      // ab.ad = 87;
      // const url = ctx.request.url;
      // const serviceName = url.indexOf('/ns/base/show/') > -1 ? 'show' : 'show2';
      ctx.body = await ctx.service.baseService.show2(ctx.params.moduleKey, ctx.request.body);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900120', err);
    }
  }

  /**
   * @summary 编辑表单信息
   * @description 根据主键更新表单信息
   * @router post /dict/automatic/exp/bs/saveOrUpdate/{moduleKey}
   * @request path string moduleKey eg:eg_m_mts_tsjh 模块Key
   * @request body baseEditRequest
   * @response 200 baseResponse 操作成功
   */
  async baseEdit() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.baseEditRequest);
    try {
      // const url = ctx.request.url;
      // const serviceName = url.indexOf('/ns/base/edit/') > -1 ? 'edit' : 'edit2';
      ctx.validate(this.createRule);
      ctx.body = await ctx.service.baseService.edit2(ctx.params.moduleKey, ctx.request.body);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900130', err);
    }
  }

  /**
   * @summary 分页列表
   * @description 分页查询数据列表
   * @router post /dict/automatic/exp/bs/queryPager/{moduleKey}
   * @request path string moduleKey eg:eg_m_tag 模块Key
   * @request body baseList2Request
   * @response 200 baseResponse 查询成功
   */
  async baseList2() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.baseList2Request);
    // ctx.logger.warn('warn ~~~~~~~~~~~~~~ 啊啊啊 111111222');
    // ctx.logger.info('info ~~~~~~~~~~~~~~ fff都是333444');
    // ctx.logger.error('error ~~~~~~~~~~~~~~ 555666');
    // ctx.logger.debug('debugger ~~~~~~~~~~~~~~ 777888');
    // ctx.getLogger('xxLogger').info('info ~~~~~~~~~~~~~~ 119999999999999999');
    // ctx.getLogger('xxLogger').warn('warn ~~~~~~~~~~~~~~ 229999999999999999');
    // ctx.getLogger('xxLogger').error('error ~~~~~~~~~~~~~~ 339999999999999999');
    try {
      // ctx.validate(RULE_QUERY, ctx.request.body);
      const moduleKey = this.ctx.params.moduleKey;
      const sqlKey = this.ctx.params.sqlKey; // 用于自定义SQL
      ctx.body = await ctx.service.baseService.list2(moduleKey, ctx.request.body, sqlKey);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900170', err);
    }
  }

  /**
   * @summary 分页列表（自定义Sql）
   * @description 分页查询数据列表-自定义SQL
   * @router post /dict/automatic/exp/bs/queryPagerCustomer/{moduleKey____sqlKey}
   * @request path string moduleKey____sqlKey eg:eg_m_customer_sql2____sql02 模块Key____SqlKey
   * @request body baseList2Request
   * @response 200 baseResponse 查询成功
   */
  async baseList2c() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.baseList2Request);
    try {
      // ctx.validate(RULE_QUERY, ctx.request.body);
      const moduleKey____sqlKey = this.ctx.params.moduleKey____sqlKey;
      const moduleKey = moduleKey____sqlKey.split('____')[0];
      const sqlKey = moduleKey____sqlKey.split('____')[1];
      // const sqlKey = this.ctx.params.sqlKey; // 用于自定义SQL
      ctx.body = await ctx.service.baseService.list2(moduleKey, ctx.request.body, sqlKey);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900170', err);
    }
  }

}

module.exports = Sdp;
