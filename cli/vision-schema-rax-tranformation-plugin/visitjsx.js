const createJsxNodes = require('./jsxNode').createJsxNodes
const OutPutClass = require('../outPutClass');
const exportChild = require("./exportChild");
module.exports = {
  JSXOpeningElement(astPath){
      const openTag = astPath.node.name;
      if (openTag.name == 'RootView'){
        let jsxNode =  createJsxNodes();
        astPath.parentPath.replaceWith(jsxNode);
        // astPath.findParent((path)=>{
        //   if (path.isProgram()){
        //     let bodyNodes = path.node.body;
        //     exportChild.create(bodyNodes);
        //     return;
        //   }
        // })
      }
  }
};