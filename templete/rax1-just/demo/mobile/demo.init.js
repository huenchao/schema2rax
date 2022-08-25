import MyComponent from '../../src/mobile/index';
import mounter from '@ali/rox-demo-bootstrap';
import query from '@ali/rox-query-jdata';


let jdataId = 0/** jdataId **/

let modules = [
  {
    moduleClass: MyComponent,
    moduleInfo: {
      jdataId:jdataId
    }
  }
];

const pageConfig = {
  title: 'Rox 跨端模块',
  theme: {
    backgroundColor: '#ccc',
  }
};

if (jdataId){
  // 获取jdata数据
  query (jdataId,(data)=>{
    modules = [
      {
        moduleClass: MyComponent,
        moduleInfo: {
          ...data,
          jdataId:jdataId
        }
      }
    ];

    const pageConfig = {
      title: 'Rox 跨端模块',
      theme: {
        backgroundColor: '#ccc',
      }
    };

    mounter(modules, pageConfig);
  })
}else{
  mounter(modules, pageConfig);
}
