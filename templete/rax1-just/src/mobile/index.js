/** @jsx createElement */

'use strict';
import { createElement, Component } from '@ali/rox';
import View from '@ali/rox-view';
import Text from '@ali/rox-text';


const Module = (props) => {
  const { attrs } = props;
  
  return (
    <View style={{
      width: '750rpx',
      height: '300rpx',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: attrs.bgColor,
    }}>
      <Text>
        欢迎开发 cmod 跨端组件
      </Text>
    </View>
  )
};

/**
 * moduleRenderMode(模块渲染模式)
 * cell  : 默认，整个模块按一个 cell 单元平铺渲染 (被自动包裹RecyclerView.Cell)
 * header: 区块头，以 sticky 方式渲染（超出视区则停靠边缘）(被自动包裹RecyclerView.Header)
 * repeat: 以列表的方式重复渲染[保留关键词]
 * origin: 以自身组件进行渲染 (不被包裹任何元素)
 * @type {string}
 */
Module.moduleRenderMode = 'cell';

 /**
  * moduleLevel(模块渲染模式)
  * page  : 默认，组件会放置到 RecylerView 中渲染
  * app: 组件外放到 RecylerView 外进行渲染
  * @type {string}
  */
Module.moduleLevel = 'page';

/**
 * getModuleRowHeight(获取模块行高)
 * @param styles
 * @returns {number}
 */
Module.getModuleRowHeight = () => {
  return 100;
};



export default Module;
