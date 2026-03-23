/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // example crud
  router.post('/example/list', controller.example.list);
  router.post('/example/create', controller.example.create);
  router.post('/example/show', controller.example.show);
  router.post('/example/delete', controller.example.delete);
  router.post('/example/update', controller.example.update);
  // ns - node server
  // 通用 Common
  router.post('/ns/base/exportExcel/:moduleKey', controller.common.createExcel); // 生成Excel
  router.post('/ns/base/importExcel/:moduleKey', controller.common.importExcel); // 导入Excel
  // 基础crud moduleKey: 物理表名称 物理表应收名称
  // router.post('/ns/base/list/:moduleKey', controller.common.commonBaseList);                 // openapi 分页查询
  // router.post('/ns/base/show/:moduleKey', controller.common.commonBaseShow);                 // openapi 表单查询
  // router.post('/ns/base/edit/:moduleKey', controller.common.commonBaseEdit);                 // openapi 表单新建、修改
  // router.post('/ns/base/delete/:moduleKey', controller.common.commonBaseDelete);             // openapi 删
  // DB
  // router.post('/ns/db/createTable', controller.db.createTable);                              // openapi
  // router.post('/ns/db/createTables', controller.db.createTables);                            // openapi
  // router.post('/ns/db/dropTable', controller.db.dropTable);                                  // openapi
  // router.post('/ns/db/dropTables', controller.db.dropTables);                                // openapi
  // router.post('/ns/base/initDbData', controller.db.initDbData);                              // openapi 初始化数据
  // 登录
  // router.post('/dict/security/login', controller.app/controller/authority.getToken);         // openapi dict/security/login?username=aa&password=bb
  // router.post('/dict/login/getLoginUserInfo', controller.app/controller/authority.getUser);  // openapi
  // 权限
  // router.post('/ns/base/authority/setUserRole', controller.authority.setUserRole);           // openapi
  // router.post('/ns/base/role/saveRoleMenu', controller.authority.saveRoleMenu);              // openapi
  // 敏捷开发
  // router.post('/dict/automatic/exp/pageDef/:moduleKey', controller.sdp.pageDef);                             // openapi 前端模块config组装数据
  // router.post('/dict/automatic/exp/bs/queryForm/:moduleKey', controller.sdp.baseShow);                       // openapi 表单查询
  // router.post('/dict/automatic/exp/bs/delete/:moduleKey', controller.sdp.baseDelete);                        // openapi 删
  // router.post('/dict/automatic/exp/bs/saveOrUpdate/:moduleKey', controller.sdp.baseEdit);                    // openapi 表单新建、修改
  // router.post('/dict/automatic/exp/bs/getCodeList', controller.sdp.getCodeList);                             // openapi 获取码表
  // router.post('/dict/automatic/exp/bs/queryPager/:moduleKey', controller.sdp.baseList2);                     // openapi 分页查询
  // router.post('/dict/automatic/exp/bs/queryPagerCustomer/:moduleKey____sqlKey', controller.sdp.baseList2c);  // openapi 分页查询 自定义SQL
  // API 日志分析
  router.post('/api/analysis/overview', controller.apiAnalysis.getOverview);
  router.post('/api/analysis/trend', controller.apiAnalysis.getTrend);
  router.post('/api/analysis/byInterface', controller.apiAnalysis.getByInterface);
  router.post('/api/analysis/byUser', controller.apiAnalysis.getByUser);
  router.post('/api/analysis/byStatusCode', controller.apiAnalysis.getByStatusCode);
  router.post('/api/analysis/byIp', controller.apiAnalysis.getByIp);
  router.post('/api/analysis/performance', controller.apiAnalysis.getPerformance);
  router.post('/api/analysis/hourly', controller.apiAnalysis.getHourly);
  // 应用日志分析
  router.post('/api/appLog/overview', controller.appLog.getOverview);
  router.post('/api/appLog/levelDistribution', controller.appLog.getLevelDistribution);
  router.post('/api/appLog/trend', controller.appLog.getTrend);
  router.post('/api/appLog/errorCodes', controller.appLog.getErrorCodes);
  router.post('/api/appLog/byIp', controller.appLog.getByIp);
  router.post('/api/appLog/byUrl', controller.appLog.getByUrl);
  router.post('/api/appLog/hourlyDistribution', controller.appLog.getHourlyDistribution);
  router.post('/api/appLog/weeklyDistribution', controller.appLog.getWeeklyDistribution);
};
