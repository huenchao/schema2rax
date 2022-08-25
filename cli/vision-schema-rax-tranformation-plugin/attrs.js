const t = require('babel-types');
const util = require('./util');
module.exports = {
  createPropsAttrs (name, value){
    let attribute;
    let type = typeof(value);

    if (value.type === 'JSExpression' || value.type === 'JSFunction'){
       //  js表达式属性
       attribute = createJsExpressionAttribute(name,value.value);
    }else{
      switch (type) {
        case 'string':
            attribute = t.JSXExpressionContainer(t.stringLiteral(value || ''));
            break;
        case 'number':
            attribute = t.JSXExpressionContainer(t.numericLiteral(value));
            break;
        case 'boolean':
            attribute = t.JSXExpressionContainer(t.booleanLiteral(value));
            break;
        case 'object':
            attribute = t.JSXExpressionContainer(util.createObjectExpression(value));
            break;
        }
    }

  
    return t.JSXAttribute(t.JSXIdentifier(name),attribute);
  }
}

/**
 * 创建js表达式属性
 * @param {} value 
 */
function createJsExpressionAttribute(name,code){
    // 判断是否是函数
    if (util.isFunction(code)){
      // 函数this-->self
      code = util.parseThisToSelf(code)
      // 函数转化
      let ast = util.parseFunction(code,name);
      // 获取入参
      let params = ast.program.body[0].params;
      let blockStatement = ast.program.body[0].body;
      return t.JSXExpressionContainer(t.FunctionExpression(null,params,blockStatement));
      // return t.JSXExpressionContainer(t.ArrowFunctionExpression(params,blockStatement));
    }else{
      // console.log('attrs:'+code);
      // 表达式转化
      let ast = util.parseCode(code);
      let program = ast.program;
      if (program.body && program.body.length>0){
        return t.JSXExpressionContainer(program.body[0].expression);
      }else{
        return t.JSXExpressionContainer(t.stringLiteral(code));
      }
    }
}

