'use strict';

const Service = require('egg').Service;
const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');
const stream = require('stream');
const { randomUUID } = require('crypto');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);
const { AppError, BaseServiceError } = require('../extend/errorUtil');

const SQL_USER = 'select * from (select a.user_id, a.user_name, a.login_name, a.phone, a.used_flag, a.customer_config, unix_timestamp(a.update_time)*1000 as update_time, group_concat(b.role_id) role_id, group_concat(c.role_name) role_name from sys_user a left join sys_user_role_rel b on a.user_id = b.user_id left join sys_role c on c.role_id = b.role_id group by a.user_id) m where 1=1 ';
// const SQL_APP_MODULE = `SELECT m.module_key as moduleKey, m.module_name as moduleName, m.grid_show_serial_number as gridShowSerialNumber, m.grid_border as gridBorder, m.grid_selection_type as gridSelectionType, m.grid_col_edit as gridColEdit, m.grig_col_del as gridColDel, m.grid_col_detail as gridColDetail, m.toolbar_default_add as toolbarDefaultAdd, m.toolbar_default_delete as toolbarDefaultDelete, m.toolbar_default_edit as toolbarDefaultEdit, m.toolbar_default_upload as toolbarDefaultUpload, m.toolbar_default_download as toolbarDefaultDownload, m.toolbar_default_setting as toolbarDefaultSetting, m.toolbar_default_full as toolbarDefaultFull, m.toolbar_default_reload as toolbarDefaultReload, m.toolbar_default_advanced_filter as toolbarDefaultAdvancedFilter, m.api_form_edit as apiFormEdit, m.api_form_query as apiFormQuery, m.api_form_delete as apiFormDelete, m.api_grid_query as apiGridQuery, m.api_excel_export as apiExcelExport, m.api_excel_import as apiExcelImport, m.api_excel_template as apiExcelTemplate, m.form_layout_type as formLayoutType, m.form_width as formWidth, m.customer_btn_toolbar as customerBtnToolbar, m.customer_btn_grid_col as customerBtnGridCol FROM app_module m`;
// const SQL_APP_MODULE_FIELD = `SELECT m.module_key as moduleKey, m.dict_name as dictName, m.dict_field_name as dictFieldName, m.dict_field_desc as dictFieldDesc, m.dict_field_flag as dictFieldFlag, m.dict_field_filter as dictFieldFilter, m.dict_field_expr as dictFieldExpr, m.grid_used as gridUsed, m.grid_key as gridKey, m.grid_align as gridAlign, m.grid_width as gridWidth, m.grid_fixed as gridFixed, m.grid_hidden as gridHidden, m.grid_ellipsis as gridEllipsis, m.grid_render as gridRender, m.grid_sort as gridSort, m.grid_index as gridIndex, m.grid_children as gridChildren, m.filter_item_type as filterItemType, m.filter_item_extend as filterItemExtend, m.filter_item_index as filterItemIndex, m.filter_item_label as filterItemLabel, m.filter_item_position as filterItemRosition, m.filter_item_placeholder as filterItemPlaceholder, m.filter_item_layout as filterItemLayout, m.form_item_used as formItemUsed, m.form_item_type as formItemType, m.form_item_format as formItemFormat, m.form_item_readonly as formItemReadonly, m.form_item_extend as formItemExtend, m.form_item_layout as formItem_layout, m.form_item_event_onblur as formItemEventOnblur, m.form_item_event_onfocus as formItemEventOnfocus, m.form_item_event_onchange as formItemEventOnchange, m.form_item_rule as formItemRule, m.form_item_index as formItemIndex FROM app_module_field m`;

// 筛选条件
const FILTER_CONDITION = {
  range: { condetionCode: 'range', conditionDescChi: '范围', conditionCodeDesc: 'range' },
  equal: { condetionCode: 'eq', conditionDescChi: '等于', conditionCodeDesc: '=' },
  notEqual: { condetionCode: 'neq', conditionDescChi: '不等于', conditionCodeDesc: '<>' },
  greaterThan: { condetionCode: 'dy', conditionDescChi: '大于', conditionCodeDesc: '>' },
  greaterThanOrEqual: { condetionCode: 'dydy', conditionDescChi: '大于等于', conditionCodeDesc: '>=' },
  lessThan: { condetionCode: 'xy', conditionDescChi: '小于', conditionCodeDesc: '<' },
  lessThanOrEqual: { condetionCode: 'xydy', conditionDescChi: '小于等于', conditionCodeDesc: '<=' },
  include: { condetionCode: 'alike', conditionDescChi: '包含', conditionCodeDesc: 'like' },
  notInclude: { condetionCode: 'notlike', conditionDescChi: '不包含', conditionCodeDesc: 'not like' },
  startWith: { condetionCode: 'llike', conditionDescChi: '已...开头', conditionCodeDesc: 'llike' },
  startEnd: { condetionCode: 'rlike', conditionDescChi: '已...结尾', conditionCodeDesc: 'rlike' },
  isNull: { condetionCode: 'isEmpty', conditionDescChi: '为空', conditionCodeDesc: 'is null' },
  isNotNull: { condetionCode: 'isNotEmpty', conditionDescChi: '不为空', conditionCodeDesc: 'is not null' },
  in: { condetionCode: 'in', conditionDescChi: '包含', conditionCodeDesc: 'in' },
  notIn: { condetionCode: 'notIn', conditionDescChi: '不包含', conditionCodeDesc: 'not in' },
};

/**
 * 配置说明
 * sys_parameter: {               // 索引关键字，一般用于前端获取的字段不是物理表名称时，通过该字段匹配物理表
 *   table_name: 'sys_parameter', // 映射物理表名称
 *   p_key_field: 'uuid',         // 物理表主键字段，默认uuid
 *   p_key_auto_creation: true,   // 物理表主键是否自动创建，默认true
 *   sql: 'select * from ......', // 用于列表的自定义查询
 * },
 */
const sql_config = {
  default_p_key_field: 'uuid',
  m_sys_user: {
    table_name: 'sys_user',
    p_key_field: 'user_id',
    sql: SQL_USER,
    default_order: 'user_name asc',
  },
  m_sys_role: {
    table_name: 'sys_role',
    p_key_field: 'role_id',
    p_key_auto_creation: false,
    default_order: 'role_name asc',
  },
  m_sys_parameter: {
    table_name: 'sys_parameter',
  },
  m_sys_menu: {
    p_key_field: 'menu_id',
    // p_key_auto_creation: false,
    p_key_auto_creation: true,
  },
  m_sys_codetable: {
    table_name: 'sys_codetable',
    p_key_field: [ 'code_type', 'code' ],
    p_key_auto_creation: false,
  },
  app_module: {
    table_name: 'app_module',
    p_key_field: 'module_key',
    p_key_auto_creation: false,
    default_order: 'module_key asc',
  },
  app_module_field: {
    table_name: 'app_module_field',
    p_key_field: 'dict_field_id',
    default_order: 'module_key asc, dict_field_index asc',
  },
  dict: {
    table_name: 'dict',
    p_key_field: 'dict_name',
    p_key_auto_creation: false,
    default_order: 'dict_name asc',
  },
  dict_field: {
    table_name: 'dict_field',
    p_key_field: [ 'dict_name', 'dict_field_name' ],
    p_key_auto_creation: false,
    default_order: 'dict_name asc, dict_field_name asc',
  },
};

class BaseService extends Service {

  // 前端模块config组装数据
  async pageDef(pageKey) {
    const sqlParam = {
      module_key: pageKey,
    };
    const result1 = await this.app.mysql.get('app_module', sqlParam);
    // const result2 = await this.app.mysql.select('app_module_field', {
    //   where: sqlParam,
    //   orders: [['dict_field_index','asc']],
    // });

    let fieldSql = ' select f.dict_field_type, m.* from app_module_field m ';
    fieldSql += ' LEFT JOIN dict_field f on f.dict_field_name=m.dict_field_name and f.dict_name=m.dict_name';
    fieldSql += ` WHERE m.module_key='${pageKey}'`;
    fieldSql += ' order by m.dict_field_index asc';
    const result2 = await this.app.mysql.query(fieldSql);
    // this.ctx.logger.info('前端模块config组装数据', [ pageKey ]);
    return {
      code: '200',
      msg: 'pageDef成功',
      body: {
        moduleInfo: result1,
        appTableDict: result2,
      },
    };
  }

  // 删除执行 delete delete2
  async deleteCommon(pKeyArr, params, table_name) {
    const sqlParam = {};
    let result;
    let affectedRows;
    try {
      // result.nnnnmm = 1;
      if (pKeyArr.length === 1) { // 单一主键，主键标识key通过配置获取
        sqlParam[pKeyArr[0]] = params.uuids;
        result = await this.app.mysql.delete(table_name, sqlParam);
      } else if (pKeyArr.length > 1) { // 联合主键，主键标识key通过前端传递
        for (let i = 0; i < params.uuids.length; i++) {
          result = await this.app.mysql.delete(table_name, params.uuids[i]);
        }
      }
      affectedRows = result ? result.affectedRows : 0;
    } catch (err) {
      throw new AppError('删除执行异常', `deleteCommon: ${err.name}`, 'E900111', err); // 异常信息message 异常名称name 异常码errorCode 原始错误（可选，用于错误链）cause
    }
    if (affectedRows > 0) {
      return {
        code: '200',
        msg: `删除 ${result.affectedRows} 条数据成功`,
      };
    } else if (affectedRows === 0) {
      return {
        code: '200',
        msg: '没有数据被删除',
      };
    }
    return {
      code: '90012',
      msg: '删除失败',
    };
  }

  // 删除(单条或批量)
  async delete(moduleKey, params) {
    const sql_config_table = sql_config[moduleKey] || {};
    // 表名称: 1、body体config_table_name字段 2、后端配置table_name 3、moduleKey
    const table_name = params.config_table_name || sql_config_table.table_name || moduleKey;
    // 表主键: 1、body体config_table_p_key_field字段 2、后端配置p_key_field 3、默认主键default_p_key_field
    const p_key_field = params.config_table_p_key_field || sql_config_table.p_key_field || sql_config.default_p_key_field;
    const pKeyArr = Array.isArray(p_key_field) ? p_key_field : [ p_key_field ]; // 表主键 -> 表主键数组
    return this.deleteCommon(pKeyArr, params, table_name);
  }

  // 删除(单条或批量) 基于前端config
  async delete2(moduleKey, params) {
    const sqlParam = { module_key: moduleKey };
    const moduleField = await this.app.mysql.select('app_module_field', { where: sqlParam });
    let tableArr = [];
    const pKeyArr = [];
    const moduleFieldUsed = moduleField.filter(tmp => (tmp.grid_used === '1' && tmp.dict_name && tmp.dict_field_name));
    moduleFieldUsed.forEach(row => {
      tableArr.push(row.dict_name); // 整合使用的物理表
      if (row.grid_key === '1') {
        pKeyArr.push(row.dict_field_name); // 整合使用的主键
      }
    });
    tableArr = [ ...new Set(tableArr) ];
    const table_name = tableArr[0];
    return this.deleteCommon(pKeyArr, params, table_name);
  }

  // 表单查询
  async show(moduleKey, params) {
    const sql_config_table = sql_config[moduleKey] || {};
    // 表名称: 1、body体config_table_name字段 2、后端配置table_name 3、moduleKey
    const table_name = params.config_table_name || sql_config_table.table_name || moduleKey;
    // 表主键: 1、body体config_table_p_key_field字段 2、后端配置p_key_field 3、默认主键default_p_key_field
    const p_key_field = params.config_table_p_key_field || sql_config_table.p_key_field || sql_config.default_p_key_field;
    const pKeyArr = Array.isArray(p_key_field) ? p_key_field : [ p_key_field ]; // 表主键 -> 表主键数组
    const sqlParam = {};
    let result;
    if (pKeyArr.length === 1) { // 单一主键，主键标识key通过配置获取
      sqlParam[pKeyArr[0]] = params[pKeyArr[0]];
      result = await this.app.mysql.get(table_name, sqlParam);
    } else if (pKeyArr.length > 1) { // 联合主键，主键标识key通过前端传递
      for (let i = 0; i < pKeyArr.length; i++) {
        sqlParam[pKeyArr[i]] = params[pKeyArr[i]];
      }
      result = await this.app.mysql.get(table_name, sqlParam);
    }
    const showSuccess = result;
    if (showSuccess) {
      return {
        code: '200',
        msg: '表单查询成功',
        body: result,
      };
    }
    return {
      code: '900',
      msg: '表单查询结果为空',
      body: result,
    };
  }

  // 表单查询 基于前端config生成sql查询
  async show2(moduleKey, params) {
    const sqlParam = { module_key: moduleKey };
    // let uu;
    try {
      // uu.abcg = 98;
      let fieldSql = ' select f.dict_field_type, m.* from app_module_field m ';
      fieldSql += ' LEFT JOIN dict_field f on f.dict_field_name=m.dict_field_name and f.dict_name=m.dict_name';
      fieldSql += ` WHERE m.module_key='${moduleKey}'`;
      fieldSql += ' order by m.dict_field_index';
      const moduleField = await this.app.mysql.query(fieldSql);
      // const moduleField = await this.app.mysql.select('app_module_field', {where: sqlParam});

      let tableArr = [];
      const pKeyArr = [];
      const sqlJoinArr = [];
      let sql = 'select ';
      const moduleFieldUsed = moduleField.filter(tmp => (tmp.form_item_used === '1' && tmp.dict_name && tmp.dict_field_name));
      moduleFieldUsed.forEach((row, index) => {
        tableArr.push(row.dict_name);
        if (row.grid_key === '1') {
          pKeyArr.push({
            dict_name: row.dict_name,
            dict_field_name: row.dict_field_name,
          }); // 整合使用的主键
        }
        const t1 = index === moduleFieldUsed.length - 1 ? '' : ',';
        // sql += `${row.dict_name}.${row.dict_field_name} as ${row.dict_field_name}${t1}\n`;
        // 列表查询sql
        if (row.dict_field_type && row.dict_field_type.indexOf('date') > -1) {
          sql += `unix_timestamp(${row.dict_name}.${row.dict_field_name})*1000 as ${row.dict_field_name}${t1}\n`;
        } else {
          sql += `${row.dict_name}.${row.dict_field_name} as ${row.dict_field_name}${t1}\n`;
        }

        // 处理关联表达式 dict_field_expr
        // 格式：left join mts_tssb on mts_tsjh.glh = mts_tssb.glh （或简写 left join mts_tsjh）
        // 格式：left join mts_tssb on mts_tsjh.ssq = mts_tssb.ssq
        if (row.dict_field_expr) {
          // 拆解表达式，格式： ['left join mts_tssb', 'mts_tsjh.glh = mts_tssb.glh'] 或 ['left join mts_tssb']
          const exprArrTmp = row.dict_field_expr.split('on');
          const tmp2 = exprArrTmp[0]; // 格式：'left join mts_tssb'
          const joinTableTmp = tmp2.split('join')[1]; // 格式：'mts_tssb'
          // 拼接on条件 -> mts_tsjh.glh = mts_tssb.glh
          const tmpOn = exprArrTmp.length > 1 ? exprArrTmp[1] : `${row.dict_name}.${row.dict_field_name}=${joinTableTmp}.${row.dict_field_name}`;
          sqlJoinArr.push({
            on: tmpOn, // 格式：mts_tsjh.glh = mts_tssb.glh
            table: tmp2.trim(), // 格式：mts_tsjh
          });
        }
      });
      tableArr = [ ...new Set(tableArr) ];
      const table_name = tableArr[0]; // 主表
      sql += ' from ';
      sql += table_name;
      // 去重join table 合并 on -> and
      const sqlJoinArrByGroup = sqlJoinArr.reduce((acc, item) => {
        const table = item.table;
        if (!acc[table]) {
          acc[table] = [];
        }
        acc[table].push(item);
        return acc;
      }, {});
      Object.keys(sqlJoinArrByGroup).forEach(key => {
        sql += ` ${key} on`;
        const tmp111 = sqlJoinArrByGroup[key];
        tmp111.forEach((item, index) => {
          const t1 = index === tmp111.length - 1 ? '' : 'and';
          sql += ` ${item.on} ${t1} `;
        });
      });
      sql += ' where 1=1';
      if (pKeyArr.length === 1) { // 单一主键，主键标识key通过配置获取
        sql += ` and ${pKeyArr[0].dict_name}.${pKeyArr[0].dict_field_name}='${params[pKeyArr[0].dict_field_name]}'`;
      } else if (pKeyArr.length > 1) { // 联合主键，主键标识key通过前端传递
        for (let i = 0; i < pKeyArr.length; i++) {
          sql += ` and ${pKeyArr[i].dict_name}.${pKeyArr[i].dict_field_name}='${params[pKeyArr[i].dict_field_name]}'`;
        }
      }
      // 记录条数
      // console.info('测试 ~~~~~~~~~~~~~~~~~~~~~');
      // console.info(pKeyArr);
      // console.info(sql);
      const rowsAll = await this.app.mysql.query(sql);
      const rowCount = rowsAll.length;
      if (rowCount === 1) {
        return {
          code: '200',
          msg: '表单查询成功',
          body: rowsAll[0],
        };
      } else if (rowCount > 1) {
        return {
          code: '90031',
          msg: `表单查询结果 ${rowCount}条`,
          body: rowsAll,
        };
      } else if (rowCount === 0) {
        return {
          code: '200',
          msg: '表单查询结果为空',
        };
      }
      return {
        code: '90032',
        msg: '表单查询失败',
      };
    } catch (err) {
      throw new AppError('表单查询执行异常', `show2: ${err.name}`, 'E900121', err);
    }
  }

  // 编辑
  async edit(moduleKey, params) {
    const sql_config_table = sql_config[moduleKey] || {};
    // 表名称: 1、body体config_table_name字段 2、后端配置table_name 3、moduleKey
    const table_name = params.config_table_name || sql_config_table.table_name || moduleKey;
    // 表主键: 1、body体config_table_p_key_field字段 2、后端配置p_key_field 3、默认主键default_p_key_field
    const p_key_field = params.config_table_p_key_field || sql_config_table.p_key_field || sql_config.default_p_key_field;
    const pKeyArr = Array.isArray(p_key_field) ? p_key_field : [ p_key_field ]; // 表主键 -> 表主键数组
    const sqlParam = {};
    // 新增时主键是否自动生成config_table_p_key_auto_creation，默认true
    let p_key_auto_creation = sql_config_table.p_key_auto_creation === undefined ? true : sql_config_table.p_key_auto_creation;
    p_key_auto_creation = params.config_table_p_key_auto_creation === undefined ? p_key_auto_creation : params.config_table_p_key_auto_creation;

    const formType = params.formType;
    delete params.formType;
    delete params.config_table_name;
    delete params.config_table_p_key_field;
    delete params.config_table_p_key_auto_creation;
    let result;
    if (formType === 'edit') { // 主键值存在 -> 更新
      let options;
      if (pKeyArr.length === 1) { // 单一主键，主键标识key通过配置获取
        sqlParam[pKeyArr[0]] = params[pKeyArr[0]];
      } else if (pKeyArr.length > 1) { // 联合主键，主键标识key通过前端传递
        for (let i = 0; i < pKeyArr.length; i++) {
          sqlParam[pKeyArr[i]] = params[pKeyArr[i]];
        }
      }
      options = { where: sqlParam };
      result = await this.app.mysql.update(table_name, params, options);
    } else { // 主键值不存在 -> 新增
      const insertParam = { ...params };
      if (pKeyArr.length === 1) { // 单一主键，主键标识key通过配置获取
        if (p_key_auto_creation) {
          insertParam[pKeyArr[0]] = this.ctx.helper.uuid(36);
        }
      } else if (pKeyArr.length > 1) { // 联合主键，主键标识key通过前端传递
        if (p_key_auto_creation) {
          for (let i = 0; i < pKeyArr.length; i++) {
            insertParam[pKeyArr[i]] = this.ctx.helper.uuid(36);
          }
        }
      }
      result = await this.app.mysql.insert(table_name, insertParam);
    }
    const editSuccess = result.affectedRows === 1;
    if (editSuccess) {
      return {
        code: '200',
        msg: '编辑成功',
      };
    }
    return {
      code: '900',
      msg: '编辑失败',
    };
  }

  // 创建文件夹
  mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    }
    if (this.mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }

  // 编辑 基于前端config
  async edit2(moduleKey, params) {
    // console.log('🚀 ~ BaseService ~ edit2 ~ moduleKey:', moduleKey);
    let result;
    let affectedRows;
    if (moduleKey === 'm_media_mgr') {
      try {
        const parts = this.ctx.multipart(); // 可修改默认参数
        let part;
        while ((part = await parts()) != null) {
          if (part.length) { // 非文件类型参数
            if (part[0] && part[1]) {
              params[part[0]] = part[1];
            }
          } else { // 文件类型参数
            const { filename, fieldname, encoding, mime } = part;
            const fileMD5 = params.media_file_md5;
            const extname = path.extname(filename);
            const targetPath = path.join(this.config.baseDir, 'app/public', fileMD5 + extname);// randomUUID()
            const writeStream = fs.createWriteStream(targetPath);
            await pipeline(part, writeStream); // use `pipeline` not `pipe`
          }
        }
      } catch (err) {
        throw new AppError('表单编辑执行异常', `edit2: ${err.name}`, 'E900132', err);
      }
    }
    try {
      const sql_config_table = sql_config[moduleKey] || {};
      let sqlParam = { module_key: moduleKey };
      const moduleField = await this.app.mysql.select('app_module_field', { where: sqlParam });
      let tableArr = [];
      const pKeyArr = [];
      const p_key_auto_creation = sql_config_table.p_key_auto_creation === undefined ? true : sql_config_table.p_key_auto_creation;
      const moduleFieldUsed = moduleField.filter(tmp => (tmp.form_item_used === '1' && tmp.dict_name && tmp.dict_field_name));
      moduleFieldUsed.forEach(row => {
        tableArr.push(row.dict_name);
        if (row.grid_key === '1') {
          pKeyArr.push(row.dict_field_name); // 整合使用的主键
        }
        // 更新为系统日期的项
        if (row.dict_field_name && row.form_item_extend === 'edit:sysdate') {
          console.log('🚀 ~ BaseService ~ edit2 ~ key2:', row);
          params[row.dict_field_name] = new Date();
        }
      });
      Object.keys(params).forEach(key2 => {
        for (let i = 0; i < moduleFieldUsed.length; i++) {
          if (key2 === moduleFieldUsed[i].dict_field_name && moduleFieldUsed[i].form_item_type === 'DatePicker') {
            params[key2] = this.ctx.helper.formatDate((params[key2]), 'YYYY-MM-DD HH:mm:ss');
            break;
          }
        }
      });
      tableArr = [ ...new Set(tableArr) ];
      const table_name = tableArr[0];
      const formType = params.formType;
      delete params.formType;
      delete params.key;
      sqlParam = {};
      if (formType === 'edit') { // 主键值存在 -> 更新
        let options;
        if (pKeyArr.length === 1) { // 单一主键，主键标识key通过配置获取
          sqlParam[pKeyArr[0]] = params[pKeyArr[0]];
        } else if (pKeyArr.length > 1) { // 联合主键，主键标识key通过前端传递
          for (let i = 0; i < pKeyArr.length; i++) {
            sqlParam[pKeyArr[i]] = params[pKeyArr[i]];
          }
        }
        options = { where: sqlParam };
        result = await this.app.mysql.update(table_name, params, options);
      } else { // 主键值不存在 -> 新增
        const insertParam = { ...params };
        if (pKeyArr.length === 1) { // 单一主键，主键标识key通过配置获取
          if (p_key_auto_creation) {
            insertParam[pKeyArr[0]] = this.ctx.helper.uuid(36);
          }
        } else if (pKeyArr.length > 1) { // 联合主键，主键标识key通过前端传递
          if (p_key_auto_creation) {
            for (let i = 0; i < pKeyArr.length; i++) {
              insertParam[pKeyArr[i]] = this.ctx.helper.uuid(36);
            }
          }
        }
        result = await this.app.mysql.insert(table_name, insertParam);
      }
      affectedRows = result.affectedRows;
    } catch (err) {
      throw new AppError('表单编辑执行异常', `edit2: ${err.name}`, 'E900131', err);
    }
    if (affectedRows > 0) {
      return {
        code: '200',
        msg: '编辑成功',
      };
    } else if (affectedRows === 0) {
      return {
        code: '200',
        msg: '没有数据被修改',
      };
    }
    return {
      code: '90023',
      msg: '编辑失败',
    };
  }

  // 列表查询
  async list(moduleKey, params) {
    // console.info('列表查询 ##########', moduleKey, params);
    const sql_config_table = sql_config[moduleKey] || {};
    // 表名称: 1、body体config_table_name字段 2、后端配置table_name 3、moduleKey
    const table_name = params.config_table_name || sql_config_table.table_name || moduleKey;
    // Sql: 1、后端配置sql 2、根据表明全量查询select * from ...
    let sql = sql_config_table.sql || `select * from ${table_name} m where 1=1`;
    // 初始排序
    const defaultOrder = params.config_table_default_order || sql_config_table.default_order;
    const { pageSize = 5, page = 1, searchModel = [], orderModel = [] } = params;
    // 查询条件
    for (const item of searchModel) {
      if (item.value) {
        if (item.op === 'alike') { // alike
          sql += ` and  m.${item.property} like '%${item.value}%'`;
        }
        if (item.op === 'eq') {
          sql += ` and m.${item.property} = '${item.value}'`;
        }
        if (item.op === 'neq') {
          sql += ` and m.${item.property} != '${item.value}'`;
        }
        if (item.op === 'dydy') {
          if (item.type === 5) {
            sql += ` and UNIX_TIMESTAMP(m.${item.property}) >= ${item.value}/1000`;
            // sql += ` and m.${item.property} >= ${item.value}`;
          } else {
            sql += ` and m.${item.property} >= ${item.value}`;
          }
        }
        if (item.op === 'xydy') {
          if (item.type === 5) {
            sql += ` and UNIX_TIMESTAMP(m.${item.property}) <= ${item.value}/1000`;
            // sql += ` and m.${item.property} <= ${item.value}`;
          } else {
            sql += ` and m.${item.property} <= ${item.value}`;
          }
        }
      }
    }
    // 记录条数
    const rowsAll = await this.app.mysql.query(sql);
    const rowCount = rowsAll.length;
    // 排序
    if (orderModel && orderModel.length > 0) {
      sql += ' order by ';
      for (let m = 0; m < orderModel.length; m++) {
        const tmp3 = m !== orderModel.length - 1 ? ',' : '';
        sql += ` ${orderModel[m].field} ${orderModel[m].order}${tmp3}`;
      }
    } else {
      // 初始排序
      if (defaultOrder) {
        sql += ` order by ${defaultOrder}`;
      }
    }
    // 当前页数据
    sql += ` LIMIT ${Number(pageSize) * (Number(page) - 1)}, ${Number(pageSize)}`;
    const rows = await this.app.mysql.query(sql);
    const results = {
      code: '200',
      body: {
        rowCount,
        rows,
      },
    };
    return results;
  }

  getSqlTxt(treeData) {
    const tmpSql = [];
    const treeRecursive = (targetTreeData = []) => {
      const nodeSqlBracketleft = '(';
      const nodeSqlBracketRight = ')';
      const nodeSqlLop = item => item.lop;
      targetTreeData.forEach((item, index) => {
        if (item.children && item.children.length > 0) {
          if (index === 0) {
            tmpSql.push(nodeSqlBracketleft);
          } else {
            tmpSql.push(`${nodeSqlLop(item)} ${nodeSqlBracketleft}`);
          }
          treeRecursive(item.children);
          tmpSql.push(nodeSqlBracketRight);
        } else {
          const dictName = item.dict_name;
          let opObj = {};
          let fieldVal = item.value?.toString() || '';
          Object.keys(FILTER_CONDITION).forEach(key => {
            if (FILTER_CONDITION[key].condetionCode === item.op) {
              opObj = FILTER_CONDITION[key];
            }
          });
          if (opObj?.conditionCodeDesc === '=' || opObj?.conditionCodeDesc === '<>') {
            fieldVal = `'${fieldVal}'`;
          }
          if (opObj?.conditionCodeDesc === 'like' || opObj?.conditionCodeDesc === 'not like') {
            fieldVal = `'%${fieldVal}%'`;
          }
          if (opObj?.conditionCodeDesc === 'llike') {
            fieldVal = `'${fieldVal}%'`;
          }
          if (opObj?.conditionCodeDesc === 'rlike') {
            fieldVal = `'%${fieldVal}'`;
          }
          if (opObj?.conditionCodeDesc === 'in' || opObj?.conditionCodeDesc === 'not in') {
            fieldVal = fieldVal.replaceAll(',', "','");
            fieldVal = `('${fieldVal}')`;
          }
          let tmpGroup;
          if (item.type === 5) {
            tmpGroup = `${nodeSqlBracketleft} UNIX_TIMESTAMP(${dictName}.${item.dict_field_name}) ${opObj?.conditionCodeDesc} ${fieldVal}/1000 ${nodeSqlBracketRight}`;
          } else {
            tmpGroup = `${nodeSqlBracketleft} ${dictName}.${item.dict_field_name} ${opObj?.conditionCodeDesc} ${fieldVal} ${nodeSqlBracketRight}`;
          }
          // const tmpGroup = `${nodeSqlBracketleft} ${dictName}.${item.dict_field_name} ${opObj?.conditionCodeDesc} ${fieldVal} ${nodeSqlBracketRight}`;
          // const tmpGroup = `${nodeSqlBracketleft} ${dictName}.${item.dictFieldName} ${opObj?.conditionCodeDesc} ${fieldVal} ${nodeSqlBracketRight}`;
          if (index === 0) {
            tmpSql.push(tmpGroup);
          } else {
            tmpSql.push(`${nodeSqlLop(item)} ${tmpGroup}`);
          }
        }
      });
    };
    // console.info('treeData ~~~~~~~~~', treeData);
    treeRecursive(treeData);
    const tmpSqlTxt = tmpSql.join(' ');
    return tmpSqlTxt;
  }

  // 列表查询
  async list2(moduleKey, params, sqlKey) {
    // console.info('列表查询通用 ##########', moduleKey, params, sqlKey);
    // console.info(moduleKey, sqlKey);
    // console.info(sqlKey);
    // console.info(params);
    const sqlParam = { module_key: moduleKey };
    // const moduleField = await this.app.mysql.select('app_module_field', {where: sqlParam});

    let fieldSql = ' select f.dict_field_type, m.* from app_module_field m ';
    fieldSql += ' LEFT JOIN dict_field f on f.dict_field_name=m.dict_field_name and f.dict_name=m.dict_name';
    fieldSql += ` WHERE m.module_key='${moduleKey}'`;
    fieldSql += ' order by m.dict_field_index';
    const moduleField = await this.app.mysql.query(fieldSql);
    let tableArr = [];
    const pKeyArr = [];
    const sqlJoinArr = [];
    const sqlMediaArr = [];
    const orderArr = [];
    let sql = 'select '; // 列表查询sql
    let sqlStat = 'select '; // 统计sql
    const sqlStatField = []; // 统计sql
    const moduleFieldUsed = moduleField.filter(tmp => (tmp.grid_used === '1' && tmp.dict_name && tmp.dict_field_name));
    moduleFieldUsed.forEach((row, index) => {
      tableArr.push(row.dict_name);
      if (row.grid_key === '1') {
        pKeyArr.push({
          dict_name: row.dict_name,
          dict_field_name: row.dict_field_name,
        }); // 整合使用的主键
      }
      const t1 = index === moduleFieldUsed.length - 1 ? '' : ',';
      // 列表查询sql
      if (row.dict_field_type && row.dict_field_type.indexOf('date') > -1) {
        sql += `unix_timestamp(${row.dict_name}.${row.dict_field_name})*1000 as ${row.dict_field_name}${t1}\n`;
      } else {
        sql += `${row.dict_name}.${row.dict_field_name} as ${row.dict_field_name}${t1}\n`;
      }
      // 统计sql
      if (row.grid_stat && (row.grid_stat === '1' || row.grid_stat === 'fun' || row.grid_stat.indexOf('sum') > -1)) {
        sqlStatField.push(`sum(${row.dict_name}.${row.dict_field_name}) as sum___${row.dict_field_name}\n`);
      }
      if (row.grid_stat && (row.grid_stat === '1' || row.grid_stat === 'fun' || row.grid_stat.indexOf('min') > -1)) {
        sqlStatField.push(`min(${row.dict_name}.${row.dict_field_name}) as min___${row.dict_field_name}\n`);
      }
      if (row.grid_stat && (row.grid_stat === '1' || row.grid_stat === 'fun' || row.grid_stat.indexOf('max') > -1)) {
        sqlStatField.push(`max(${row.dict_name}.${row.dict_field_name}) as max___${row.dict_field_name}\n`);
      }
      if (row.grid_stat && (row.grid_stat === '1' || row.grid_stat === 'fun' || row.grid_stat.indexOf('avg') > -1)) {
        sqlStatField.push(`avg(${row.dict_name}.${row.dict_field_name}) as avg___${row.dict_field_name}\n`);
      }
      // 处理关联表达式 dict_field_expr
      // 格式：left join mts_tssb on mts_tsjh.glh = mts_tssb.glh （或简写 left join mts_tsjh）
      // 格式：left join mts_tssb on mts_tsjh.ssq = mts_tssb.ssq
      if (row.dict_field_expr) {
        // 拆解表达式，格式： ['left join mts_tssb', 'mts_tsjh.glh = mts_tssb.glh'] 或 ['left join mts_tssb']
        const exprArrTmp = row.dict_field_expr.split('on');
        const tmp2 = exprArrTmp[0]; // 格式：'left join mts_tssb'
        const joinTableTmp = tmp2.split('join')[1]; // 格式：'mts_tssb'
        // 拼接on条件 -> mts_tsjh.glh = mts_tssb.glh
        const tmpOn = exprArrTmp.length > 1 ? exprArrTmp[1] : `${row.dict_name}.${row.dict_field_name}=${joinTableTmp}.${row.dict_field_name}`;
        sqlJoinArr.push({
          on: tmpOn, // 格式：mts_tsjh.glh = mts_tssb.glh
          table: tmp2.trim(), // 格式：mts_tsjh
        });
      }
      // 处理媒体类型文件
      if (row.grid_render === 'media:imagepath' || row.grid_render === 'media:videopath') {
        sqlMediaArr.push(row);
      }
      // 处理排序
      if (row.dict_field_default_order) {
        orderArr.push(row);
      }
    });
    tableArr = [ ...new Set(tableArr) ];
    const table_name = tableArr[0]; // 主表
    let sqlCommon = ` from ${table_name}`;
    // 去重join table 合并 on -> and
    const sqlJoinArrByGroup = sqlJoinArr.reduce((acc, item) => {
      const table = item.table;
      if (!acc[table]) {
        acc[table] = [];
      }
      acc[table].push(item);
      return acc;
    }, {});
    Object.keys(sqlJoinArrByGroup).forEach(key => {
      sqlCommon += ` ${key} on`;
      const tmp111 = sqlJoinArrByGroup[key];
      tmp111.forEach((item, index) => {
        const t1 = index === tmp111.length - 1 ? '' : 'and';
        sqlCommon += ` ${item.on} ${t1} `;
      });
    });

    let midiaTableSql = '';
    let midiaFieldSql = '';
    sqlMediaArr.forEach((mediaItem, index) => {
      midiaTableSql += ` left join media_mgr media_mgr_${index} on media_mgr_${index}.media_uuid = ${table_name}.${mediaItem.dict_field_name}`;
      midiaFieldSql += ` ,media_mgr_${index}.media_file_md5 as ${mediaItem.dict_field_name}_media_file_md5 `;
      midiaFieldSql += ` ,media_mgr_${index}.media_type as ${mediaItem.dict_field_name}_media_type `;
      midiaFieldSql += ` ,media_mgr_${index}.media_name as ${mediaItem.dict_field_name}_media_name `;
    });
    if (midiaTableSql && midiaFieldSql) {
      sql += midiaFieldSql;
      sqlCommon += midiaTableSql;
    }

    let sqlCommonWhere = ' where 1=1 ';
    const { pageSize = 5, page = 1, searchModel = [], orderModel = [], searchModel2 = [] } = params;
    // 查询条件
    if (searchModel2 && searchModel2.length > 0) {
      const aaa = this.getSqlTxt(searchModel2);
      if (aaa) { // alike
        sqlCommonWhere += ` and  ${aaa}`;
      }
    } else {
      for (const item of searchModel) {
        if (item.value) {
          if (item.op === 'alike') { // alike
            sqlCommonWhere += ` and  ${item.dict_name}.${item.dict_field_name} like '%${item.value}%'`;
          }
          if (item.op === 'eq') {
            sqlCommonWhere += ` and ${item.dict_name}.${item.dict_field_name} = '${item.value}'`;
          }
          if (item.op === 'dydy') {
            if (item.type === 5) {
              // sqlCommonWhere += ` and ${item.dict_name}.${item.dict_field_name} >= ${item.value}`;
              sqlCommonWhere += ` and UNIX_TIMESTAMP(${item.dict_name}.${item.dict_field_name}) >= ${item.value}/1000`;
            } else {
              sqlCommonWhere += ` and ${item.dict_name}.${item.dict_field_name} >= ${item.value}`;
            }
          }
          if (item.op === 'xydy') {
            if (item.type === 5) {
              // sqlCommonWhere += ` and ${item.dict_name}.${item.dict_field_name} <= ${item.value}`;
              sqlCommonWhere += ` and UNIX_TIMESTAMP(${item.dict_name}.${item.dict_field_name}) <= ${item.value}/1000`;
            } else {
              sqlCommonWhere += ` and ${item.dict_name}.${item.dict_field_name} <= ${item.value}`;
            }
          }
        }
      }
    }
    // 自定义SQL
    if (sqlKey) {
      const customerSqlObj = await this.app.mysql.get('sys_customer_sql', {
        sql_key: sqlKey,
      });
      sql = customerSqlObj.sql_cvalue;
      sql += sqlCommonWhere;
    } else {
      sql += sqlCommon + sqlCommonWhere;
    }
    const tamp1212 = sqlStatField.join(',');
    sqlStat += tamp1212 + sqlCommon;

    // console.info(sql);

    // 记录条数
    const rowsAll = await this.app.mysql.query(sql);
    const rowCount = rowsAll.length;

    // 排序
    if (orderModel && orderModel.length > 0) {
      // console.info('列表点击排序 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', orderModel);
      // 列表点击排序
      sql += ' order by ';
      for (let m = 0; m < orderModel.length; m++) {
        const tmp3 = m !== orderModel.length - 1 ? ',' : '';
        sql += ` ${orderModel[m].dict_name}.${orderModel[m].dict_field_name} ${orderModel[m].order}${tmp3}`;
      }
    } else {
      // console.info('默认排序 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', orderArr);
      // 默认排序
      if (orderArr.length > 0) {
        const tmp0 = [];
        for (let i = 0; i < orderArr.length; i++) {
          const tmp1 = orderArr[i].dict_field_default_order.split(',') || [];
          tmp0.push({
            ...orderArr[i],
            order: tmp1[0],
            index: tmp1[1],
          });
        }
        tmp0.sort((a, b) => a.index - b.index);
        sql += ' order by';
        for (let m = 0; m < tmp0.length; m++) {
          const tmp3 = m !== tmp0.length - 1 ? ',' : '';
          sql += ` ${tmp0[m].dict_name}.${tmp0[m].dict_field_name} ${tmp0[m].order}${tmp3}`;
        }
      }
    }

    // if (orderModel && orderModel.length > 0) {
    //   sql += ' order by ';
    //   for (const orderItem of orderModel) {
    //     sql += ` ${orderItem.field} ${orderItem.order}`;
    //   }
    // //   Object.keys(orderModel).forEach(key => {
    // //     sql += ` ${key} ${orderModel[key]}`;
    // //   });
    // }
    // else {
    //   sql += ' order by add_time desc';
    // }

    // 当前页数据
    sql += ` LIMIT ${Number(pageSize) * (Number(page) - 1)}, ${Number(pageSize)}`;
    const rows = await this.app.mysql.query(sql);
    let statisticsRes = [];
    if (sqlStatField.length > 0) {
      statisticsRes = await this.app.mysql.query(sqlStat);
    }
    const statistics = {
      avg: {},
      max: {},
      min: {},
      sum: {},
    };
    if (statisticsRes.length > 0) {
      Object.keys(statisticsRes[0]).forEach(key => {
        if (key.indexOf('sum') > -1) {
          statistics.sum[key.replace('sum___', '')] = statisticsRes[0][key] || 0;
        } else if (key.indexOf('min') > -1) {
          statistics.min[key.replace('min___', '')] = statisticsRes[0][key] || 0;
        } else if (key.indexOf('max') > -1) {
          statistics.max[key.replace('max___', '')] = statisticsRes[0][key] || 0;
        } else if (key.indexOf('avg') > -1) {
          statistics.avg[key.replace('avg___', '')] = statisticsRes[0][key] || 0;
        }
      });
    }

    const results = {
      code: '200',
      body: {
        rowCount,
        rows,
        statistics,
      },
    };
    return results;
  }

  // 导入Excel
  async importExcel(tableName, params, body) {
    let finallyData = []; // 最终的导入数据
    let drgz = ''; // 导入规则：追加 情况原有数据
    if (body && body.parseType === 'front') {
      // finallyData = body.exportData;
      finallyData = body.exportData[0].jsonData;
      drgz = body.drgz;
    } else {
      const file = await params;
      const workbook = new Excel.Workbook();
      await workbook.xlsx.read(file);
      // const worksheet = workbook.getWorksheet(1);
      const worksheet = workbook.worksheets[0];
      const exceldata = [];
      worksheet.eachRow(function(row) {
        exceldata.push(row.values);
      });
      // const headerArr = JSON.parse(file.fields.header);
      // const finallyData = [];
      // for (let n = 1; n < exceldata.length; n++) {
      //   const obj = {};
      //   for (let i = 1; i < headerArr.length; i++) {
      //     if (headerArr[i].dataIndex) {
      //       for (let j = 1; j < exceldata[n].length; j++) {
      //         if (i === j) {
      //           obj[headerArr[i].dataIndex] = exceldata[n][j];
      //         }
      //       }
      //     }
      //   }
      // }
      const headerConfig = JSON.parse(file.fields.header); // 表头配置
      drgz = file.fields.drgz;
      const rowHeader = exceldata[0];
      for (let p = 0; p < rowHeader.length; p++) {
        if (!rowHeader[p]) {
          continue;
        }
        for (let k = 0; k < headerConfig.length; k++) {
          if (rowHeader[p] === headerConfig[k].title) {
            exceldata[0][p] = headerConfig[k].dataIndex;
            break;
          }
        }
      }
      for (let m = 1; m < exceldata.length; m++) {
        const obj = {};
        for (let n = 1; n < rowHeader.length; n++) {
          obj[rowHeader[n]] = exceldata[m][n];
        }
        finallyData.push(obj);
      }
    }
    // 增加主键
    // finallyData.forEach(item => {
    //   item.uuid = this.ctx.helper.uuid(36);
    // });
    // const logData = await this.app.mysql.select(tableName);
    // const result1 = await this.app.mysql.delete(tableName); // 清除原始数据
    // const deleteSuccess = result1.affectedRows > 0;
    // if (deleteSuccess) {
    // await this.writeLog(tableName, logData, 'batch delete');
    // }
    const result2 = await this.app.mysql.insert(tableName, finallyData);
    const drSuccess = result2.affectedRows > 0;
    if (drSuccess) {
      // await this.writeLog(tableName, finallyData, 'insert');
      return {
        code: '200',
        msg: `成功导入${finallyData.length}条数据`,
      };
    }

    return {
      code: '900',
      msg: '导入失败',
    };
  }

  // 生成Excel
  async createExcel(tableName, params) {
    // const headers = [[
    //   { t: '单位名称', f: 'deptName', w: 20, m1: 'A1', m2: 'A3', totalRowText: '合计' },
    //   { t: '办理身份证证件', m1: 'B1', m2: 'M1' },
    //   { t: '临时身份证证件', m1: 'N1', m2: 'O1' },
    //   { t: '总计', m1: 'P1', m2: 'R2' },
    // ], [
    //   { t: '申领', m1: 'B2', m2: 'D2' },
    //   { t: '换领', m1: 'E2', m2: 'G2' },
    //   { t: '补领', m1: 'H2', m2: 'J2' },
    //   { t: '小计', m1: 'K2', m2: 'M2' },
    //   { t: '临时身份证', m1: 'N2', m2: 'O2' },
    // ], [
    //   { t: '本地人数', f: 'slbdCount', totalRow: true },
    //   { t: '异地人数', f: 'slydCount', totalRow: true },
    //   { t: '金额', f: 'slJe', totalRow: true },
    //   { t: '本地人数', f: 'hlbdCount', totalRow: true },
    //   { t: '异地人数', f: 'hlydCount', totalRow: true },
    //   { t: '金额', f: 'hlJe', totalRow: true },
    //   { t: '本地人数', f: 'blbdCount', totalRow: true },
    //   { t: '异地人数', f: 'blydCount', totalRow: true },
    //   { t: '金额', f: 'blJe', totalRow: true },
    //   { t: '本地人数', f: 'xj_bdrs', totalRow: true },
    //   { t: '异地人数', f: 'xj_ydrs', totalRow: true },
    //   { t: '金额', f: 'xj_je', totalRow: true },
    //   { t: '人数', f: 'lsCount', totalRow: true },
    //   { t: '金额', f: 'lsJe', totalRow: true },
    //   { t: '本地人数', f: 'hj_bdrs', totalRow: true },
    //   { t: '异地人数', f: 'hj_ydrs', totalRow: true },
    //   { t: '金额', f: 'hj_je', totalRow: true },
    // ]];
    const headers = [[]];
    params.header.splice(0, 1);
    params.header.forEach(item => {
      const obj = { t: item.title, f: item.dataIndex };
      headers[0].push(obj);
    });
    const excelData = {
      data: [],
    };
    if (!params.data) {
      const reponse = await this.list(tableName, { pageSize: 99999, page: 1, adQuery: [] });
      params.data = reponse.body.rows;
    }
    params.data.forEach(item => {
      delete item.uuid;
      excelData.data.push(item);
    });

    // const headers = [[
    //   { t: 'name', f: 'name' },
    //   { t: 'name_chi', f: 'name_chi' },
    //   { t: 'email', f: 'email' },
    // ]];
    // const dbData = await this.list('user', { pageSize: 5, page: 1 });
    // const excelData = dbData.body.rows;
    await this.excelNew(excelData, headers, '身份证受理统计');
  }

  /**
   * 导出Excel
   *  支持复杂表头（m1:合并单元格左上坐标；m2:合并单元格右下坐标）
   *  支持合计行  totalRowText totalRow
   *  支持数据自定义 func
   *  支持数据字典
   *  支持日期
   * @param {object} excelData 数据
   * @param {Array} headers excel标题栏
   * @param {string} name 文件名称
   */
  async excelNew(excelData, headers, name) {
    const columns = []; // exceljs要求的columns
    const hjRow = {}; // 合计行
    const titleRows = headers.length; // 标题栏行数
    // 处理表头
    for (let i = 0; i < titleRows; i++) {
      const row = headers[i];
      for (let j = 0, rlen = row.length; j < rlen; j++) {
        const col = row[j];
        const { f, t, w = 15 } = col;
        if (!f) continue; // 不存在f则跳过

        if (col.totalRow) hjRow[f] = true;
        if (col.totalRowText) hjRow[f] = col.totalRowText;
        col.style = { alignment: { vertical: 'middle', horizontal: 'center' } };
        col.header = t;
        col.key = f;
        col.width = w;
        columns.push(col);
      }
    }
    // 处理合计行
    if (JSON.stringify(hjRow) !== '{}') {
      const tr = {};
      for (let i = 0, len = excelData.data.length; i < len; i++) {
        const item = excelData.data[i];
        for (const key in item) {
          if (hjRow[key] === true) {
            tr[key] = (tr[key] || 0) + item[key];
            continue;
          }
          tr[key] = hjRow[key] || '';
        }
      }
      excelData.data.push(tr);
    }
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('My Sheet', { views: [{ xSplit: 1, ySplit: 1 }] });
    sheet.columns = columns;
    sheet.addRows(excelData.data);
    // 处理复杂表头
    if (titleRows > 1) {
      for (let i = 1; i < titleRows; i++) {
        sheet.spliceRows(1, 0, []); // 头部插入空行
      }
      for (let i = 0; i < titleRows; i++) {
        const row = headers[i];
        for (let j = 0, rlen = row.length; j < rlen; j++) {
          const col = row[j];
          if (!col.m1) continue;
          sheet.getCell(col.m1).value = col.t;
          sheet.mergeCells(col.m1 + ':' + col.m2);
        }
      }
    }
    // 处理样式、日期、字典项
    const that = this;
    sheet.eachRow(function(row, rowNumber) {
      // 设置行高
      row.height = 25;
      row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
        // 设置边框 黑色 细实线
        const top = { style: 'thin', color: { argb: '000000' } };
        const left = { style: 'thin', color: { argb: '000000' } };
        const bottom = { style: 'thin', color: { argb: '000000' } };
        const right = { style: 'thin', color: { argb: '000000' } };
        cell.border = { top, left, bottom, right };
        // 设置标题部分为粗体
        if (rowNumber <= titleRows) {
          cell.font = { bold: true };
          return;
        }
        // 处理数据项里面的日期和字典
        const { type, dict } = columns[colNumber - 1];
        if (type && (cell.value || cell.value === 0)) return;// 非日期、字典或值为空的直接返回
        if (type === 'date') {
          cell.value = that.parseDate(cell.value);
        } else if (type === 'dict') {
          cell.value = that.parseDict(cell.value.toString(), dict);
        }
      });
    });
    this.ctx.set('Content-Type', 'application/vnd.openxmlformats');
    this.ctx.set('Content-Disposition', 'attachment;filename*=UTF-8' + encodeURIComponent(name) + '.xlsx');
    this.ctx.set('Access-Control-Expose-Headers', 'Content-Disposition');
    this.ctx.body = await workbook.xlsx.writeBuffer();
  }

  // 记录接口日志
  // async writeApiLog() {
  //   console.info('记录接口日志 11111 ***********************************************');
  //   let returnMsg = {};
  //   try {
  //     const log_request = this.ctx.request.body; // 请求参数
  //     const log_response = this.ctx.body; // 响应数据
  //     const url = this.ctx.request.url;
  //     const Literal = this.app.mysql.literals.Literal;
  //     const logData = {
  //       uuid: new Literal('UUID()'),
  //       request_url: url,
  //       request_body: JSON.stringify(log_request),
  //       response_body: JSON.stringify(log_response),
  //     };
  //     const result = await this.app.mysql.insert('sys_api_log', logData);
  //     const drSuccess = result.affectedRows > 0;
  //     if (drSuccess) {
  //       returnMsg = {
  //         msgType: '记录接口日志',
  //         code: '200',
  //       };
  //     }
  //   } catch (error) {
  //     returnMsg = {
  //       msgType: '记录接口日志',
  //       msg: error,
  //       code: '11001',
  //     };
  //   }
  //   return returnMsg;
  // }

  // 记录历史
  async writeLog(tableName, params, hisHandleType) {
    try {
      const prefix = 'ddit_config_';
      const targetTable = [ `${prefix}bdh`, `${prefix}bdzd`, `${prefix}btn`, `${prefix}haierbdzd`,
        `${prefix}haierlbzd`, `${prefix}haiermenu`, `${prefix}jcjy`, `${prefix}jk`, `${prefix}lbzd`,
        `${prefix}menu`, `${prefix}xllb`, `${prefix}ywy`, `${prefix}zdsj` ];
      if (targetTable.indexOf(tableName) > -1) {
        // 操作用户信息
        const user = await this.ctx.service.ddit.user.getUser();
        const hisCreateUser = user ? user.name : 'unknown';
        // 操作表
        const hisTable = tableName + '_his';
        const Literal = this.app.mysql.literals.Literal;
        const commonFields = {
          his_uuid: new Literal('UUID()'),
          his_handle_type: hisHandleType,
          his_create_user: hisCreateUser,
          his_create_time: this.app.mysql.literals.now,
        };
        // 历史记录表新增记录
        if (params instanceof Array) {
          for (const item of params) {
            const logResult = await this.app.mysql.insert(hisTable, {
              ...item,
              ...commonFields,
            });
            if (logResult.affectedRows <= 0) {
              throw '历史记录表新增记录失败，affectedRows <= 0';
            }
          }
        } else {
          const logResult = await this.app.mysql.insert(hisTable, {
            ...params,
            ...commonFields,
          });
          if (logResult.affectedRows <= 0) {
            throw '历史记录表新增记录失败，affectedRows <= 0';
          }
        }
      }
    } catch (error) {
      this.ctx.logger.error(error);
      return;
    }
  }

  // 判断表是否存在
  async tableIsExist(tableObj) {
    // 库名必须跟随 mysql 配置，不能写死：写死旧库名会查到不存在的 schema，
    // 永远判定「表不存在」→ 跳过 DROP → create table 撞上已存在的表 → MySQL 1050
    // （前端最终只看到 E900231「创建表多表执行异常」）
    const dbName = this.app.config.mysql.client.database;
    let tmpSql = 'select count(*) as tablenum from information_schema.tables ';
    tmpSql += `where (table_schema='${dbName}') AND (table_name='${tableObj.table_name_eng}');`;
    const isExcitRes = await this.app.mysql.query(tmpSql);
    const tabbleLength = isExcitRes[0].tablenum;
    if (tabbleLength > 0) {
      return true;
    }
    return false;
  }

  // 创建表 单表
  async createTable(tableObj) {
    // 格式 ================================================== start
    // {table_name_eng: 'user7',
    //  table_name_chi: '用户7',
    //  table_cols: [
    //    { f_name: 'uuid', f_type: 'varchar(40)', f_default_value: '', f_comment: 'UUID', f_not_null: 'Y', f_key: 'p_key'},
    //    { f_name: 'name', f_type: 'varchar(40)', f_default_value: '', f_comment: '姓名'},
    //    { f_name: 'create_time', f_type: 'date', f_default_value: '', f_comment: '录入事件'}
    //  ]};
    // 格式 ================================================== end
    let sql_create_table = '';
    // let primary_key = '';
    const primary_key = [];
    const colLength = tableObj.table_cols.length;
    const table_name_eng = tableObj.table_name_eng;
    const table_name_chi = tableObj.table_name_chi;
    // 删除表
    const msgCreateTable = [];
    try {
      if (await this.tableIsExist(tableObj)) {
        await this.dropTable(tableObj);
        msgCreateTable.push({
          msgType: '删除表',
          msg: `表【${table_name_eng}】，删除成功`,
          table: table_name_eng,
          code: '200',
        });
      }
      // 创建表
      sql_create_table += `create table ${table_name_eng} (`;
      tableObj.table_cols.forEach((col, index) => {
        const isNotNull = tableObj.f_not_null === 'Y' ? 'not null' : '';
        // 主键列绝不能带 DEFAULT NULL：显式可空与主键冲突，MySQL 直接报
        //   ER_PRIMARY_CANT_HAVE_NULL (1171)
        //   All parts of a PRIMARY KEY must be NOT NULL; if you need NULL in a key, use UNIQUE instead
        // 这正是「初始化永远卡在第一张表 sys_user」的真因（实测确认）。
        // 模板里主键列都标了「非空=Y」，本意就是靠 not null 躲开它，但上面的
        //   tableObj.f_not_null 是表级字段、永远取不到值，所以这里再兜一层：主键不写 default。
        const defaultValue = col.f_default_value
          ? `default ${col.f_default_value}`
          : (col.f_key === 'p_key' ? '' : 'default null');
        if (col.f_key === 'p_key') { // 'p_key'
          // primary_key = col.f_name;
          primary_key.push(col.f_name);
        }
        sql_create_table += `${col.f_name} ${col.f_type} ${isNotNull} ${defaultValue} COMMENT "${col.f_comment}" ${index === colLength - 1 ? '' : ','}`;
      });
      sql_create_table += primary_key.length > 0 ? `, primary key (${primary_key.join(',')})` : '';
      sql_create_table += `) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='${table_name_chi || ''}';`;
      await this.app.mysql.query(sql_create_table);
      msgCreateTable.push({
        msgType: '创建表',
        msg: `表【${table_name_eng}】，创建成功`,
        table: table_name_eng,
        code: '200',
      });
    } catch (err) {
      // this.ctx.logger.error(err);
      // msgCreateTable.push({
      //   msgType: '创建表',
      //   msg: e,
      //   table: table_name_eng,
      //   code: '9001',
      // });
      // 把驱动层的真实错误与出错的表名写进 message：
      // 外层 createTables 会再包一层 AppError，而 handleErrorCommon 只回传「一层」cause，
      // 不这样做的话，前端永远只能看到「创建表单表执行异常」这句无信息量的话。
      const detail = `${err.code || err.name || ''} ${err.sqlMessage || err.message || ''}`.trim();
      throw new AppError(`创建表【${table_name_eng}】失败：${detail}`, `createTable: ${err.name}`, 'E900221', err);
    }
    return msgCreateTable;
  }

  // 创建表 多表
  async createTables(tableName) {
    const reMsg = [];
    try {
      for (let i = 0; i < tableName.length; i++) {
        const msg = await this.createTable(tableName[i]);
        reMsg.push(...msg);
      }
      console.info(reMsg);
      this.ctx.logger.info('创建表', [ reMsg ]);
      return {
        code: '200',
        msg: reMsg,
      };
    } catch (err) {
      // this.ctx.logger.error(error);
      // reMsg.push(error);
      // console.info(reMsg);
      // return {
      //   code: '9003',
      //   msg: reMsg,
      // };
      throw new AppError('创建表多表执行异常', `createTables: ${err.name}`, 'E900231', err);
    }
  }

  // 删除表 单表
  async dropTable(tableObj) {
    const msgCreateTable = [];
    try {
      const sql_drop_table = `DROP TABLE ${tableObj.table_name_eng}`;
      await this.app.mysql.query(sql_drop_table);
      msgCreateTable.push({
        msgType: '删除表',
        msg: `表【${tableObj.table_name_eng}】，删除成功`,
        table: tableObj.table_name_eng,
        code: '200',
      });
    } catch (err) {
      throw new AppError('删除表单表执行异常', `createTable: ${err.name}`, 'E900222', err);
    }
    return msgCreateTable;
  }

  // 删除表 多表
  async dropTables(tables) {
    const reMsg = [];
    try {
      for (let i = 0; i < tables.length; i++) {
        const msg = await this.dropTable(tables[i]);
        reMsg.push(...msg);
      }
      console.info(reMsg);
      this.ctx.logger.info('删除表', [ reMsg ]);
      return {
        code: '200',
        msg: reMsg,
      };
    } catch (err) {
      throw new AppError('删除表多表执行异常', `createTables: ${err.name}`, 'E900232', err);
    }
  }

  // 初始化数据
  async initDbData(body) {
    const reMsg = [];
    try {
      // 清空表数据
      console.info('初始化数据 清空表数据 ~~~~~~~~~~~~~~~');
      const aa = await this.clearTableData(body);
      reMsg.push(...aa);
      // 插入表数据
      console.info('初始化数据 插入表数据 ~~~~~~~~~~~~~~~');
      const bb = await this.initDbDataInsert(body);
      console.info('初始化数据 end');
      reMsg.push(...bb);
      // 返回结果
      console.info(reMsg);
      this.ctx.logger.info('初始化数据', [ reMsg ]);
      return {
        code: '200',
        msg: reMsg,
      };
    } catch (err) {
      // console.info(error);
      // this.ctx.logger.error(error);
      // return {
      //   code: '9100',
      //   msg: error,
      // };
      throw new AppError('初始化数据执行异常', `initDbData: ${err.name}`, 'E900211', err);
    }
  }

  // 初始化数据 清空表数据
  async clearTableData(body) {
    const { data } = body;
    const returnMsg = [];
    for (let i = 0; i < data.length; i++) {
      const { table_name_eng, needDelDataKey, exportData } = data[i];
      try {
        const deleteParam = {};
        let result = 0;
        if (needDelDataKey) { // 按键值删除前次导入内容
          // 部分删除
          if (Array.isArray(needDelDataKey)) {
            for (let m = 0; m < exportData.length; m++) {
              for (let n = 0; n < needDelDataKey.length; n++) {
                deleteParam[needDelDataKey[n]] = exportData[m][needDelDataKey[n]];
              }
              // deleteParam[needDelDataKey] = exportData[m][needDelDataKey];
              const resultTmp = await this.app.mysql.delete(table_name_eng, deleteParam);
              result += resultTmp.affectedRows;
            }
          } else {
            for (let m = 0; m < exportData.length; m++) {
              deleteParam[needDelDataKey] = exportData[m][needDelDataKey];
              const resultTmp = await this.app.mysql.delete(table_name_eng, deleteParam);
              result += resultTmp.affectedRows;
            }
          }
        } else {
          // 全部删除
          const resultTmp = await this.app.mysql.delete(table_name_eng, deleteParam);
          result = resultTmp.affectedRows;
        }
        returnMsg.push({
          msgType: '清空数据',
          msg: `表【${table_name_eng}】，成功删除 ${result} 条数据`,
          table: table_name_eng,
          code: '200',
        });
      } catch (err) {
      //   returnMsg.push({
      //     msgType: '清空数据',
      //     msg: error,
      //     table: tableName,
      //     code: '9004',
      //   });
        // 同上：把真实错误与表名拼进 message，穿透两层 AppError 包装。
        const detail = `${err.code || err.name || ''} ${err.sqlMessage || err.message || ''}`.trim();
        throw new AppError(`清空表【${table_name_eng}】失败：${detail}`, `clearTableData: ${err.name}`, 'E900212', err);
      }
    }
    return returnMsg;
  }

  // 初始化数据 插入表数据
  async initDbDataInsert(body) {
    const { data } = body;
    const returnMsg = [];
    for (let i = 0; i < data.length; i++) {
      const { table_name_eng, exportData } = data[i];
      try {
        if (table_name_eng && exportData && exportData.length > 0) {
          const result2 = await this.app.mysql.insert(table_name_eng, exportData);
          const drSuccess = result2.affectedRows > 0;
          if (drSuccess) {
            returnMsg.push({
              msgType: '导入数据',
              msg: `表【${table_name_eng}】， 成功导入 ${exportData.length} 条数据`,
              table: table_name_eng,
              code: '200',
            });
          }
        }
      } catch (err) {
        // returnMsg.push({
        //   msgType: '导入数据',
        //   msg: error,
        //   table: tableName,
        //   code: '9002',
        // });
        // 同 createTable：外层 initDbData 还会再包一层 AppError，而 handleErrorCommon
        // 只回传「一层」cause，不把真实错误拼进 message 就永远只能看到「初始化数据插入表数据执行异常」。
        const detail = `${err.code || err.name || ''} ${err.sqlMessage || err.message || ''}`.trim();
        throw new AppError(`导入数据【${table_name_eng}】失败：${detail}`, `initDbDataInsert: ${err.name}`, 'E900213', err);
      }
    }
    return returnMsg;
  }

  // 权限管理 用户角色设置
  async setUserRole(params) {
    const { userIds, roleIds } = params;
    const sqlParam = {
      user_id: userIds,
    };
    const sqlParam2 = [];
    roleIds.forEach(item => {
      sqlParam2.push({
        uuid: this.ctx.helper.uuid(36),
        user_id: userIds,
        role_id: item,
      });
    });
    // 删除当前用户角色
    const result = await this.app.mysql.delete('sys_user_role_rel', sqlParam);
    // 插入当前用户新角色
    if (roleIds.length > 0) {
      const result2 = await this.app.mysql.insert('sys_user_role_rel', sqlParam2);
    }
    // const drSuccess = result2.affectedRows > 0;
    // if (drSuccess) {
    // await this.writeLog(tableName, finallyData, 'insert');
    return {
      code: '200',
      msg: '用户角色设置成功',
    };
  }

  // 权限管理 角色菜单设置
  async saveRoleMenu(params) {
    const { roleId, menuIds } = params;
    const sqlParam = {
      role_id: roleId,
    };
    const sqlParam2 = [];
    menuIds.forEach(item => {
      sqlParam2.push({
        uuid: this.ctx.helper.uuid(36),
        role_id: roleId,
        menu_id: item,
      });
    });
    // 删除当前角色菜单
    const result = await this.app.mysql.delete('sys_menu_role_rel', sqlParam);
    // 插入当前新角色菜单
    if (menuIds.length > 0) {
      const result2 = await this.app.mysql.insert('sys_menu_role_rel', sqlParam2);
    }
    // const drSuccess = result2.affectedRows > 0;
    // if (drSuccess) {
    // await this.writeLog(tableName, finallyData, 'insert');
    return {
      code: '200',
      msg: '角色菜单设置成功',
    };
  }

  // 获取码表
  async getCodeList(params) {
    const { dictCodeId } = params;
    let codeType = '';
    if (dictCodeId.indexOf('code_dm_') > -1) {
      codeType = dictCodeId.replace('code_dm_', '');
    }
    // 首先获取自定义码表
    const customerCodetableObj = await this.app.mysql.get('sys_customer_codetable', {
      code_manage_key: dictCodeId,
    });
    if (customerCodetableObj && customerCodetableObj.code_manage_id) {
      if (customerCodetableObj.code_sql) {
        const resultCustomerCodetable = await this.app.mysql.query(customerCodetableObj.code_sql);
        if (resultCustomerCodetable && resultCustomerCodetable.length > 0) {
          const results = {
            code: '200',
            body: resultCustomerCodetable,
          };
          return results;
        }
      } else {
        let sqlCustomerCodetable = `select ${customerCodetableObj.code_name_db_property} as ${customerCodetableObj.code_name_web_property}, `;
        sqlCustomerCodetable += `${customerCodetableObj.code_value_db_property}  as ${customerCodetableObj.code_value_web_property}, `;
        sqlCustomerCodetable += `${customerCodetableObj.code_value_db_property_pid}  as pid `;
        sqlCustomerCodetable += `from ${customerCodetableObj.code_manage_table}`;
        const resultCustomerCodetable = await this.app.mysql.query(sqlCustomerCodetable);
        if (resultCustomerCodetable && resultCustomerCodetable.length > 0) {
          const results = {
            code: '200',
            body: resultCustomerCodetable,
          };
          return results;
        }
      }
    }
    // 获取标准码表
    const codeArr = await this.app.mysql.select('sys_codetable', { where: {
      code_type: codeType,
      used_flag: 'Y',
    } });
    const results = {
      code: '200',
      body: codeArr,
    };
    return results;
  }
}

module.exports = BaseService;
