/**
 * 配置说明
 * api_config: {
 *   api_type
 *   api_remark
 *   url
 *   controller
 * },
 */
const api_config = [
  { api_type: 'login', api_remark: '登录查询Token', url: '/dict/security/login', controller: 'controller.ddit.user.getToken' },
  { api_type: 'login', api_remark: '登录查询用户信息', url: '/dict/login/getLoginUserInfo', controller: 'controller.ddit.user.getUser' },
  { api_type: 'db', api_remark: '数据库创建表', url: '/ns/db/createTable', controller: 'controller.baseController.createTable' },
  { api_type: 'db', api_remark: '数据库创建表批量', url: '/ns/db/createTables', controller: 'controller.baseController.createTables' },
  { api_type: 'db', api_remark: '数据库删除表', url: '/ns/db/dropTable', controller: 'controller.baseController.dropTable' },
  { api_type: 'db', api_remark: '数据库删除表批量', url: '/ns/db/dropTables', controller: 'controller.baseController.dropTables' },
  { api_type: 'db', api_remark: '数据库初始化数据', url: '/ns/base/initDbData', controller: 'controller.baseController.initDbData' },
  { api_type: 'search', api_remark: '查询列表', url: '/ns/base/list/', controller: 'controller.baseController.baseList' },
  { api_type: 'search', api_remark: '查询表单', url: '/ns/base/show/', controller: 'controller.baseController.baseShow' },
  { api_type: 'delete', api_remark: '删除', url: '/ns/base/delete/', controller: 'controller.baseController.baseDelete' },
  { api_type: 'update', api_remark: '更新表单', url: '/ns/base/edit/', controller: 'controller.baseController.baseEdit' },
  { api_type: 'export', api_remark: '导入', url: '/ns/base/exportExcel/', controller: 'controller.baseController.createExcel' },
  { api_type: 'import', api_remark: '导出', url: '/ns/base/importExcel/', controller: 'controller.baseController.importExcel' },
  { api_type: 'update', api_remark: '更新用户角色关联', url: '/ns/base/authority/setUserRole', controller: 'controller.baseController.setUserRole' },
  { api_type: 'update', api_remark: '更新角色菜单关联', url: '/ns/base/role/saveRoleMenu', controller: 'controller.baseController.saveRoleMenu' },
  { api_type: 'search', api_remark: '查询模块配置', url: '/dict/automatic/exp/pageDef/', controller: 'controller.baseController.pageDef' },
  { api_type: 'search', api_remark: '查询列表', url: '/dict/automatic/exp/bs/queryPager/', controller: 'controller.baseController.baseList2' },
  { api_type: 'search', api_remark: '查询列表自定义', url: '/dict/automatic/exp/bs/queryPagerCustomer/', controller: 'controller.baseController.baseList2' },
  { api_type: 'search', api_remark: '查询表单', url: '/dict/automatic/exp/bs/queryForm/', controller: 'controller.baseController.baseShow' },
  { api_type: 'delete', api_remark: '删除', url: '/dict/automatic/exp/bs/delete/', controller: 'controller.baseController.baseDelete' },
  { api_type: 'update', api_remark: '更新表单', url: '/dict/automatic/exp/bs/saveOrUpdate/', controller: 'controller.baseController.baseEdit' },
  { api_type: 'search', api_remark: '查询码表', url: '/dict/automatic/exp/bs/getCodeList', controller: 'controller.baseController.getCodeList' },
];

module.exports = options => {
  return async function writeApiLog(ctx, next) {
    const token = ctx.request.header.accesstoken;
    // console.info('4444444 中间件 write api log =========================================================');
    // console.info(ctx);
    // 解码token
    let decode;
    let user_id;
    try {
      decode = ctx.app.jwt.verify(token);// 验证token catch (error) {
      // returnMsg = {
      //   msgType: '记录接口日志',
      //   msg: error,
      //   code: '11001',
      // };
      user_id = decode.username;
    } catch (error) {
      user_id = 'jwt error';
    }
    // console.info('decode =======', decode);
    // console.info(ctx.request.header);
    const timeStart1 = new Date();
    const timeStart = timeStart1.getTime();
    // const url = this.ctx.request.url;
    // console.info('中间件 请求参数 ***********************************************');
    // console.info(options);
    // console.info(ctx.helper.formatDate(timeStart, 'YYYY-MM-DD HH:mm:ss.SSS'));
    await next();
    const timeEnd1 = new Date();
    const timeEnd = timeEnd1.getTime();
    const used_time = timeEnd - timeStart;
    const response_body = ctx.body || {}; // 响应数据
    // console.info(response_body);
    const response_code = response_body.code;
    try {
      // 敏捷开发
      const request_url = ctx.request.url;
      const log_request = ctx.request.body; // 请求参数
      const request_header = ctx.request.header; // 请求头
      const user_agent = ctx.request.header['sec-ch-ua']; // 用户代理
      const ip_address = ctx.request.header.origin;
      const Literal = ctx.app.mysql.literals.Literal;
      let api_type = '';
      let api_remark = '';
      let controller = '';
      // 敏捷开发
      // 获取api配置
      const targetApiConfig = api_config.find(item => { return request_url.indexOf(item.url) > -1; });
      api_type = targetApiConfig.api_type;
      api_remark = targetApiConfig.api_remark;
      controller = targetApiConfig.controller;

      // console.info('api_type ~~~~~~~~~~~~~~~~~~~~');
      // console.info(api_type);
      // console.info(api_remark);
      const logData = {
        uuid: new Literal('UUID()'),
        request_url,
        request_header: JSON.stringify(request_header),
        request_body: JSON.stringify(log_request),
        response_body: JSON.stringify(response_body),
        response_code,
        used_time,
        start_time: timeStart1,
        end_time: timeEnd1,
        user_id,
        ip_address,
        user_agent,
        api_type,
        api_remark,
        controller,
      };
      const result = await ctx.app.mysql.insert('sys_api_log', logData);
      // const drSuccess = result.affectedRows > 0;
      // if (drSuccess) {
      //   returnMsg = {
      //     msgType: '记录接口日志',
      //     code: '200',
      //   };
      // }
    } catch (error) {
      // returnMsg = {
      //   msgType: '记录接口日志',
      //   msg: error,
      //   code: '11001',
      // };
    }
  };
};
