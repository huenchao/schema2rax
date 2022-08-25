let OutputClass = require('./outPutClass');
const transform = require("./transform");
const path = require('path');
const fs = require("./flieUtils");


class Parser {
    constructor(opts) {

        opts = this.initBuildOtps(opts);
        let schema = opts.input.schema;

        // 先清实例
        OutputClass.deleteInstance();
        opts.input.schema.pages = [{
            
        }]
        OutputClass.getInstance({
            schema,
            oldSchema:opts.input.schema,
            templeteName:opts.templeteName,
            templetePath:opts.templetePath,
            componentName:opts.componentName,
            componentLogo:opts.componentLogo,
            user:opts.user,
            description:opts.description,
            pkg:schema.componentsMap,
            version:opts.version,
            extParams:opts.extParams,
            device:opts.device,
            buildPath:opts.buildPath || path.join(__dirname,'../build'),
            buildIndexPath:opts.buildIndexPath || '/src/index.js',
            buildDemoIndexPath:opts.buildDemoIndexPath || '/demo/index.js'
        });


        // 执行插件转化schema
        let newSchema = opts.input.schema;
        OutputClass.getInstance().setSchema(newSchema);
    }

    initBuildOtps(opts){
        // 模板下的 parsescript是每个模板的处理脚本
        let templeteScript =  require(`${opts.templetePath}/parsescript`);
        if (typeof(templeteScript.getBuildOpts) === 'function'){
            return {
                ...opts,
                ...(templeteScript.getBuildOpts())
            }
        }

        return opts;
    }

  
    parse() {
        transform();
    }
  }


/**
 * 将源码写入到文件中
 * @param {*} params 
 */
async function  wirteFiles() {
    const outputClass = OutputClass.getInstance();
    let buildPath = outputClass.buildPath;
    let buildIndexPath = outputClass.buildIndexPath;
    let templetePath = outputClass.templetePath;
    // console.log('templetePath----',templetePath);
    let pkgJsonPath = path.join(outputClass.templetePath,'/package.json');
    let abcJsonPath = path.join(outputClass.templetePath,'/abc.json');
    console.log(' =========fs copy1 =======')
    // 复制模板
    // console.log('templetePath',templetePath)
    // console.log('buildPath',buildPath)
    await fs.copy(templetePath,buildPath);
    console.log(' =========fs copy2 =======')

    // 将源码写入index文件
    // console.log('path.join(buildPath,buildIndexPath)',path.join(buildPath,buildIndexPath))
    // console.log('outputClass.sourceCode',outputClass.sourceCode)
    await fs.writeFile(path.join(buildPath,buildIndexPath),outputClass.sourceCode);

    // 判断是否有css
    if (outputClass.schema && outputClass.schema.componentsTree && outputClass.schema.componentsTree[0].css){
        let cssPath = buildIndexPath.split('.')[0]+'.css';
        // 写入pkgjson 文件
        await fs.writeFile(path.join(buildPath,cssPath), outputClass.schema.componentsTree[0].css);
    }
    
    let pkgData = await fs.readFile(pkgJsonPath);
    let dataString = pkgData.toString();
    let dataJson = JSON.parse(dataString);


    const {dependencies} = dataJson;

    outputClass.schema.componentsMap.map((item)=>{
        dependencies[item.npmName || item.package] = item.version
    })


    console.log('outputClass.schema.utils------');

    // 将utils添加到dependencies

    outputClass.schema.utils && outputClass.schema.utils.map((item)=>{
        if(/^(t)?npm$/.test(item.type)){
            const content = item.content;
            dependencies[content.npmName || content.package] = content.version || "0.x.x";

        }

    });




    // 开发者
    dataJson.author = {
        name:outputClass.user,
        email:`${outputClass.user}@alibaba-inc.com`
    }
    dataJson.name = `@ali/cmod-${outputClass.componentName}`;
    dataJson.description = outputClass.description;
    dataJson.version = outputClass.version;

    if (dataJson.repository){
        dataJson.repository.url = `git@gitlab.alibaba-inc.com:cmod/${outputClass.componentName}.git`
    }
    
    // 写入pkgjson 文件
    await fs.writeFile(path.join(buildPath,'/package.json'), fs.prettierJSON(dataJson));

    let abcData = await fs.readFile(abcJsonPath);
    dataString = abcData.toString();
    dataJson = JSON.parse(dataString);
    dataJson.author = outputClass.user;
    dataJson.name = `${outputClass.componentName}`;

    // 写入abc 文件
    await fs.writeFile(path.join(buildPath,'/abc.json'), fs.prettierJSON(dataJson));

    const buildJson = require(path.join(buildPath,'/build.json'));
    buildJson.devServer.https = true;
    await fs.writeFile(path.join(buildPath,'/build.json'), fs.prettierJSON(buildJson));

    // 删除parsescript.js文件
    await fs.delFile(path.join(buildPath,'/parsescript.js'));

    // 将schema进行备份
    await fs.writeFile(path.join(buildPath,'/lowcodeSchema.json'), fs.prettierJSON(outputClass.oldSchema));




    console.log(' =========wirteFiles end =======')
}

/**
 * 执行模板脚本
 */
async function execTempleteScript (){
    const outputClass = OutputClass.getInstance();
    // 获取模板名
    let templetePath = outputClass.templetePath;
    // 模板下的 parsescript是每个模板的处理脚本
    let templeteScript =  require(`${templetePath}/parsescript`);

    if (templeteScript.exec){
        await templeteScript.exec(outputClass,fs);
    }

    

}

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
    let jdataId = null;
    let id = null;

    const cg = outputClass.schema['config'];
    if(cg){
        if(cg.jdata) {
            jdataId = cg.jdata.jdataId;
            if(cg.jdata.schemaId){
                dataJson.schema.id = cg.jdata.schemaId;
                dataJson.schema.type = 'jdata'
            }
        }
        if(cg.cup) {
            dataJson.schema.id = cg.cup.id
            dataJson.schema.type = 'cupid'
        }
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


async function build (opts){
    const parser = new Parser ({
        file: null,
        ...opts
        
    });

    parser.parse();

    await wirteFiles();
    
    await exec(OutputClass.getInstance(),fs);

}


module.exports = {
    build,
};