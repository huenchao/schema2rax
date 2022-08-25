const visitjsx = require('./visitjsx');
const visitor = require('./visitor');
const declare = require('@babel/helper-plugin-utils').declare;

module.exports = declare(function () {
  return {
    visitor: Object.assign({},visitor, visitjsx),
  }
})