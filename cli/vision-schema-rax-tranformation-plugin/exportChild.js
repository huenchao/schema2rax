const OutPutClass = require('../outPutClass')
const {initDeconstructCode} = require('../importComponent');
const util = require('./util');
const traverse = require('@babel/traverse').default;

module.exports =  {
  create(newNodeBody){
    const outPutClass = OutPutClass.getInstance();
    let exportsNodeMap = outPutClass.exportsNodeMap;
    for (let key in exportsNodeMap){
      let chilerenJsxNodes = exportsNodeMap[key];
      chilerenJsxNodes.map((jsxNode,index)=>{
        let functionNode = this.createFuncitionNode(`${key}Item${chilerenJsxNodes.length>1?index:''}`,jsxNode);
        newNodeBody.push(functionNode);
      })
    }
  },

  /**
   * 创建一个函数节点
   */
  createFuncitionNode (name,jsxNode) {
     let templete = `
        ${name} = (props) => {
          const {key, item, _self, state={},extParam,context} = props;
          const contextProp = context;
          const self = this
          ${initDeconstructCode(true)}
          return (<Root></Root>);
        }
     `

     let ast = util.parseCode(templete);
     traverse(ast, {
      JSXElement(path){
        // 只有Root节点才转换，避免替换节点后重复转
        if (path.node.openingElement.name.name === 'Root'){
          path.replaceWith(jsxNode);
        }
        return ;
      }
    });  
     
     
    return ast.program.body[0];

  }
}