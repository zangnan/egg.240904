'use strict';

const Service = require('egg').Service;
const fs = require('fs');
const os = require('os');
const path = require('path');
const tmp = require('tmp');
const sendToWormhole = require('stream-wormhole');

class ExampleService extends Service {

  // 获取登录用户token
  async getToken(params) {
    const { app } = this;
    // 判断用户名密码
    // console.info('params 判断用户名密码 =======================');
    // console.info(params);
    const result = await this.app.mysql.get('sys_user', {
      user_name: params.username,
      password: params.password,
      used_flag: 'Y',
    });
    // console.info('result ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    // console.info(result);
    // console.info(result.status);
    // this.checkSuccess(result);
    if (result) {
      // 生成token
      const token = app.jwt.sign({
        ...params,
      }, app.config.jwt.secret, {
        expiresIn: 60000,
      });
      return {
        code: '200',
        body: {
          token,
        },
      };
    }
    // if (result && result.status === '0') {
    //   return {
    //     status: 'user_status_error',
    //   };
    // }
    return {
      status: 'error',
    };
  }

  // 通过token获取登录用户信息
  async getUser() {
    // console.info('token get user ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    const { ctx, app } = this;
    // if (!ctx.app.config.authorization.enable) {
    //   return null;
    // }
    const token = ctx.request.header.accesstoken;// accessToken

    // console.info('token');
    // console.info(token);
    const decode = ctx.app.jwt.verify(token, app.options.secret);
    // console.info(decode);
    const user = await this.app.mysql.get('sys_user', {
      user_name: decode.username,
    });
    const userId = user.user_id;
    const menuInfo = await this.app.mysql.query(`select m.* from sys_menu m where m.menu_id in (select mrr.menu_id from sys_menu_role_rel mrr where mrr.role_id in (select urr.role_id from sys_user_role_rel urr where urr.user_id = '${userId}'))`);
    user.menuInfo = menuInfo;
    // console.info('user~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    // console.info(user);
    // console.info(this.ctx.helper.formatCamelNaming('abc_adf'));
    // this.ctx.helper.formatObjCamelNaming('abc_adf');
    // console.info('user~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    // console.info(this.ctx.helper.formatObjCamelNaming(user));
    const result = {
      code: '200',
      body: {
        ...this.ctx.helper.formatObjCamelNaming(user),
        // currentAuthority: 'admin',
        // access: 'admin',
      },
    };
    // // this.checkSuccess(result);
    return result;
  }

  // 设置用户信息
  async setting() {
    const { app, ctx } = this;
    const parts = ctx.multipart(); // 可修改默认参数
    let part;
    let tmpFile;
    const user = {};
    // console.info('设置用户信息');
    // console.info(parts);
    while ((part = await parts()) != null) {
      if (part.length) {
        user[part[0]] = part[1];
      } else {
        if (!part.filename) {
          await sendToWormhole(part); // ？？？
          continue;
        }
        // console.log('field: ' + part.fieldname);
        // console.log('filename: ' + part.filename);
        // console.log('encoding: ' + part.encoding);
        // console.log('mime: ' + part.mime);
        const postfix = part.filename.substring(part.filename.lastIndexOf('.'));
        const tmpUpladPath = '/eggjs';
        this.mkdirsSync(os.tmpdir() + tmpUpladPath);
        tmpFile = tmp.fileSync({
          prefix: 'eggjs-upload-',
          postfix,
          dir: os.tmpdir() + tmpUpladPath,
        });
        const ws = fs.createWriteStream(null, { fd: tmpFile.fd });
        part.pipe(ws);
      }
    }

    // fs.readFile(tmpFile.name, function(err, data) {
    //   if (err) {
    //     throw err;
    //   } else {
    //     console.log('isBuffer: ' + Buffer.isBuffer(data));
    //     console.log(data.length / 1024 + ' kb');
    //   }
    // });

    if (tmpFile && tmpFile.name) {
      const data = fs.readFileSync(tmpFile.name);
      if (data) {
        user.avatar = data;
      }
    }
    const callbackresult = await app.mysql.update('user', user, {
      where: {
        uuid: user.uuid,
      },
    });
    const editSuccess = callbackresult.affectedRows === 1;
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

  // 获取用户头像
  async getAvatarBlob() {
    const { ctx, app } = this;
    const token = ctx.request.header.accesstoken;
    if (!token) {
      return null;
    }
    if (!ctx.app.config.authorization.enable) {
      return null;
    }
    const decode = ctx.app.jwt.verify(token, app.options.secret);
    if (!decode) {
      return null;
    }
    // const result = await this.app.mysql.get('user', { name: decode.username });
    const result = await this.app.mysql.get('user', { name: decode.loginUserName });
    if (result && result.avatar) {
      return result.avatar;
    }
    return null;
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
}

module.exports = ExampleService;
