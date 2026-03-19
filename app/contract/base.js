'use strict';

module.exports = {
  baseResponse: {
    code: { type: 'string', required: true, example: '200' },
    msg: { type: 'string', example: '操作成功返回信息...' },
    body: { type: 'string', example: '操作成功返回数据，数据类型视业务决定...' },
  },
  baseDBResponse: {
    code: { type: 'string', required: true, example: '200' },
    body: { type: 'array', itemType: 'DbTableResponse', description: '操作成功返回信息...', example: [
      { msgType: '删除（创建）表', msg: '表【test_user_001】，删除（创建）成功', table: 'test_user_001', code: '200' },
    ] },
  },
  // 创建单张表
  createTableRequest: {
    table_name_eng: { type: 'string', example: 'test_user_001', description: '表英文名' },
    table_name_chi: { type: 'string', example: '测试用户表001', description: '表中文名' },
    table_cols: { type: 'array', itemType: 'DbTableStructure', description: '表列', example: [
      { f_name: 'uuid', f_type: 'varchar(40)', f_default_value: '', f_comment: 'UUID', f_not_null: 'Y', f_key: 'p_key' },
      { f_name: 'name', f_type: 'varchar(40)', f_default_value: '', f_comment: '姓名', f_not_null: '', f_key: '' },
      { f_name: 'create_time', f_type: 'date', f_default_value: '', f_comment: '录入时间', f_not_null: '', f_key: '' },
    ] },
  },
  // 删除单张表
  dropTableRequest: {
    table_name_eng: { type: 'string', example: 'test_user_001', description: '表英文名' },
  },
  // 创建多张表
  createTablesRequest: {
    tables: { type: 'array', itemType: 'DbTable', description: ' 表数据', example: [
      { table_name_eng: 'test_user_002', table_name_chi: '测试用户表002', table_cols: [
        { f_name: 'uuid', f_type: 'varchar(40)', f_default_value: '', f_comment: 'UUID', f_not_null: 'Y', f_key: 'p_key' },
        { f_name: 'name', f_type: 'varchar(40)', f_default_value: '', f_comment: '姓名', f_not_null: '', f_key: '' },
        { f_name: 'create_time', f_type: 'date', f_default_value: '', f_comment: '录入时间', f_not_null: '', f_key: '' },
      ] },
      { table_name_eng: 'test_user_003', table_name_chi: '测试用户表003', table_cols: [
        { f_name: 'uuid', f_type: 'varchar(40)', f_default_value: '', f_comment: 'UUID', f_not_null: 'Y', f_key: 'p_key' },
        { f_name: 'name', f_type: 'varchar(40)', f_default_value: '', f_comment: '姓名', f_not_null: '', f_key: '' },
        { f_name: 'create_time', f_type: 'date', f_default_value: '', f_comment: '录入时间', f_not_null: '', f_key: '' },
      ] },
    ] },
  },
  // 删除多张表
  dropTablesRequest: {
    tables: { type: 'array', itemType: 'DbTable', description: ' 表数据', example: [
      { table_name_eng: 'test_user_002' },
      { table_name_eng: 'test_user_003' },
    ] },
  },
  // 初始化数据库表数据
  initDbDataRequest: {
    data: { type: 'array', itemType: 'DbTable', description: ' 表数据', example: [
      { table_name_eng: 'test_user_002', exportData: [
        { uuid: 'user1', name: 'user1', create_time: '2025-01-01' },
        { uuid: 'user2', name: 'user2', create_time: '2025-01-01' },
        { uuid: 'user3', name: 'user3', create_time: '2025-01-01' },
      ] },
      { table_name_eng: 'test_user_003', exportData: [
        { uuid: 'user1', name: 'user1', create_time: '2025-01-01' },
        { uuid: 'user2', name: 'user2', create_time: '2025-01-01' },
        { uuid: 'user3', name: 'user3', create_time: '2025-01-01' },
      ] },
    ] },
  },
  // 用户角色设置
  setUserRoleRequest: {
    userIds: { type: 'string', required: true, description: '用户id', example: 'user01' },
    roleIds: { type: 'array', required: true, itemType: 'string', description: '角色id', example: [ 'ro_sys', 'ro_admin' ] },
  },
  // 角色菜单设置
  saveRoleMenuRequest: {
    roleId: { type: 'string', required: true, description: '角色id', example: 'ro_sys' },
    menuIds: { type: 'array', required: true, itemType: 'string', description: '菜单id', example: [ 'A20', 'A2010', 'A2020', 'A1020', 'A10' ] },
  },
  // 获取登录用户token
  getTokenRequest: {
    username: { type: 'string', required: true, description: '登录名', example: 'admin' },
    password: { type: 'string', required: true, description: '密码', example: 'ddit@1234' },
  },
  // 获取码表
  getCodeListResponse: {
    code: { type: 'string', example: '200' },
    body: { type: 'array', itemType: 'CodeTable', description: '表列', example: [
      { code: 'China', name: '中国' },
      { code: 'France', name: '法国' },
      { code: 'Spain', name: '西班牙' },
    ] },
  },
  // 删除(单条或批量)
  baseDeleteRequest: {
    uuids: { type: 'array', itemType: 'string', required: true, description: 'UUID', example: [ '20' ] },
  },
  // 获取表单详情
  baseShowRequest: {
    uuid: { type: 'string', description: 'UUID', example: '00ed13555c214d09804b905dfcf22cd0' },
  },
  // 编辑表单信息
  baseEditRequest: {
    uuid: { type: 'string', description: 'UUID', example: '00ed13555c214d09804b905dfcf22cd0' },
    sbpc: { type: 'string', description: '申报批次', example: '999' },
    ssq: { type: 'string', description: '所属期', example: '202512' },
    formType: { type: 'string', description: '编辑类型', example: 'edit' },
  },
  // 获取码表
  getCodeListRequest: {
    dictCodeId: { type: 'string', required: true, example: 'code_dm_def_module' },
  },
  // 获取码表
  pageDefRequest: {},
  // 分页列表 通用
  baseList2Request: {
    page: { type: 'integer', example: 1 },
    pageSize: { type: 'integer', example: 10 },
    config_table_default_order: { type: 'string', example: 'ssq asc,sbpc desc' },
    // orderModel: { type: 'array', description: '排序条件', example: [] },
    // searchModel: { type: 'array', description: '筛选条件', example: [] },
    // searchModel2: { type: 'array', description: '高级筛选条件', example: [] },
  },
};
