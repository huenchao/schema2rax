
let OutputClass = require('./outPutClass');
const babel = require('@babel/core');
const util = require('./vision-schema-rax-tranformation-plugin/util');
const transformPlugin = require('./vision-schema-rax-tranformation-plugin');
const {importComponent,initDeconstructCode} = require('./importComponent');
const {importUtils} = require('./useUtils');
const prettier = require("prettier");
const fs = require("./flieUtils");
const path = require('path');

function transform () {
    const outPutClass = OutputClass.getInstance();
    importComponent();
    importUtils();
    
    const baseCode = `
    ${outPutClass.importCode}

    const datasourceOpitions = {}

    class Module extends Component {    

        render() {
      
            const contextProp = this;
            const self = this
            return (
            <RootView>
            </RootView>
            );
        }
    }

    Module.moduleRenderMode = 'origin';

    export default Module;

    `;
    baseTempleteCode = baseCode;
    // // 初始化组件模板
    // let baseTempleteCode = execSchemaTransfromScript(outPutClass.importCode,initDeconstructCode());

    // if (!baseTempleteCode){
    //     baseTempleteCode = baseCode;
    // }

    
    const result = babel.transform(baseTempleteCode, {
        plugins: [
            require.resolve('@babel/plugin-syntax-jsx'),
            transformPlugin
        ]
    });
    
    // uinicode 中文转码
    let sourceCode = unescape(result.code.replace(/\\u/gi,'%u'));
    // 特殊符号转化
    sourceCode = sourceCode.replace(/\\xA5/g,'¥');
    let prettierCode = prettier.format(sourceCode, { semi: false, parser: "babel" });
    outPutClass.setSourceCode(prettierCode);
}



function execSchemaTransfromScript (importCode,initDeconstructCode){
    const outputClass = OutputClass.getInstance();
    // 获取模板名
    let templetePath = outputClass.templetePath;
    // 模板下的 parsescript是每个模板的处理脚本
    let templeteScript =  require(`${templetePath}/parsescript`);
    if (typeof(templeteScript.initTempleteCode) == 'function'){
        return templeteScript.initTempleteCode(outputClass,importCode,initDeconstructCode);
    }else{
        return null;
    }


    
}


/**
 * 解构初始化
 */
// function initDeconstructCode (){
//     let outPutClass = OutputClass.getInstance();
//     let componentsTreeObj =  outPutClass.schema.componentsTree[0];
//     let deconstructList = ['item'];
//     let state = componentsTreeObj.state;
//     for (let key in state){
//         deconstructList.push(key);
//     }

//     let datasource = componentsTreeObj.dataSource.list;
//     datasource.map((item)=>{
//         deconstructList.push(item.id);
//     })

//     return `
//     const {${deconstructList.join(',')}} = state;
//     `
// }



module.exports = transform