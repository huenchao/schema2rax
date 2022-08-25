const OutPutClass = require("../outPutClass");
const util = require("./util");
const nameMap = require("./nameMap");
const datasource = require("./datasource");
const method = require("./method");
const t = require("babel-types");
const defaultState = require("./defaultState");
const exportChild = require("./exportChild");
const { initUtilsCode } = require("../useUtils");


module.exports = {
  VariableDeclarator(astPath) {
    // 初始化datasource配置项
    datasource.initDataourceOpts(astPath);
  },

  ClassMethod(path) {
    if(path.node.key.name === "constructor"){
      path.skip()
    }

    if (path.node.key.name === "componentWillMount") {
      let templete = initUtilsCode();
      let templeteBodys = util.parseCode(templete).program.body;
      let templete2 =  `
      this.datasource = new Datasource(datasourceOpitions, this);
      this.datasource.init();
      this.dataSourceMap = this.datasource.getDataSourceMap();
      `;
      let templeteBodys2 = util.parseCode(templete2).program.body;
      path.get("body").unshiftContainer("body", templeteBodys2);
      path.get("body").unshiftContainer("body", templeteBodys);
    }
  },
  ClassBody: {
    enter(path) {
      const schema = OutPutClass.getInstance().schema;

      let newNodeBody = [];

      let statePropety = defaultState.create();

      statePropety && newNodeBody.push(statePropety);

      // 处理生命周期函数
      let lifeCycles = schema.componentsTree[0].lifeCycles;

      if (lifeCycles) {
        for (let key in lifeCycles) {
          if (nameMap.lifeCycles[key]) {
            let methodAst = util.createClassMethod(
              lifeCycles[key].value,
              nameMap.lifeCycles[key].rax
            );
            newNodeBody.push(methodAst);
          }
        }
      }


      // 处理其他自定义函数
      let methods = schema.componentsTree[0].methods;
      if (methods) {
        for (let key in methods) {
          let methodAst = method.createMethodAst(
            methods[key].value,
            key,
            methods[key].isStatic
          );
          newNodeBody.push(methodAst);
        }
      }

      let renderAst = path.node.body[0];

      newNodeBody.push(renderAst);

      let body = newNodeBody;

      path.node.body = body;
    },

    exit(path) {
      const body = path.node.body || [];
      let injectWillMount = false;
      for (let i = 0; i < body.length; i++) {
        const item = body[i];
        if (
          item.type === "ClassMethod" &&
          item.key.name === "componentWillMount"
        ) {

          injectWillMount = true;
          break;
        }
      }


      if (!injectWillMount) {
        let templete = `
        {
          ${initUtilsCode()}
          this.datasource = new Datasource(datasourceOpitions, this);
          this.datasource.init();
          this.dataSourceMap = this.datasource.getDataSourceMap();
        }
        `;
      let templeteBodys = util.parseCode(templete).program.body;

      var property = t.classMethod(
        "method",
        t.identifier("componentWillMount"),
        [],
        templeteBodys[0]
      );
        path.node.body.push(property);
      }
      exportChild.create(path.node.body);
    },
  },
};
