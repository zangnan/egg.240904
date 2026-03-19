'use strict';
const Controller = require('egg').Controller;
const { AppError, BaseServiceError } = require('../extend/errorUtil');
const { handleErrorCommon } = require('../extend/errorUtil');

const RULE_QUERY = {
  pageSize: { type: 'int', required: false },
  page: { type: 'int', required: false },
};

/**
 * @Controller Common 基础接口
 */
class Common extends Controller {
  constructor(ctx) {
    super(ctx);
    this.createRule = {
      // name: { type: 'string', max: 30, required: false },
      // sex: { type: 'enum', values: [ '0', '1', '2' ], required: false },
    };
  }

  /**
   * @summary 通用分页列表
   * @description 分页查询数据列表（含自定义SQL）<br>
   * 表名称取值顺序: 1、body体config_table_name；2、后端配置table_name；3、moduleKey <br>
   * Sql取值顺序: 1、后端配置sql(自定义sql，无需表名字段) 2、根据表明全量查询select * from ... <br>
   * 初始排序字段取值顺序：1、body体config_table_default_order字段；2、后端配置default_order <br>
   * searchModel.op取值范围: alike、eq、neq、dydy、xydy <br>
   * orderModel.order取值范围: asc、desc <br>
   * 示例 <br>
   * 1. moduleKey=eg_mts_tsjh，body={"page":1,"pageSize":10,"config_table_default_order":"ssq asc,sbpc desc"} <br>
   * 2. moduleKey=1，body={"page":1,"pageSize":10, "config_table_name":"sys_codetable","config_table_default_order":"code_type asc,code desc"} <br>
   * 3. moduleKey=1，body={"page":1,"pageSize":10,"config_table_name":"sys_codetable","searchModel":[{"property":"code_type","value":"api_type","op":"alike"}],"orderModel":[{"field":"code_type","order":"desc"}]} <br>
   * 4. 自定义SQL，配置m_sys_user中的sql字段，moduleKey=m_sys_user，body={"page":1,"pageSize":10} <br>
   * @router post /ns/base/list/{moduleKey}
   * @request path string moduleKey eg:eg_mts_tsjh 模块Key
   * @request body baseList2Request
   * @response 200 baseResponse 查询成功
   */
  async commonBaseList() {
    const { ctx } = this;
    try {
      // ctx.validate(RULE_QUERY, ctx.request.body);
      ctx.body = await ctx.service.baseService.list(this.ctx.params.moduleKey, ctx.request.body);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900140', err);
    }
  }

  /**
   * @summary 获取表单数据
   * @description 根据主键获取表单数据 <br>
   * 表名称取值顺序: 1、body体config_table_name字段；2、后端配置table_name；3、moduleKey <br>
   * 表主键取值顺序: 1、body体config_table_p_key_field字段；2、后端配置p_key_field; 3、默认主键default_p_key_field <br>
   * 示例 <br>
   * 1. moduleKey=eg_mts_tsjh，body={"uuid": "00ed13555c214d09804b905dfcf22cd0"} <br>
   * 2. moduleKey=1，body={"code_type":"api_type","code":"db","config_table_p_key_field":["code_type","code"],"config_table_name":"sys_codetable"} <br>
   * 3. moduleKey=1，body={"user_id":"admin","config_table_p_key_field":"user_id","config_table_name":"sys_user"} <br>
   * 4. 获取后端配置中的表名称及表主键，moduleKey=m_sys_user，body={"user_id": "admin"}
   * @router post /ns/base/show/{moduleKey}
   * @request path string moduleKey eg:eg_mts_tsjh 表名/后端配置的标识
   * @request body baseShowRequest
   * @response 200 baseResponse 表单查询成功
   */
  async commonBaseShow() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.baseShowRequest);
    try {
      ctx.body = await ctx.service.baseService.show(ctx.params.moduleKey, ctx.request.body);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900120', err);
    }
  }

  /**
   * @summary 编辑表单数据
   * @description 根据主键更新表单数据 <br>
   * 表名称取值顺序: 1、body体config_table_name字段；2、后端配置table_name；3、moduleKey <br>
   * 表主键取值顺序: 1、body体config_table_p_key_field字段；2、后端配置p_key_field; 3、默认主键default_p_key_field <br>
   * 新增时主键是否自动生成取值顺序：1、body体config_table_p_key_auto_creation；2、后端配置p_key_auto_creation；3、默认true <br>
   * 示例新建 <br>
   * 1. moduleKey=eg_mts_tsjh，body={"sbpc":"999","ssq":"202512","formType":"add","config_table_p_key_auto_creation":true,"config_table_p_key_field":["uuid","sbqyuuid"]} <br>
   * 1. moduleKey=1，body={"sbpc":"999","ssq":"202512","formType":"add","config_table_name":"eg_mts_tsjh","config_table_p_key_auto_creation":true,"config_table_p_key_field":["uuid","sbqyuuid"]} <br>
   * 示例修改 <br>
   * 1. moduleKey=eg_mts_tsjh，body={"uuid":"00ed13555c214d09804b905dfcf22cd0","sbpc":"999","ssq":"202512","formType":"edit"} <br>
   * 2. moduleKey=1，body={"uuid":"00ed13555c214d09804b905dfcf22cd0","sbpc":"999","ssq":"202512","formType":"edit","config_table_name":"eg_mts_tsjh"} <br>
   * 3. moduleKey=1，body={"code_type":"api_type","code":"login","name":"哈哈哈","name_full":"飞飞飞","config_table_p_key_field":["code_type","code"],"config_table_name":"sys_codetable"} <br>
   * @router post /ns/base/edit/{moduleKey}
   * @request path string moduleKey eg:eg_mts_tsjh 模块Key
   * @request body baseEditRequest
   * @response 200 baseResponse 操作成功
   */
  async commonBaseEdit() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.baseEditRequest);
    try {
      ctx.validate(this.createRule);
      ctx.body = await ctx.service.baseService.edit(ctx.params.moduleKey, ctx.request.body);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900130', err);
    }
  }

  /**
   * @summary 删除(单条或批量)
   * @description 根据uuids删除数据 <br>
   * 表名称取值顺序: 1、body体config_table_name字段；2、后端配置table_name；3、moduleKey <br>
   * 表主键取值顺序（多主键时使用）: 1、body体config_table_p_key_field字段；2、后端配置p_key_field; 3、默认主键default_p_key_field <br>
   * 示例 <br>
   * 1. moduleKey=eg_mts_tsjh，body={"uuids": ["20","21"]} <br>
   * 2. moduleKey=1，body={"uuids": [{"code_type":"api_type","code":"db1"},{"code_type":"api_type","code":"export1"}],"config_table_p_key_field":["code_type","code"],"config_table_name":"sys_codetable"} <br>
   * 3. moduleKey=1，body={"uuids": [{"user_id":"testuser"}],"config_table_p_key_field":"user_id","config_table_name":"sys_user"} <br>
   * 4. 获取后端配置中的表名称及表主键，moduleKey=m_sys_codetable，body={"uuids": [{"code_type":"api_type","code":"db1"},{"code_type":"api_type","code":"export1"}]} <br>
   * @router post /ns/base/delete/{moduleKey}
   * @request path string moduleKey eg:eg_mts_tsjh 模块Key
   * @request body baseDeleteRequest
   * @response 200 baseResponse 删除 xxx 条数据成功
   */
  async commonBaseDelete() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.baseDeleteRequest);
    try {
      const result = await ctx.service.baseService.delete(ctx.params.moduleKey, ctx.request.body);
      ctx.body = result;
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900110', err);
    }
  }

  /**
   * @summary 获取码表
   * @description 获取码表
   * @router post /dict/automatic/exp/bs/getCodeList
   * @request body getCodeListRequest
   * @response 200 getCodeListResponse 码表集合
   */
  async getCodeList() {
    const { ctx } = this;
    ctx.validate(ctx.rule.getCodeListRequest);
    try {
      const result = await ctx.service.baseService.getCodeList(ctx.request.body);
      ctx.body = result;
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900180', err);
    }
  }

  // 生成Excel
  async createExcel() {
    const { ctx } = this;
    try {
      await this.ctx.service.baseService.createExcel(ctx.params.moduleKey, ctx.request.body);
    } catch (err) {
      handleErrorCommon(ctx, 'E900190', err);
    }
  }

  // 导入Excel
  async importExcel() {
    const { ctx } = this;
    try {
      const result = await ctx.service.baseService.importExcel(ctx.params.moduleKey, ctx.getFileStream(), ctx.request.body);
      ctx.body = result;
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900200', err);
    }
  }
}

module.exports = Common;
