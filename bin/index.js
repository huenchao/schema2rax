#!/usr/bin/env node
const schema = require('../schema.json');

const path = require('path');


async function start (params) {
    const build = require('../cli/dev').build;

    const ops = {
        templetePath: path.join(__dirname,'../templete/rax1-just'),
        componentName: 'scorpio-dubhe-szbbdzj',
        componentLogo:'https://gw.alicdn.com/tfs/TB1rrqaupT7gK0jSZFpXXaTkpXa-356-570.png',
        user:'zude.hzd',
        version:'0.0.3',
        description:'测试测试1234',
        input:{
            //schema
            elementList:[
              {
                name: 'Image',
                version: '0.0.9',
                gray_version: null,
                packageName: '@ali/rox-udpl-image'
              },
              {
                name: 'Text',
                version: '0.0.9',
                gray_version: null,
                packageName: '@ali/rox-udpl-text'
              },
              {
                name: 'View',
                version: '0.0.20',
                gray_version: null,
                packageName: '@ali/rox-udpl-view'
              },
              {
                name: 'Root',
                version: '0.0.2',
                gray_version: null,
                packageName: '@ali/rox-udpl-root'
              },
              {
                name: 'udpl_text',
                version: '0.0.1',
                gray_version: null,
                packageName: '@ali/udpl-text'
              },
              {
                name: 'udpl_view',
                version: '0.0.2',
                gray_version: null,
                packageName: '@ali/udpl-view'
              }
            ],
            schema
        },
        extParams:{test:111},
        schemaTransformFlag:true,
        device:'mobile',
        buildIndexPath: "/src/mobile/index.js",
        buildDemoIndexPath: "/demo/mobile/demo.init.js",
        // buildPath:'/var/folders/tw/cp9y9s194_l0__nh3ljwx6sh0000gn/T/8197a205-6990-4f10-9a6c-70649860c231'
    }
    await build(ops);
}

start();

