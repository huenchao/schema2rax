const t = require('babel-types');
const parse = require('@babel/parser').parse;
const generator = require("@babel/generator").default;


module.exports = {
    createObjectExpression(objData) {
        let objectPropertyList = [];
        for (let key in objData){
            let type = typeof(objData[key]);
            let objectProperty;
            switch (type) {
                case 'string': 
                    objectProperty = t.ObjectProperty(t.stringLiteral(key),t.stringLiteral(objData[key]));
                    break;
                case 'number':
                    objectProperty = t.ObjectProperty(t.stringLiteral(key),t.numericLiteral(objData[key]))
                    break;
                case 'boolean':
                    objectProperty = t.ObjectProperty(t.stringLiteral(key),t.booleanLiteral(objData[key]))
                    break;
            }

            if (objectProperty){
                objectPropertyList.push(objectProperty);
            }
        }

        return t.ObjectExpression(objectPropertyList);
    },


    createFuntion (name,params,block){
        return t.FunctionExpression(name?name:null,params,block);
    },

    createClassProperty(key,objData){
        let ast = this.parseCode('var a =' + JSON.stringify(objData));
        let objectExpression = ast.program.body[0].declarations[0].init;
        return t.ClassProperty(t.Identifier(key),objectExpression);
    },

    createClassMethod(code,name){
        let ast = this.parseFunction(code,name);
        // 获取入参
        let params = ast.program.body[0].params;
        // 获取函数体
        let body = ast.program.body[0].body;
        
        return t.ClassMethod('method',t.Identifier(name),params,body);
    },

    createStaticClassMethod(code,name){
        let ast = this.parseFunction(code,name);
        // 获取入参
        let params = ast.program.body[0].params;
        // 获取函数体
        let body = ast.program.body[0].body;
        let classMethodAst = t.ClassMethod('method',t.Identifier(name),params,body,false,true);

        classMethodAst.async = true;
        return classMethodAst;
    },

    /**
     * 解析函数
     * @param {*} node 
     */
    parseFunction (code,name) {
        let funtionName = name;
        if (this.isFunction(code)){
            // 插入函数名
            let endIndex = code.indexOf('function') + 8;
            let newCode = `${code.substring(0,endIndex)} ${funtionName || 'test'} ${code.substring(endIndex,code.length)}`
            let ast = this.parseCode(newCode);
            return ast;
        }
    },

    /**
     * 解析this->self
     * @param {*} code 
     * @returns 
     */
    parseThisToSelf(code) {
        return code.replace(/(this)/ig, 'self')
    },

    isFunction (code){
        if (code.indexOf('function')>=0){
            return true;
        }

        return false;
    },

    parseCode (code){
        const options = {
            babelrc: true,
            sourceType: 'module',
            allowSuperOutsideMethod:true,
            plugins: ['jsx', 'objectRestSpread', 'classProperties', 'classPrivateProperties', 'decorators-legacy'],
        }

        return parse(code,options);
    },

    generatorAst(ast){
        let code = generator(ast).code;
        return code;
    },

  }