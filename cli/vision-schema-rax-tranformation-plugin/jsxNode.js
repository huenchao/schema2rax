const t = require("babel-types");
const parse = require("@babel/parser").parse;
const OutPutClass = require("../outPutClass");
const attrs = require("./attrs");
const util = require("./util");
const nameMap = require("./nameMap");
/**
 * 创建jsxElement
 */
function createElement(nodeName, attrs, children) {
  return t.JSXElement(
    t.JSXOpeningElement(t.JSXIdentifier(nodeName), attrs, false),
    t.jSXClosingElement(t.JSXIdentifier(nodeName)),
    children
  );
}

/**
 * 根据schema的componentsTree创建结构一样的jsxNode
 */
function createJsxNodes() {
  const outPutClass = OutPutClass.getInstance();
  const { componentsTree } = outPutClass.schema;
  let rootNode = componentsTree[0];

  let jsxNode = _walkNodes(rootNode);
  return jsxNode;
}

/**
 * 递归创建节点
 */
function _walkNodes(node) {
  node.props && console.log(node.props.fieldId);
  let childrenJsxNodes = [];
  if (node.children && node.children.length > 0 ) {
    node.children.map((item) => {
      if(String(item.condition) !== 'false') {
        let jsxNode = _walkNodes(item);
        childrenJsxNodes.push(jsxNode);
      }
    });
  }

  return createJsxNode(node, childrenJsxNodes);
}

/**
 * 创建条件渲染阶段
 */
 function createConditionNode (condition,jsxNode){
  let conditionNode = jsxNode;
  if (condition && condition.type === 'JSExpression' && condition.value){  
    let ast = parse(`Boolean(${condition.value})`);
    let left = ast.program.body[0].expression;
    conditionNode = t.JSXExpressionContainer(t.LogicalExpression('&&', left,jsxNode));
  }

  return conditionNode;
}

function createLoopNode(loop, loopArgs, jsxNode, replaceNode) {
  // 循环体默认为item,index
  loopArgs = loopArgs || ['item','index'];
  // 取循环节点下的第一个节点
  let childNode = jsxNode
  let loopNode = jsxNode;
  let loopValue;
  if (loop.type === 'JSExpression'){
    loopValue = loop.value
  }else{
    loopValue = loop;
  }

  if (loop.type === 'JSExpression'){
    let loopCodeAst = util.parseCode(loopValue).program.body[0].expression;
    // map关键字
    let mapExpression = t.MemberExpression(loopCodeAst,t.Identifier('map'));
    // console.log('=====loop=====');
    // console.log(loop);
    // 箭头函数
    if(t.isJSXExpressionContainer(childNode)){
      // console.log('childNode',childNode)
      let s =  t.returnStatement(childNode.expression);
      childNode = t.blockStatement([s])
    }

    let arrow = t.ArrowFunctionExpression(loopArgs.map(item=>t.Identifier(item)),childNode);
    // let arrow = t.FunctionExpression(null, loopArgs.map(item=>t.Identifier(item)),childNode);

    loopNode = t.JSXExpressionContainer(t.CallExpression(mapExpression,[
      arrow
    ]))
    
    //console.log('replaceNode',replaceNode)
    // if (!replaceNode){
    //   jsxNode.children = [loopNode];
    // }else{
    //   jsxNode = loopNode;
    // }
    jsxNode = loopNode;

}




  // let loopCodeAst = util.parseCode(loopValue).program.body[0].expression;
  // // map关键字
  // let mapExpression = t.MemberExpression(loopCodeAst, t.Identifier("map"));
  // // 箭头函数
  // let arrow = t.ArrowFunctionExpression(
  //   loopArgs.map((item) => t.Identifier(item)),
  //   jsxNode
  // );

  // loopNode = t.JSXExpressionContainer(t.CallExpression(mapExpression, [arrow]));
  // jsxNode = loopNode;
  // if (!replaceNode) {
  //   jsxNode.children = [loopNode];
  // } else {
  //   jsxNode = loopNode;
  // }

  return jsxNode;
}

function createJsxNode(componentNode, childrenJsxNodes) {
  const outPutClass = OutPutClass.getInstance();
  let attributes = [];
  childrenJsxNodes = childrenJsxNodes || [];
  let jsxNode;

  const { props, condition, loop, loopArgs, id } = componentNode;
  if (props) {
    for (let key in props) {
      if (key === "context") {
        console.log("can't parse attribute which the name is [context]");
        return;
      }
      if(key === "__events"){
        continue;
      }

      attributes.push(attrs.createPropsAttrs(key, props[key]));
    }

    // 固定添加context属性，用于传递容器节点
    attributes.push(
      t.JSXAttribute(
        t.JSXIdentifier("context"),
        t.JSXExpressionContainer(t.Identifier("contextProp"))
      )
    ); 
  }
  // 添加datasource节点
  if (nameMap.dataPropsNodes.indexOf(componentNode.componentName) >= 0) {
    attributes.push(
      t.JSXAttribute(
        t.JSXIdentifier("dataProps"),
        t.JSXExpressionContainer(
          t.Identifier("datasourceOpitions")
        )
      )
    );
  }
  // 判断子节点是否需要新生成节点
  if (nameMap.hocExportNodes.indexOf(componentNode.componentName) >= 0 && condition) {
    console.info('condition', condition === true)
    let componentName = componentNode.componentName;
    // 判断是否已经有导出节点
    if (outPutClass.exportsNodeCountMap[componentNode.componentName]) {
      componentName =
        componentName +
        `_${outPutClass.exportsNodeCountMap[componentNode.componentName] + 1}_`;
      // outPutClass.setExportNode(componentName+'_1',childrenJsxNodes);
    } else {
      outPutClass.setExportNodeCount(componentNode.componentName, 1);
    }

    outPutClass.setExportNode(componentName, childrenJsxNodes);
    childrenJsxNodes.map((item, index) => {
      let indexName = childrenJsxNodes.length > 1 ? index : "";
      attributes.push(
        t.JSXAttribute(
          t.JSXIdentifier("ItemNode" + indexName),
          t.JSXExpressionContainer(
            t.Identifier("this." + componentName + "Item" + indexName)
          )
        )
      );
    });
    jsxNode = createElement(componentNode.componentName, attributes, []);
  } else {
    jsxNode = createElement(
      componentNode.componentName,
      attributes,
      childrenJsxNodes
    );
    // 创建条件渲染节点
    if (condition) {
      jsxNode = createConditionNode(condition, jsxNode);
    }

    // 创建循环渲染节点
    if (loop) {

      // 循环器如果带样式，需要套一个view，否则直接返回循环体
      jsxNode = createLoopNode(
        loop,
        loopArgs,
        jsxNode,
        props.style ? false : true
      );
    }
  }

  return jsxNode;
}

module.exports = {
  createJsxNodes,
};
