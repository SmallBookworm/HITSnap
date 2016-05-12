/**
 * Created by peng on 16/4/10.
 * models中的对象会被显示到界面上。
 * 选择模块的按钮会根据models的属性名生成，而模块的具体内容由属性中的Functions属性决定。Functions中的spec决定显示内容和输入框输入类型(string,number)，
 * 如果是只提供几种输入的可以这么写
 * new Functions(['按键', 'Input:select['空格键':0,‘a’:1,‘b’:2]','是否按下？'], function (selected) {
    switch (selected) {
        case 0:
            
            break;
        case 1:
            
            break;
        case 2:
            
            break;
        default:
            break;
    }
    ......
});
 */
//用12进制方便判断和标识。如果一个函数属于多个类型就用|连接，如:NORMAL|SPECIAL。
const NORMAL = 0x01;
var models = {};
var vFuncs = {};
vFuncs.var = new Functions(['定义变量', 'Input:string'], function (name) {
    this.variables[name] = {};
});
vFuncs.array = new Functions(['定义数组(变量)', 'Input:string'], function (name) {
    this.variables[name] = [];
});
models.variables = new Model(vFuncs);


var oFuncs = {};
oFuncs.log = new Functions(['输出变量', 'Input:string'], function (name) {
    this.log(this.variables[name]);
});
models.operators = new Model(oFuncs);

models.run = function (data) {
    var platform = {};
    platform.variables = {};
    platform.log = models.log;
    platform.func = function () {
        for (var i in data.models) {
            models[data.models[i]].functions[data.funct[i]].func.apply(this, data.input[i]);
        }
    };
    platform.func();
};
/**
 *
 * @param {object}functions
 * @constructor
 */
function Model(functions) {
    this.functions = functions;
}

/**
 * @description 注意spec中输入必须与对应的func输入顺序相同
 * @param {string[]} spec
 * @param {function}func
 * @constructor
 */
function Functions(spec, func, type) {
    this.spec = spec;
    this.func = func;
    this.type = type || NORMAL;
}
module.exports = models;