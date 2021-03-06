/**
 * Created by jiaxuanliang
 * date:2016-04-05后开始独立改造
 * edit by wangzy
 * date:2016-04-26
 * desc:重命名为SwitchButton 并将完善
 */
require('../Sass/Form/SwitchButton.scss');
let React = require('react');
let setStyle=require("../Mixins/SetStyle.js");
var shouldComponentUpdate=require("../Mixins/shouldComponentUpdate.js");
var Label=require("../Unit/Label.jsx");
let SwitchButton = React.createClass({
    mixins:[setStyle,shouldComponentUpdate],
    propTypes:{
        name:React.PropTypes.string.isRequired,//字段名
        label:React.PropTypes.oneOfType([React.PropTypes.string,React.PropTypes.element,React.PropTypes.node]),//字段文字说明属性
        width:React.PropTypes.number,//宽度
        height:React.PropTypes.number,//高度
        value:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string]),//默认值,
        text:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string]),//默认文本值
        placeholder:React.PropTypes.string,//输入框预留文字
        readonly:React.PropTypes.bool,//是否只读
        required:React.PropTypes.bool,//是否必填
        onlyline:React.PropTypes.bool,//是否只占一行
        hide:React.PropTypes.bool,//是否隐藏
        regexp:React.PropTypes.string,//正则表达式
        invalidTip:React.PropTypes.string,//无效时的提示字符
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
        onSelect:React.PropTypes.func,//单击事件，专门用于表单
        checkedChildren:React.PropTypes.string,//开关为'开'的时候显示的文本值
        unCheckedChildren:React.PropTypes.string,//开关为'关'的时候显示的文本值
        showChildren:React.PropTypes.bool,//是否显示开关 文本值
},
    getDefaultProps:function() {
        return {   type:"text",
            name:"",
            label:null,
            width:null,
            height:null,
            value:0,
            text:"false",
            placeholder:"",
            readonly:false,
            required:false,
            onlyline:false,
            hide:false,
            regexp:null,
            invalidTip:null,
            style:null,
            className:null,
            size:"default",
            position:"default",
            checkedChildren:"是",
            unCheckedChildren:"否",
            showChildren:false,
        }
    },
    getInitialState:function(){
        return {
            hide:this.props.hide,
            value:this.props.value===""?0:this.props.value,//用于回传给表单组件
            text:this.props.value===""?"false":"true",
            readonly:this.props.readonly,
        }
    },
    componentWillReceiveProps:function(nextProps) {
          this.setState({
               hide:nextProps.hide,
              value:(nextProps.value!=0&&nextProps.value!=1)?0:nextProps.value,
              text:(nextProps.value!=0&&nextProps.value!=1)?"false":nextProps.text,
              readonly:nextProps.readonly,
          })

    },
    validate:function()
    {
      return true;
    },
    handleClick:function(){
        if(this.state.readonly)
        {
            return ;
        }
        var _this = this;
        var onSelectFn = function(){
            _this.setState({
                value:_this.state.value==1?0:1,
                text:_this.state.value==1?"false":"true",
            });
            if(_this.props.onSelect!=null)
            {//返回给comboBox组件
                _this.props.onSelect(_this.state.value==1?0:1,_this.state.value==1?"false":"true",_this.props.name);
            }
        }
        if(this.props.onBeforeSelect){
            this.props.onBeforeSelect(this.state.value==1?0:1,this.props.name,()=>{
                onSelectFn();
            });  
        }else{
            onSelectFn();
        }
    },
    render:function(){
        var inputType="text";
        if(this.props.type=="password") {
            inputType = "password";
        }
        var size=this.props.onlyline==true?"onlyline":this.props.size;//组件大小
        var componentClassName=  "wasabi-form-group "+size+" "+(this.props.className?this.props.className:"");//组件的基本样式
        var style =this.setStyle("input");//设置样式
        var controlStyle=this.props.controlStyle?this.props.controlStyle:{};
        controlStyle.display = this.state.hide == true ? "none" : "block";
        var className = "syncbtn ";
        if(this.state.value==1){
            className+="checktrue";
        }else{
            className += "checkfalse";
        }

        if(this.state.readonly)
        {
            className+=" disabled";
        }

        return (
        <div className={componentClassName+this.state.validateClass}  style={ controlStyle}>
            <Label name={this.props.label} ref="label" hide={this.state.hide} required={this.state.required}></Label>
            <div className={ "wasabi-form-group-body"} style={{width:!this.props.label?"100%":null}}>
                <div className={className} onClick={this.handleClick}>
                    <span className="wasabi-switch-inner" style={{display:this.props.showChildren?"block":"none"}}>
                        {this.state.value?this.props.checkedChildren:this.props.unCheckedChildren}
                    </span>
                </div>
                <small className={"wasabi-help-block "+this.props.position} style={{display:(this.state.helpTip&&this.state.helpTip!="")?this.state.helpShow:"none"}}><div className="text">{this.state.helpTip}</div></small>
            </div>
        </div>

        )
    }
});
module.exports = SwitchButton;