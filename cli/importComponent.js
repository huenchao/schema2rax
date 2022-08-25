let OutPutClass = require("./outPutClass");

/**
 * 是否存在解构
 * @param {*} importItem
 */
function destructuring(importItem) {
  if (importItem.destructuring) {
    if (
      !importItem.exportName ||
      importItem.exportName === importItem.componentName
    ) {
      return `{ ${importItem.componentName} }`;
    } else {
      return `{${importItem.exportName} as ${importItem.componentName}}`;
    }
  }

  return importItem.componentName;
}

/**
 * 是否存在子名称
 * @param {} importItem
 */
function subName(importItem) {
  if (importItem.subName && importItem.exportName) {
    return `const ${importItem.componentName} = ${importItem.exportName}.${importItem.subName}; \n`;
  }

  return "";
}

function pkgPath(item) {
  if (item.main && !/^(\/)?index.js$/.test(item.main)) {
    return `${item.npmName || item.package}${item.main}`;
  }

  return `${item.npmName || item.package}`;
}

// 处理import的代码
function importComponent() {
  const outPutClass = OutPutClass.getInstance();
  // 获取componentsMap
  let _componentsMap = outPutClass.schema.componentsMap;

  //所有物料组件都不解构
  const componentsMap = outPutClass.schema.componentsMap = _componentsMap.map(
    (item) => {
      item.destructuring = false;
      return item;
    }
  );

  let outStrList = [];

  // import 公共部分
  commomImport(outStrList);
  // import 剩余组件

  componentsMap.unshift({
    componentName: "Datasource",
    package: "@ali/rox-udpl-datasource-standard",
    version: "0.x.x",
    exportName: "Datasource",
  });
  componentsMap.unshift({
    componentName: "createElement, Component",
    package: "@ali/rox",
    version: "0.x.x",
    destructuring: true,
  });

  componentsMap.map((item) => {
    let destructuringString = destructuring(item);
    let subNameString = subName(item);

    let outString = `import ${destructuringString} from '${pkgPath(
      item
    )}';\n${subNameString}`;

    outStrList.push(outString);
  });

  if (
    outPutClass.schema.componentsTree &&
    outPutClass.schema.componentsTree[0].css
  ) {
    outStrList.push(`import './index.css';\n`);
  }

  outPutClass.setImportCode(outStrList.join(""));
}

/**
 * 处理公共的import
 * @param {} outStrList
 */
function commomImport(outStrList) {
  outStrList.push("/** @jsx createElement */ \n\n");
  // outStrList.push("import Utils from '@ali/rox-udpl-utils'; \n");
}

/**
 * 解构初始化
 */
function initDeconstructCode(itemFlag) {
  let outPutClass = OutPutClass.getInstance();
  let componentsTreeObj = outPutClass.schema.componentsTree[0];
  let deconstructList = !itemFlag ? ["item"] : [];
  let state = componentsTreeObj.state;
  for (let key in state) {
    deconstructList.push(key);
  }

  let datasource = componentsTreeObj.dataSource.list;
  datasource.map((item) => {
    deconstructList.push(item.id);
  });

  return `
    const {${deconstructList.join(",")}} = state;
    `;
}

module.exports = { importComponent, initDeconstructCode };
