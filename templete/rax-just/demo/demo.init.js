import demoMount from '@ali/cox-demo-mounter';
import ModuleClass from '../index';
import query from '@ali/rax-demo-asyc-loaddata';

let jdataId = 5/** jdataId **/

if (jdataId){
  // 获取jdata数据
  query (jdataId,(data)=>{
    const modules = [
      {
        moduleClass: ModuleClass,
        moduleData: {
           componentData:{
              jdataId:jdataId,
              ...data
           }
        }
      }
    ];
  
    // 页面信息配置
    const pageConfig = {
      pageId: '3323',
      title: '天枢组件本地开发页面',
      hasRefresh: false,
      style: {
        backgroundColor: 'rgba(0,0,0,0)'
      }
    };
  
    demoMount(modules, pageConfig);
  })
}else{
  const modules = [
    {
      moduleClass: ModuleClass,
      moduleData: {}
    }
  ];
  // 页面信息配置
  const pageConfig = {
    pageId: '3323',
    title: '天枢组件本地开发页面',
    hasRefresh: false,
    style: {
      backgroundColor: 'rgba(0,0,0,0)'
    }
  };
  
  demoMount(modules, pageConfig);
}


