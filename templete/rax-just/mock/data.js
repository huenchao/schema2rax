export default {
  data1: {
    componentData: {
      data: {},     // 动态数据源的数据
      styles: {},   // 组件样式相关
      attrs: {},    // 组件配置相关
      dataService: {// 动态数据源相关
        'apiName': 'mtop.ali.smartui.getComponentData',
        'apiVersion': '1.0',
        'param': {
          // 'componentId': '116867',
          // 'pageId': 3655
        }
      },
      spmc: {},     // 打点信息
      jdataId:1095821,
      moduleName: ''// 模块实例名称 方便定位
    },
    // 模拟spmc
    spmc: 'a.b.c.0',
    defineId: '',   // 当前模块id 可以需要
  }
};