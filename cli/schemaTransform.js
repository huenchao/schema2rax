//const SchemaFilter = require('@ali/universal-udpl-schema-filter');
const { copy } = require('./flieUtils');
let nameMap;
function schemaTransform(oldSchema,elementList,opts = {}) {   
  let templetePath = opts.templetePath;
  // 模板下的 parsescript是每个模板的处理脚本
  let templeteScript =  require(`${templetePath}/parsescript`);


  if (typeof(templeteScript.nameMaps) === 'function'){
    const orginNameMap = require('./vision-schema-rax-tranformation-plugin/nameMap');
    nameMap = Object.assign(orginNameMap,templeteScript.nameMaps())
  }else{
    nameMap = require('./vision-schema-rax-tranformation-plugin/nameMap');
  }

  // let copyOldSchema = JSON.parse(JSON.stringify(oldSchema));
  // // 判断是否有pages节点
  // // if (!copyOldSchema.pages){
  // //   copyOldSchema.pages = [{'componentsTree':copyOldSchema.componentsTree,'componentsMap':copyOldSchema.componentsMap}];
  // // }
  // // let page = copyOldSchema.pages[0];
  // // page = SchemaFilter(page,null,{remainSource:true,remainPx:opts.device == 'pc'?true:false});
  // page = copyOldSchema;
  // let rootNode = {
  //   componentName: "Root",
  //   fileName: "block-1",
  //   state:{},
  //   lifeCycles: {
  //     willMount: {
  //       type: "JSExpression",
  //       value: "function(){ this.init();this.initDataSource();this.willMount(); }"
  //     },

  //     didMount: {
  //       type: "JSExpression",
  //       value: "function(){ this.didMount(); }"
  //     }
  //   },

  //   methods: {       
  //     initDataSource:{
  //       type: "JSExpression",
  //       value: "function(){this.datasource = new Datasource(datasourceOpitions,this);this.datasource.init();this.dataSourceMap = this.datasource.getDataSourceMap();}"
  //     }        
  //   },

  //   dataSource: {
  //     list: []
  //   },

  //   children: []
  // };


  // // 判断插件是否有rootNode
  // if (typeof(templeteScript.getRootNode) === 'function'){
  //   rootNode = templeteScript.getRootNode();
  // }



  // let childrenNodes;

  //   // 获取原schema root下的节点
  // if (page.layout){
  //   childrenNodes = page.layout.children;
  // }else if (page.componentsTree && page.componentsTree.length>0){
  //   childrenNodes = page.componentsTree[0].children;
  // }else{
  //   console.error('schema结构有误,必须包含componentsTree节点或者layout节点')
  //   return;
  // }

  // rootNode.children = childrenNodes;
  // if (page.componentsTree[0].state){
  //   rootNode.state = page.componentsTree[0].state;
  // }

  // if (page.componentsTree[0].css){
  //   rootNode.css = page.componentsTree[0].css;
  // }


  // addLifeCycles(page,rootNode);
  // addDatasource(page,rootNode);
  // addStateData(page,rootNode);
  

  // addInitMethods(copyOldSchema.actions,rootNode);

  // // 新增自定义函数
  // page.componentsTree[0].methods && addMethods(page.componentsTree[0].methods,rootNode);
  // // 用来记录依赖的元件
  // let depsMap = {};
  // // 默认追加RootNode的依赖
  // depsMap[page.componentsTree[0].componentName] = 1;
  // // 循环遍历节点
  // rootNode = _walkNodes(rootNode,{depsMap:depsMap});


  // const componentsMap = getComponentsMap(depsMap,elementList,page);
  
  // let newSchema = {
	// "version": "1.0.0",      
	// "componentsMap": componentsMap,
	// "componentsTree":[
        
  //   ],
  // "utils":copyOldSchema.utils
  // }

  // newSchema.componentsTree.push(rootNode);

  // console.log('====== common schemaTransform  ======')
  // console.log(JSON.stringify(newSchema));


  
  return oldSchema;
}

/**
 * 遍历节点
 * @param {*} params 
 */
function _walkNodes(node,opts,parent) {
    if (node.children && node.children.length>0){
       node.children.map((item)=>{
          _walkNodes(item,opts,node);
       })
    }

    transformNode(node,opts,parent);
    return node;
}

function getComponentsMap(depsMap,elementList,page) {
    let componentsMap = page.componentsMap || [];
    // 注入公共数据源
    componentsMap.push({
      componentName:'createElement, Component',
      package:'@ali/rox',
      version:'0.x.x',
      destructuring:true
    });

    componentsMap.push({
      componentName:'Datasource',
      package:'@ali/rox-udpl-datasource-standard',
      version:'0.x.x',
      exportName:'Datasource'
    })

    // componentsMap.push({
    //   componentName:'Utils',
    //   package:'@ali/rox-udpl-utils',
    //   version:'0.x.x',
    //   exportName:'Utils'
    // })

    for (let key in depsMap){
        elementList.map((element)=>{
            if (element.name == key){

                let componentName,package;
                if (element.name.indexOf('|')>=0){
                  componentName = element.name.split('|')[0];
                  package = element.name.split('|')[1]
                }else{
                  componentName = element.name;
                  package = element.packageName;
                }


                componentsMap.push({
                    componentName:componentName,
                    package:package,
                    version:element.version,
                    exportName:componentName
                })
            }
        })
    }

    // 判断是否有第三方组件
    if (page.dependencies && page.dependencies.length>0){
      page.dependencies.map((item)=>{

        let param = {
          componentName:item.name,
          package:item.packageName,
          version:item.version,
          destructuring:item.destructuring
        }

        if (item.subName == '*'){
          param.exportName = '*'
        }else {
          param.componentName = item.subName || item.name;
        }

        if (!param.exportName){
          param.exportName = param.componentName
        }
        

        componentsMap.push(param);

      })
    }

    return componentsMap;

}


function addStateData (page,rootNode){
  let dataSource = page.dataSource 
  // 将变量数据源属性初始化到state里面
  dataSource && dataSource.offline && dataSource.offline.map((item)=>{
     if (item.protocal == 'VALUE'){
      rootNode.state[item.name] = item.initialData;
     }
  })
}


function addDatasource(page,rootNode) {
    let dataSource = page.dataSource 
    
    let dataSourceList = [];

    dataSource && dataSource.offline && dataSource.offline.map((item)=>{

        if (item.protocal == 'REMOTE'){
            let dataSourceItem = {
                id:item.name,
                isInit: item.loadType == 'ASYNC',
                type: "mtop",  
                options: {                             
                  "uri": item.api,                  
                  "params": {
                  },               
                  "method": "GET",             
                  "isCors": true,    
                  "version": item.version || '1.0',     
                  "timeout": 5000,             
                  "headers": {}               
                  },
            }

            let params = item.params;
            params.map((paramItem)=>{
                dataSourceItem.options.params[paramItem.name] = paramItem.value;
            })

            let funString = item.didFetch.source;

            dataSourceItem.options.dataHandler = {
                type:'JSExpression',
                value:funString.split('didFetch')[0]+funString.split('didFetch')[1]
            }

            // 是否有willFetch
            if (item.willFetch){
              funString = item.willFetch.source;
              dataSourceItem.options.willFetch = {
                type:'JSExpression',
                value:funString.split('willFetch')[0]+funString.split('willFetch')[1]
              }
            }

            dataSourceList.push(dataSourceItem);
        } else if (item.protocal === 'HTTP') {
          let dataSourceItem = {
            id:item.name,
            isInit: item.loadType == 'ASYNC',
            type: "HTTP",  
            options: {                             
              "uri": item.api,                  
              "params": {
              },               
              "method": "GET",             
              "isCors": true,             
              "timeout": 5000,             
              "headers": {}               
              },
          }

          let params = item.params;
          params.map((paramItem)=>{
              dataSourceItem.options.params[paramItem.name] = paramItem.value;
          })

          let funString = item.didFetch.source;

          dataSourceItem.options.dataHandler = {
              type:'JSExpression',
              value:funString.split('didFetch')[0]+funString.split('didFetch')[1]
          }

          dataSourceList.push(dataSourceItem);
        }
    })

    rootNode.dataSource.list = dataSourceList;
}




/**
 * 创建初始化函数
 * @param {*} actions 
 * @param {*} rootNode 
 */
function addInitMethods(actions,rootNode) {
    if (actions){
      rootNode.methods.__initMethod__ = {
        "type": "JSExpression",
        "value":actions.module.compiled
      }    
    }else{
      rootNode.methods.__initMethod__ = {
        "type": "JSExpression",
        "value":''
      }
    }

}

/**
 * 覆盖生命周期函数
 * @param {*} page 
 * @param {*} rootNode 
 */
function addLifeCycles(page,rootNode){
  let pageData = page.componentsTree[0]
  if (pageData.lifeCycles){
    if (pageData.lifeCycles.componentDidMount){
      rootNode.lifeCycles.didMount = pageData.lifeCycles.componentDidMount
    }

  }
}


function addMethods(methods,rootNode){

  rootNode.methods = {
    ...rootNode.methods,
    ...methods
  }

}

function componentDefalutProps(node){
  const defaultPropsMap = nameMap.defaultPropsMap;
  if (defaultPropsMap[node.componentName]){
    let props = node.props;
    let propsMaps = defaultPropsMap[node.componentName];
    for (let key in propsMaps){
      props[key] = {
        "type": "JSExpression",
				"value": `${propsMaps[key]}`
      }
    }
  }
}

function transformNode(node,opts,parent) {
    // 判断是否需要加extParam属性
    let extFlag = false;
    if (parent){
      let hocExportNodes = ['LightCardView'].concat(nameMap.hocExportNodes);
      // 对LightCardView节点进行extParam透传 
      hocExportNodes.map((item)=>{
          let name = parent.componentName.split('|')[0];
          if (name == item){
            extFlag = true;
          }
      })
    }

    let depsMap = opts.depsMap;

    // 获取属性
    let props = node.props;
    depsMap[node.componentName] = 1;

    for (let key in props){
        let propNode = props[key];
        // console.log(propNode);
        if (propNode.type == 'variable'){
            // 更改type为JSExpression
            propNode.type = 'JSExpression';
            let variable = propNode.variable;
            // 移除 ${}
            variable = variable.replace(/\${/g,'');
            variable = variable.replace(/}/g,'');
            propNode.value = variable;
        }

        
        // 对event进行特殊处理
        if (key == 'events'){
           let eventMap = props[key];
           for (let eventkey in eventMap){
              // 只支持一个事件函数;
              let eventNode = eventMap[eventkey][0];
              // console.log(eventNode);
              // 新增一个事件属性
              props[eventkey] = {};
              props[eventkey].type = 'JSExpression';

              let params = JSON.stringify(eventNode.params);


              props[eventkey].value = `function (...args){ try{ return Utils.invokeEvent(context.${eventNode.id},context,{...state,...item,item,{self:{index:index}}},${params},args)}catch(e){console.error(e)} }`
              // console.log(props[eventkey]);

           }
        }        
    }

    // componentName 转化
    if (node.componentName.indexOf('|')>=0){
        node.componentName = node.componentName.split('|')[0];
    }

    if (extFlag){
      node.props.extParam = {
        type:'JSExpression',
        value:"extParam"
      }

      node.props.item = {
        type:'JSExpression',
        value:"item"
      }

      if (parent && parent.componentName && parent.componentName.split('|')[0] == 'LightCardView'){
        node.props.index = {
          type:'JSExpression',
          value:"index"
        }
      }
    }

    // 移除一些废弃的属性
    props && delete props.onClick;
    props && delete props.eventParams;
    props && delete props.events;
    // props && delete props.fieldId;
    // loop节点转化
    if (node.componentName == 'LoopView'){
        node.componentName = 'View';
        node.loop = node.props.listData;
        delete node.props.listData;
    }

    componentDefalutProps(node);
  
}

module.exports = schemaTransform;
