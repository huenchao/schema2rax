import MyComponent from '../../src/pc/index';
import mounter from '@ali/rox-demo-bootstrap';
import data from '../../mock/data';

const { data1 } = data;

const modules = [
  {
    moduleClass: MyComponent,
    moduleInfo: {
      ...data1,
    }
  }
];

const pageConfig = {
  title: 'Rox 跨端模块',
  theme: {
    backgroundColor: '#000',
  }
};

mounter(modules, pageConfig);
