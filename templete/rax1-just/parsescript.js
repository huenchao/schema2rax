const path = require('path');

async function exec(outputClass,fs) {
    let demoIndexPath =  path.join(outputClass.templetePath,outputClass.buildDemoIndexPath);
    let buildPath = outputClass.buildPath;
    let ocmsJsonPath = path.join(outputClass.templetePath,'/ocms.json');
    let ocmsData = await fs.readFile(ocmsJsonPath);
    dataString = ocmsData.toString();
    dataJson = JSON.parse(dataString);
    dataJson.logo = outputClass.componentLogo;
    dataJson.name = outputClass.description;
    dataJson.origin = 'udpl';
    dataJson.orignUrl = `https://kiwi.alibaba-inc.com/designerV3?componentId=${outputClass.extParams.id}&veType=mobile`


    // 获取jdataId和jdataSchemaId
    let jdataId,jdataSchemaId;
    // console.log('datasource:======>')

    let dataSource = [];

    if (outputClass.oldSchema.pages[0].dataSource && outputClass.oldSchema.pages[0].dataSource.online){
        dataSource = outputClass.oldSchema.pages[0].dataSource.online
    }

    dataSource.map((item)=>{
        if (item.name == 'jdata'){
            if (item.initialData && item.initialData.jdataId){
                jdataId = item.initialData.jdataId;
            }
            jdataSchemaId = item.schemaId;
        }
    })

    if (jdataSchemaId){
        dataJson.schema.id = jdataSchemaId;
    }

    await fs.writeFile(path.join(buildPath,'/ocms.json'), fs.prettierJSON(dataJson));

    if (jdataId){
        // 处理demo文件
        let demoData = await fs.readFile(demoIndexPath);
        dataString = demoData.toString();
        dataString = dataString.replace('0/** jdataId **/',jdataId);
        await fs.writeFile(path.join(buildPath,outputClass.buildDemoIndexPath), dataString);
    }

}

function initTempleteCode (outputClass,importCode,initDeconstructCode){
    return  `
        ${importCode}

        const datasourceOpitions = {};

        class Module extends Component {

            render() {
                const {state} = this;
                const context = this;
                const contextProp = this.filterContext(context);
                ${initDeconstructCode}
                return (
                <RootView>
                </RootView>
                );
            }
        }

        Module.moduleRenderMode = 'origin';

        export default Module;
    `
}


// 用来在转码之前转化Schema，添加一些业务逻辑
function transfromSchema (oldSchema,schema,outputClass){
    console.log('======= parseSchema ========');
    // console.log(outputClass.extParams);
    let componentsTree = schema.componentsTree;
    let componentsMap = schema.componentsMap;
    componentsMap.map((item)=>{
        if (item.package == 'rax'){
            item.package = '@ali/rox';
            item.version = '0.x.x';
        }
    })
    let page = componentsTree[0];

    // 增加一个jdata初始化函数
    page.state.jdata = {
        type: "JSExpression",
        value: "this._initJdata()"
    }


    page.lifeCycles.willMount = {
        type: "JSExpression",
        value: `function(){
          this.init();
          let jdata = this.state.jdata;
          this._setJdataValue(jdata);
          this.setState({
            jdata
          })
          this.initDataSource();
          this.willMount();
        }`
    }




    // 增加一个默认函数,将props数据存放在jdata里面
    page.methods._initJdata = {
        type: "JSExpression",
        value:`function(){
            let jdata = Object.assign({}, this.props);
            if (location.port == "") {
                jdata.jdataId = jdata.moduleId
            };

            return jdata;
        };`
    }

    let oldPage = oldSchema.pages[0];
    // 检查有没有jdata的处理函数
    let jdataFlag = false;
    if (oldPage.dataSource && oldPage.dataSource.online){
        oldPage.dataSource.online.map((item)=>{
            if (item.name == 'jdata'){
                // 判断有没有写jdata回调函数
                if (item.didFetch){
                    let funString = item.didFetch.source;
                    jdataFlag = true;
                    page.methods['_setJdataValue'] = {
                        "type": "JSExpression",
                        "value":funString.split('didFetch')[0]+funString.split('didFetch')[1]
                    }
                }
            }
        })
    }


    if (!jdataFlag){
      // 添加一个默认的
      page.methods['_setJdataValue'] = {
        "type": "JSExpression",
        "value":'function(){}'
      }
    }

    return schema;
}



module.exports = {
    exec,
    transfromSchema,
    initTempleteCode
};
