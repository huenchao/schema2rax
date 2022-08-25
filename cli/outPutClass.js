class OutPutClass {
    constructor(opts = {}) {
      this.templeteName = opts.templeteName || 'rax-just' // 模板名
      this.templetePath = opts.templetePath;
      this.sourceCode = '' // 转化后的代码
      this.templeteIndex = opts.templeteIndex || 'src/index.js'; // 模板入口文件
      this.importCode = '';
      // 额外参数，用于定义一些业务数据
      this.extData = {};
      this.pkg = [],
      this.schema = opts.schema || {}
      this.oldSchema = opts.oldSchema || {}
      this.user = opts.user;
      this.version = opts.version;
      this.description = opts.description;
      this.componentName = opts.componentName;
      this.componentLogo = opts.componentLogo;
      this.exportsNodeMap = {}
      // 用来记录导出的子节点数量
      this.exportsNodeCountMap = {};
      // 构建目录
      this.buildPath=opts.buildPath;
      // 入口文件Path
      this.buildIndexPath = opts.buildIndexPath;
      // demo 入口文件Path
      this.buildDemoIndexPath = opts.buildDemoIndexPath;
      // 业务入参
      this.extParams = opts.extParams || {};
      // 设备类型
      this.device = opts.device;
      // 导出的utilsComponentList
      this.utilsComponentList = [];
      this._initStateVariableList();
    }

    _initStateVariableList (){
      this.stateVariableList = [];
      this.stateVariableList.push('jdata');
      // 数据源
      let dataSource =  this.schema.componentsTree[0].dataSource;

      dataSource && dataSource.list && dataSource.list.length>0 && dataSource.list.map((item)=>{
        this.stateVariableList.push(item.id);
      })
    }
    
    setImportCode (importCode){
      this.importCode = importCode;
    }

    setSourceCode (sourceCode){
      this.sourceCode = sourceCode;
    }

    setExtData (extData){
      this.extData = extData;
    }

    setUtilsComponentList(utilsComponentList){
      this.utilsComponentList = utilsComponentList;
    }

    setExportNode (nodeName,childJsxNodes){
      this.exportsNodeMap[nodeName] = childJsxNodes 
    }

    setExportNodeCount (nodeName,count){
      this.exportsNodeCountMap[nodeName] = count;
    }
    

    setSchema (schema){
      this.schema = schema;
    }

    

    static deleteInstance(){
      this.instance = null;
    }

    //静态方法，单例模式
    static getInstance(opts) {
      if(!this.instance) {
        this.instance = new OutPutClass(opts);
      }
      return this.instance;
    }

  }
  
  
  module.exports = OutPutClass;