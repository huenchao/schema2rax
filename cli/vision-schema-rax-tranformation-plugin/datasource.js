const OutPutClass = require('../outPutClass')
const util = require('./util');
const t = require('babel-types');
const traverse = require('@babel/traverse').default;
const nameMap = require('./nameMap');
module.exports =  {
   initDataourceOpts(astPath){
    const outPutClass = OutPutClass.getInstance();
    let datasource =  outPutClass.schema.componentsTree[0].dataSource;

    // 处理datasource
    if (astPath.node.id.name === 'datasourceOpitions' && astPath.node.init.properties.length == 0 && datasource){
      let code = `datasourceOpitions = ${JSON.stringify(datasource)}`
      let ast = util.parseCode(code);
      traverse(ast, {
        ObjectProperty(path){
          if (nameMap.datasourceHooks.indexOf(path.node.key.value)>=0){
            // 将dataHandler 转化成一个箭头函数
            path.traverse({
              ObjectProperty(nodePath){
                if (nodePath.node.key.value === 'value'){
                  // 获取函数字符串
                  let functionCode = (nodePath.node.value.value);
                  let handleAst = util.parseFunction(functionCode);
                  let params = handleAst.program.body[0].params;
                  let blockStatement = handleAst.program.body[0].body;
                  // 创建一个匿名函数
                  let fun = t.FunctionExpression(null,params,blockStatement);
                  path.get('value').replaceWith(fun);
                  // 添加到主节点中
                  astPath.replaceWith(ast.program.body[0]);
                  return;
                }
              }
            })
          }
          return;
        }
      });
    }
  },

  // init(){
  //   return util.createClassMethod('function(){this.init();this.initDataSource();}','componentWillMount');
  // }
}