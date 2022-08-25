const OutPutClass = require('../outPutClass')
const util = require('./util');
const t = require('babel-types');
const traverse = require('@babel/traverse').default;
module.exports =  {
  create(){
    const outPutClass = OutPutClass.getInstance();
    let defaultState =  JSON.stringify(outPutClass.schema.componentsTree[0].state || {});
  //   if(defaultState.jdata){
  //     delete defaultState.jdata;
  //   }
  //  const a =  'var a = '+ JSON.stringify(defaultState);
  //  let lasteindex = a.lastIndexOf("}");
  //  let _defaultState;
  //  if(Object.keys(defaultState).length){
  //   _defaultState = a.substr(0,lasteindex) + ',jdata:window.jdata || this.props' + a.substr(lasteindex);
  //  }else{
  //   _defaultState = a.substr(0,lasteindex) + 'jdata:window.jdata || this.props' + a.substr(lasteindex);
  //  }
    // jdata/cup只能取其一，优先cup
    let _defaultState = ('var a =' + defaultState).replace(/(window\._jdata\.data)/ig, 'window.jdata || this.props')
    if(defaultState.indexOf('_cup') != -1) {
      _defaultState = ('var a =' + defaultState).replace(/(window\._cup\.data)/ig, 'window.jdata || this.props')
    }
  
    let ast = util.parseCode(_defaultState);
    traverse(ast, {
      ObjectProperty(path){
        if (t.isObjectExpression(path.node.value)){
          let properties = path.node.value.properties;
          let jsexpFlag = false;
          properties && properties.map((item) => {
            if (item.value.value === 'JSExpression'){
              jsexpFlag = true;
            }
          })

          let expression;

          jsexpFlag && properties.map((item) => {
            if (item.key.value === 'value'){
               // 表达式转化
              let astNode = util.parseCode(item.value.value);
              let program = astNode.program;
              if (program.body && program.body.length>0){
                expression =  program.body[0].expression;
              }else{
                expression =  t.stringLiteral(item.value.value);
              }
            }
          })

          if (expression){
            path.node.value = expression;
          }
           
        }


      
      }
    })
    let objectExpression = ast.program.body[0].declarations[0].init;
    return t.ClassProperty(t.Identifier('state'),objectExpression);
  }
}