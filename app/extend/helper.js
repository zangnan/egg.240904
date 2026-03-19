const moment = require('moment');
const dayjs = require('dayjs');

exports.relativeTime = time => moment(new Date(time * 1000)).fromNow();

let formatCamelNaming = (str) => {
  if (str) {
    let arr = str.split('_');
    for (let i = 1; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
    }
    return arr.join('');
  }
  return str;
}

/**
 * @method formatDate
 * @desc 将日期格式化成指定格式的字符串
 */
let formatDate = (date, format) => {
  if (date) {
    if (date?.constructor === String) {
      return dayjs(new Date(Number(date))).format(format);
    } else {
      return dayjs(new Date(date)).format(format);
    }
  }
  return '';
};
exports.formatDate = formatDate;

// 转驼峰方法
exports.formatCamelNaming = formatCamelNaming;

// 转驼峰方法
exports.formatObjCamelNaming = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach(key => {
    newObj[formatCamelNaming(key)] = obj[key];
  });
  return newObj;
};

exports.uuid = (len, radix) => {
  let chars, i, r, uuid;
  chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  uuid = [];
  i = void 0;
  radix = radix || chars.length;
  if (len) {
    i = 0;
    while (i < len) {
      uuid[i] = chars[0 | Math.random() * radix];
      i++;
    }
  } else {
    r = void 0;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    i = 0;
    while (i < 36) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[i === 19 ? r & 0x3 | 0x8 : r];
      }
      i++;
    }
  }
  return uuid.join('');
};
