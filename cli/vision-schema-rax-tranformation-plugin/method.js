const t = require('babel-types');
const util = require('./util');
module.exports = {
  createMethodAst (value,name,isStatic){
     if (name != '__initMethod__'){

      if (!isStatic){
        return util.createClassMethod(value,name);
      }else{
        return util.createStaticClassMethod(value,name);
      } 
     }else{
       return createInitMethod(value);
     }

  }
}


function createInitMethod(value) {
  let initMethodFunCode = 
  `__initMethod__ = (exports) => {
      ${value}
  }`

  let ast = util.parseCode(initMethodFunCode);
  
  return ast.program.body[0];
}



