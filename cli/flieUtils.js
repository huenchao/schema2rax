const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const util = require('util');
const fsreaddir = util.promisify(fs.readdir);
const fsstat = util.promisify(fs.stat);
const fsreadFile = util.promisify(fs.readFile);
const mkdir = util.promisify(fs.mkdir);
const delFile = util.promisify(fs.unlink);
const fsexists = util.promisify(fs.exists);
const fswriteFile = util.promisify(fs.writeFile);
const prettier = require("prettier");

module.exports = {
  // 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
  async exists(src, dst) {
    let isexists = await fsexists(dst);
    if (!isexists) {
        await mkdir(dst);
    }
  },

  /**
   * 判断文件是否存在
   * @param {} dst 
   */
  async isExists (dst){
    return await fsexists(dst);
  },

  async delFile (dst){
    let isExists = await this.isExists(dst);
    if (isExists){
      return await delFile(dst);
    }
  },

  async copy(src, dst) {
    await this.exists(null,dst);
  
    let paths = await fsreaddir(src);




    for (let i = 0; i < paths.length; i++) {
      let path = paths[i];
      var _src = src + '/' + path,
        _dst = dst + '/' + path,
        readable, writable;

      let st = await fsstat(_src);


     
      // 判断是否为文件
      if (st.isFile()) {
        let isexists = await fsexists(_dst);
        if(!isexists){

        }

        // 创建读取流
        readable = fs.createReadStream(_src);
        // 创建写入流
        writable = fs.createWriteStream(_dst);
        // 通过管道来传输流
        readable.pipe(writable);
      } else if (st.isDirectory()) {
        // 如果是目录则递归调用自身
        await this.exists(_src, _dst);
        await this.copy(_src, _dst);
      }
    }
  },

  async writeFile (path,content){
    await fswriteFile(path, content);
  },

  prettierJSON (json){
    let prettierCode = prettier.format(JSON.stringify(json), { semi: false, parser: "json" });
    return prettierCode;
  },

  async readFile (path){
    let data = await fsreadFile(path);
    return data;
  }

  
};