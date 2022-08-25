let OutPutClass = require('./outPutClass');
const declare = require('@babel/helper-plugin-utils').declare;
const t = require("babel-types");
/**
 * 是否存在解构
 * @param {*} importItem 
 */
function destructuring (content){
    const outPutClass  = OutPutClass.getInstance();
    outPutClass.utilsComponentList.push(content.exportName || content.componentName);
    if (content.destructuring){
        return `{${content.exportName}}`;
    }else{
        return content.componentName;
    }
}

/**
 * 是否存在子名称
 * @param {} importItem 
 */
function subName (importItem){
    if (importItem.subName){
        return `const ${importItem.componentName} = ${importItem.exportName}.${importItem.subName}; \n`
    }

    return '';
}


function pkgPath(item){
    if(item.main && !/^(\/)?index.js$/.test(item.main)){
        return `${item.npmName || item.package}${item.main}`
    }

     return `${item.npmName || item.package}`
}


// 处理import的代码
function importUtils (){
    const outPutClass  = OutPutClass.getInstance();
    // 获取componentsMap
    const utilsList = outPutClass.schema.utils;

    let outStrList = [];
    utilsList && utilsList.map((item)=>{
        if(/^(t)?npm$/.test(item.type)){
            const content = item.content;
            let destructuringString = destructuring(content);
            let outString =`import ${destructuringString} from '${pkgPath(content)}';`;
            outStrList.push(outString);
        }

    })
    
    outPutClass.setImportCode(outPutClass.importCode+outStrList.join(''))
}

/**
 * 解构初始化
 */
function initUtilsCode (){
    let outPutClass = OutPutClass.getInstance();

    const utilsList = outPutClass.schema.utils;

    let bodyStringList = [];
    utilsList && utilsList.map((item)=>{
       
        if(/^(t)?npm$/.test(item.type)){
            bodyStringList.push( item.name+':'+(item.content.componentName || item.content.exportName)+',\n');
        }else{
           const basecode = `
             var a = {
                ${item.name}: ${item.content.value}
             };
           `
           const arrowFunc =  require("@babel/core").transformSync(basecode, {
                plugins: [declare(function () {
                    return {
                      visitor: {
                        ObjectProperty(nodePath){
                            let functionCode = (nodePath.node.value.value);
                            let handleAst = util.parseFunction(functionCode);
                            let params = handleAst.program.body[0].params;
                            let blockStatement = handleAst.program.body[0].body;
                            // 创建一个匿名函数
                            let fun = t.ArrowFunctionExpression(params,blockStatement);
                            path.get('value').replaceWith(fun);
                            // 添加到主节点中
                            astPath.replaceWith(ast.program.body[0]);
                            t.arrowFunctionExpression
                            //   console.log('path',path)
                          }
                      }
                    }
                  })],
            });
            // console.log("arrowFunc.code==>",arrowFunc.code)
            
            // bodyStringList.push( item.name+':'+(arrowFunc.)+',\n')
        }
    })

    return `this.utils = {
        ${bodyStringList.join('')}
    }`
}



module.exports = {importUtils,initUtilsCode}