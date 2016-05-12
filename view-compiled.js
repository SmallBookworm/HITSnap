const React = require('react');
const ReactDOM = require('react-dom');
const antd = require('antd');
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const createFragment = require('react-addons-create-fragment');
const Menu = antd.Menu;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const Row = antd.Row;
const Col = antd.Col;
const Button = antd.Button;
const Input = antd.Input;
const Progress = antd.Progress;
const ProgressCircle = Progress.Circle;

var elements = {};
function analyseSpec(spec) {
    var elements = [];
    for (var i in spec) {
        if (spec[i].slice(0, 5) == 'Input') {
            elements.push('Input');
        } else {
            elements.push(React.createElement(
                'td',
                null,
                React.createElement(
                    'nobr',
                    null,
                    spec[i]
                )
            ));
        }
    }
    return elements;
}
var models = {};
ipcRenderer.on('log', function (ev, arg) {
    console.log(arg);
});
ipcRenderer.send('init');
ipcRenderer.on('init-reply', function (event, arg) {
    var length = 0;
    var ms = window.Object.getOwnPropertyNames(arg);
    var i,
        x,
        l = 0;
    for (i in ms) {
        models[ms[i]] = window.Object.getOwnPropertyNames(arg[ms[i]].functions);
        length += models[ms[i]].length;
    }
    for (i in arg) {
        for (x in arg[i].functions) {
            elements[x] = analyseSpec(arg[i].functions[x].spec);
            l++;
        }
        ReactDOM.render(React.createElement(
            'div',
            null,
            React.createElement(ProgressCircle, { percent: l * 100 / length })
        ), document.getElementById('content'));
    }
    ReactDOM.render(React.createElement(
        'div',
        null,
        React.createElement(Header, null),
        React.createElement(Body, null)
    ), document.getElementById('content'));
});
const MainMenu = React.createClass({
    displayName: 'MainMenu',

    getInitialState() {
        return {
            marginTop: '15px'
        };
    },
    handleClick(e) {
        console.log('click ', e);
        this.setState({
            current: e.key
        });
    },
    render() {
        return React.createElement(
            Menu,
            { onClick: this.handleClick,
                theme: this.state.theme,
                mode: 'horizontal',
                style: { marginTop: this.state.marginTop } },
            React.createElement(
                Menu.Item,
                { key: 'mail' },
                React.createElement(
                    'div',
                    null,
                    React.createElement('img', { src: 'https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=1222350435,55188739&fm=58', width: '40',
                        height: '40' }),
                    'HIT'
                )
            ),
            React.createElement(
                Menu.Item,
                { key: 'app', disabled: true },
                '导'
            ),
            React.createElement(
                SubMenu,
                { title: React.createElement(
                        'span',
                        null,
                        '导'
                    ) },
                React.createElement(
                    MenuItemGroup,
                    { title: '分组1' },
                    React.createElement(
                        Menu.Item,
                        { key: 'setting:1' },
                        '选项1'
                    ),
                    React.createElement(
                        Menu.Item,
                        { key: 'setting:2' },
                        '选项2'
                    )
                ),
                React.createElement(
                    MenuItemGroup,
                    { title: '分组2' },
                    React.createElement(
                        Menu.Item,
                        { key: 'setting:3' },
                        '选项3'
                    ),
                    React.createElement(
                        Menu.Item,
                        { key: 'setting:4' },
                        '选项4'
                    )
                )
            ),
            React.createElement(
                Menu.Item,
                { key: 'alipay' },
                React.createElement(
                    'a',
                    { href: 'http://www.alipay.com/', target: '_blank' },
                    '导'
                )
            )
        );
    }
});
const Header = React.createClass({
    displayName: 'Header',

    render() {
        return React.createElement(
            Row,
            null,
            React.createElement(
                Col,
                { span: '12' },
                React.createElement(MainMenu, null)
            ),
            React.createElement(
                Col,
                { span: '6' },
                'dddd'
            ),
            React.createElement(
                Col,
                { span: '6' },
                '哈哈哈👌'
            )
        );
    }
});

const Model = React.createClass({
    displayName: 'Model',

    buttonElement: createFragment({}),
    getInitialState() {
        var i,
            x = 0;
        for (i in models) {
            this.buttonElement.push(React.createElement(
                Button,
                { key: i, type: 'ghost', style: { width: '50%' },
                    onClick: this.changeModel },
                ' ',
                i,
                ' '
            ));
            x++;
            if (x == 2) {
                this.buttonElement.push(React.createElement('br', { key: i + '/br' }));
                x = 0;
            }
        }
        if (x != 0) this.buttonElement.push(React.createElement('br', { key: i + '/br' }));
        return {
            modelName: '',
            functionsName: []
        };
    },
    changeModel() {
        this.setState({ modelName: arguments[1].slice(12), functionsName: models[arguments[1].slice(12)] });
    },
    render() {
        return React.createElement(
            'div',
            null,
            this.buttonElement,
            React.createElement(Functions, { name: { modelName: this.state.modelName, functionsName: this.state.functionsName } })
        );
    }
});
const Functions = React.createClass({
    displayName: 'Functions',

    drag(ev) {
        ev.dataTransfer.setData("Text", ev.target.id + '&' + this.props.name.modelName);
    },
    render() {
        var i, x;
        var subElement = createFragment({});
        var name, ssElement, tds;
        for (i in this.props.name.functionsName) {
            name = this.props.name.functionsName[i];
            ssElement = createFragment({});
            tds = elements[name];
            for (x in tds) {
                var key = name + x;
                if (tds[x] === 'Input') {
                    ssElement.push(React.createElement(
                        'td',
                        { key: 'td' + key },
                        React.createElement(Input, { id: 'defaultInput', key: key, disabled: true })
                    ));
                } else {
                    ssElement.push(createEle(key, tds[x]));
                }
            }
            subElement.push(React.createElement(
                'tr',
                { key: "gl" + i, style: { border: '2px solid', float: 'left' }, draggable: 'true',
                    id: name, onDragStart: this.drag },
                ssElement
            ));
        }
        return React.createElement(
            'table',
            null,
            React.createElement(
                'tbody',
                null,
                subElement
            )
        );
    }
});
const PlaceHolder = React.createClass({
    displayName: 'PlaceHolder',

    render() {
        return React.createElement(
            'tr',
            { style: { textAlign: 'center' },
                onDrop: this.props.drop,
                onDragOver: this.props.allowDrop },
            React.createElement(
                'td',
                { id: this.props.Id },
                '请拖入模块'
            )
        );
    }
});
const CollectBox = React.createClass({
    displayName: 'CollectBox',

    collected: [],
    data: { models: [], funct: [], input: [] },
    getInitialState: function () {
        return {
            length: 0
        };
    },
    submit() {
        var input = [];
        var ele;
        for (var i = 0; i < this.data.funct.length; i++) {
            input = [];
            for (var x = 0;; x++) {
                ele = document.getElementById('' + (i * 2 + 1) + x);
                if (ele) {
                    input[x] = ele.value;
                } else {
                    break;
                }
            }
            this.data.input[i] = input;
        }
        ipcRenderer.send('run', this.data);
        ipcRenderer.on('run-reply', function (event, arg) {
            console.log(arg);
        });
    },
    drop(ev) {
        var text = ev.dataTransfer.getData("Text");
        var flag = text.split('&');
        if (flag[0] == 'collectbox') return;
        var modelName = flag[1];
        var data = flag[0];
        var element;
        var long = this.state.length;
        var targetId = parseInt(ev.target.id);
        var ssElement;
        var inputAmount;
        if (long == 0) {
            this.collected.push(React.createElement(PlaceHolder, { key: 'en1200', Id: 0, drop: this.drop, allowDrop: this.allowDrop }));
            long++;
        }
        this.data.funct.splice(targetId / 2, 0, data);
        this.data.models.splice(targetId / 2, 0, modelName);
        for (var i = targetId; i < long; i += 2) {
            element = elements[this.data.funct[i / 2]];
            ssElement = createFragment({});
            inputAmount = 0;
            for (var x in element) {
                var key = 'en' + long + x;
                if (element[x] === 'Input') {
                    ssElement.push(React.createElement(
                        'td',
                        { key: 'td' + key },
                        React.createElement(Input, { id: i + 1 + '' + inputAmount, key: key })
                    ));
                    inputAmount++;
                } else {
                    ssElement.push(createEle(key, element[x]));
                }
            }
            this.collected[i + 1] = React.createElement(
                'tr',
                { key: 'en' + i + 1, style: { border: '2px solid', float: 'left' } },
                ssElement
            );

            this.collected[i + 2] = React.createElement(PlaceHolder, { key: 'en120' + i + 2, Id: i + 2, drop: this.drop,
                allowDrop: this.allowDrop });
        }
        this.setState({ length: long + 2 });
    },
    allowDrop(ev) {
        ev.preventDefault();
    },
    drag(ev) {
        ev.dataTransfer.setData("Text", ev.target.id);
    },
    dragBox(ev) {
        ev.dataTransfer.setData("Text", 'collectbox&' + ev.pageX + '&' + ev.pageY);
    },
    render() {
        var subElement = createFragment({});
        if (this.state.length == 0) {
            subElement.push(createEle('eng0', React.createElement(PlaceHolder, { Id: 0, drop: this.drop, allowDrop: this.allowDrop })));
        } else {
            for (var i = 0; i < this.state.length; i++) {
                subElement.push(this.collected[i]);
            }
        }
        return React.createElement(
            'table',
            { style: this.props.style, draggable: 'true', onDragStart: this.dragBox },
            React.createElement(
                'tbody',
                { style: { border: 'dotted' } },
                subElement
            ),
            React.createElement(
                'tfoot',
                null,
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'td',
                        null,
                        React.createElement(
                            Button,
                            { style: { width: '11%' }, onClick: this.submit, shape: 'circle' },
                            ' 开始 '
                        )
                    )
                )
            )
        );
    }
});
function createEle(key, element) {
    var bj = {};
    bj[key] = element;
    return createFragment(bj);
}
const Body = React.createClass({
    displayName: 'Body',

    getInitialState() {
        return {
            height: window.innerHeight / 2,
            boxStyle: { width: '61.8%', marginLeft: '19.1%', marginTop: 20 }
        };
    },
    handleResize() {
        this.setState({ height: document.documentElement.scrollHeight - ReactDOM.findDOMNode(this.refs.body).offsetTop });
    },
    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        this.setState({
            height: document.documentElement.scrollHeight - ReactDOM.findDOMNode(this.refs.body).offsetTop,
            boxStyle: {
                width: ReactDOM.findDOMNode(this.refs.col3).clientWidth * 0.618,
                marginLeft: ReactDOM.findDOMNode(this.refs.col3).clientWidth * 0.191,
                marginTop: 20
            }
        });
    },
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    },
    drop(ev) {
        var data = ev.dataTransfer.getData("Text").split('&');
        if (data[0] != 'collectbox') return;
        var left = this.state.boxStyle.marginLeft + ev.pageX - data[1];
        var top = this.state.boxStyle.marginTop + ev.pageY - data[2];
        if (left < 0) left = 0;
        var maxL = ReactDOM.findDOMNode(this.refs.col3).clientWidth - this.state.boxStyle.width;
        if (left > maxL) left = maxL;
        if (top < 0) top = 0;
        var maxT = ReactDOM.findDOMNode(this.refs.col3).clientHeight - ReactDOM.findDOMNode(this.refs.collectbox).clientHeight;
        if (top > maxT) top = maxT;
        this.setState({
            boxStyle: {
                width: this.state.boxStyle.width,
                marginLeft: left,
                marginTop: top
            }
        });
    },
    allowDrop(ev) {
        if (ev.dataTransfer.getData("Text").split('&')[0] == 'collectbox') ev.preventDefault();
    },
    render() {
        return React.createElement(
            Row,
            { ref: 'body' },
            React.createElement(
                Col,
                { span: '4', style: { border: 'inset' } },
                React.createElement(Model, null)
            ),
            React.createElement(
                Col,
                { span: '10', ref: 'col3', style: { height: this.state.height }, onDrop: this.drop, onDragOver: this.allowDrop },
                React.createElement(CollectBox, { style: this.state.boxStyle, ref: 'collectbox' })
            ),
            React.createElement(
                Col,
                { span: '10', style: { border: 'outset' } },
                'ggggg'
            )
        );
    }
});

//# sourceMappingURL=view-compiled.js.map