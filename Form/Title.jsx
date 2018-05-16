//creete by wangzy
//date:2016-11-25
//desc 表单中空的占位组件,方便排版
//属性与状态值保留,可能以后有用
let React=require("react");
let setStyle=require("../Mixins/SetStyle.js");
var Title=React.createClass({
    mixins:[setStyle],
    propTypes: {
        name:React.PropTypes.string.isRequired,//字段名
        label:React.PropTypes.oneOfType([React.PropTypes.string,React.PropTypes.element,React.PropTypes.node]),//字段文字说明属性
        onlyline:React.PropTypes.bool,//是否只占一行
        hide:React.PropTypes.bool,//是否隐藏
        style:React.PropTypes.object,//自定义style
        className:React.PropTypes.string,//自定义class
        size:React.PropTypes.oneOf([
            "none",
            "default",
            "large",//兼容性值,与two相同
            "two",
            "three",
            "onlyline"
        ]),//组件表单的大小
        position:React.PropTypes.oneOf([
            "left",
            "default",
            "right"
        ]),//组件在表单一行中的位置

    },
    getDefaultProps:function() {
        return{
            name:"",
            label:null,
            onlyline:true,
            hide:false,
            style:null,
            className:null,
            size:"default",
            position:"default",
        }
    },
    getInitialState:function() {
        return{
            hide:this.props.hide,
            readonly:this.props.readonly,
        }
    },
    componentWillReceiveProps:function(nextProps) {
        
    },
    validate:function(){
        return true; //总是返回true，校验通过
    },
    render:function() {
        var controlStyle=this.props.controlStyle?this.props.controlStyle:{};
        controlStyle.display = this.state.hide == true ? "none" : "block";
        var size=this.props.onlyline==true?"onlyline":this.props.size;//组件大小
        var componentClassName=  "wasabi-form-group "+size+" "+(this.props.className?this.props.className:"");//组件的基本样式

        return (
            <div className={componentClassName+this.state.validateClass} style={ controlStyle} >
                {this.props.label}
            </div>
        );
    }
});
module .exports=Title;