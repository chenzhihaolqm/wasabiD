//creete by wangzy
//date:2016-08-02
//desc 将输入框从Input中独立出来
require("../Sass/Form/TextRange.scss");
let React=require("react");
var validation=require("../Lang/validation.js");
var validate=require("../Mixins/Validate.js");
var shouldComponentUpdate=require("../Mixins/shouldComponentUpdate.js");
var Label=require("../Unit/Label.jsx");

var TextRange=React.createClass({
    mixins:[validate,shouldComponentUpdate],
    propTypes: {
        inputType:React.PropTypes.oneOf([
            "integer",//整型数据
            "number",//数字
            "positiveInteger",//正整数

        ]),//文本框输入的类型
        name:React.PropTypes.string.isRequired,//字段名
        label:React.PropTypes.oneOfType([React.PropTypes.string,React.PropTypes.element,React.PropTypes.node]),//字段文字说明属性
        width:React.PropTypes.number,//宽度
        height:React.PropTypes.number,//高度
        value:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string]),//默认值,
        minValue:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string]),//输入的较小值,
        maxValue:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string]),//输入的较大值,
        placeholder:React.PropTypes.string,//输入框预留文字
        readonly:React.PropTypes.bool,//是否只读
        required:React.PropTypes.bool,//是否必填
        onlyline:React.PropTypes.bool,//是否只占一行
        hide:React.PropTypes.bool,//是否隐藏
        invalidTip:React.PropTypes.string,//无效时的提示字符
        className:React.PropTypes.string,//自定义class
		componentClassName:React.PropTypes.string,//自定义class
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
        onChange:React.PropTypes.func,//值改变事件
        onBlur:React.PropTypes.func,//失去焦点事件
        data:React.PropTypes.array,//自定义数据源

    },
    getDefaultProps:function() {
        return{
            inputType:"positiveInteger",
            name:"",
            label:null,
            width:null,
            height:null,
            value:"",
            minValue:"",
            maxValue:"",
            placeholder:"",
            readonly:false,
            required:false,
            onlyline:false,
            hide:false,
            invalidTip:null,
            className:null,
			componentClassName:null,
            size:"default",
            position:"default",
            onChange:null,
            data:null,

        }
    },
    getInitialState:function() {
        let propValue = this.props.value ||",";
        let propValueArr = propValue.split(",");
        let minValue = propValueArr[0],
            maxValue = propValueArr[1];
        if(propValueArr[0] != 0 && !propValueArr[0] ){
            minValue = "";
        }
        if(propValueArr[1] != 0 && !propValueArr[1] ){
            maxValue = "";
        }
        return{
            hide:this.props.hide,
            minValue:minValue,
            maxValue:maxValue,
            value:propValue,
            readonly:this.props.readonly,
            required:this.props.required,
            validateClass:"",//验证的样式
            helpShow:"none",//提示信息是否显示
            helpTip:validation["required"],//提示信息
            invalidTip:"",
            showQuickSlectFlag:false //是否显示快速选择下拉框的标志
        }
    },
    componentWillReceiveProps:function(nextProps) {
        this.setState({
            hide:nextProps.hide,
            value: nextProps.value,
            readonly: nextProps.readonly,
            required: nextProps.required,
            validateClass:"",//重置验证样式
            helpTip:validation["required"],//提示信息
        });

    },
    componentDidMount:function() {
        this.validateInput=true;//设置初始化值，输入有效
    },
    componentDidUpdate:function() {
        this.validateInput=true;//设置初始化值
    },
    changeHandler:function(refVal,event) {
        let inputVal = event.target.value;
        if (this.validateInput==true) {//输入有效的时候
            var submitVal = "";  //提交的回传值
            var saveVal = this.state[refVal]; //保存的某个输入框的值
            if((this.props.inputType=="integer"||this.props.inputType=="number" || this.props.inputType=="positiveInteger")) {
                //数字,或者正数时
                if(inputVal=="-"|| !Object.is(NaN,Number(inputVal)))
                {
                    saveVal = inputVal; //第一次输入负号,或者输入小数点时原来没有小数点或为空时）时.不回传给父组件
                }
                if((this.props.inputType=="integer" || this.props.inputType=="positiveInteger") &&  inputVal.indexOf(".")>=0){
                    saveVal = this.state[refVal];
                }
                if(this.props.inputType=="positiveInteger" && inputVal.indexOf("-")==0){
                    saveVal = "";
                }
                submitVal = refVal=="minValue"? (saveVal + "," + this.state.maxValue):(this.state.minValue + "," + saveVal);

                this.setState({
                    [refVal]: saveVal,
                    value:submitVal
                });
            }
            if (this.props.onChange != null) {
                this.props.onChange(submitVal);//自定义的改变事件
            }
            //回传给表单组件,下拉组件使用onSelect回传给表单组件
            if (this.props.backFormHandler != null) {
                this.props.backFormHandler(submitVal, submitVal, this.props.name);

            }  

        }

    },
    keyDownHandler:function(event) {//控制输入
        this.validateInput=true;
        if(this.props.inputType=="integer"||this.props.inputType=="number" || this.props.inputType=="positiveInteger")
        {
            if(((event.ctrlKey==false&&event.metaKey==false)&&event.keyCode>=65&&event.keyCode<=90))
            {//防止ctrl,command键
                this.validateInput=false;
            }
        }
    },
    blurHandler:function( refVal,event) {
        this.validate();
    },
    getValue:function () {//获取值
        return  this.state.minValue + ","+this.state.maxValue;
    },
    setStateValue:function(){
        this.setState( {
            value:this.getValue()
            }
        );
    },

    /*
     * 显示快速选择下拉
     * */
    showQuickSlect:function(){
        this.setState({
            showQuickSlectFlag:true
        });
    },
    /*
     * 隐藏快速选择下拉
     * */
    hideQuickSlect:function(){
        this.setState({
            showQuickSlectFlag:false
        });
    },
    /*下拉列表选择*/
    onSelect:function(value){
        let valueArr = value.split(",");
        this.setState({
            minValue: valueArr[0],
            maxValue: valueArr[1],
            value:value,
            showQuickSlectFlag:false
        });
        if (this.props.onChange != null) {
            this.props.onChange(value);//自定义的改变事件
        }
        //回传给表单组件,下拉组件使用onSelect回传给表单组件
        if (this.props.backFormHandler != null) {
            this.props.backFormHandler(value, value, this.props.name);

        }
    },
    render:function() {

        var size=this.props.onlyline==true?"onlyline":this.props.size;//组件大小
        var componentClassName=  "wasabi-form-group "+size+" "+(this.props.componentClassName!=null?this.props.componentClassName:"");//组件的基本样式
        var controlStyle=this.props.controlStyle?this.props.controlStyle:{};
        controlStyle.display = this.state.hide == true ? "none" : "block";
        let inputProps=
            {
                readOnly:this.state.readonly==true?"readonly":null,
                placeholder:(this.props.placeholder===""||this.props.placeholder==null)?this.state.required?"必填项":"":this.props.placeholder,
                className:"wasabi-form-control  "+(this.props.className!=null?this.props.className:""),
                title:this.props.title,

            }//文本框的属性
        let hasQuickSelect = this.props.data instanceof Array && this.props.data.length>0;
        let rangeWrapCls = "range-wrap "+(hasQuickSelect?"has-quick-select":"");
        
         var   control = (  
             <div className={rangeWrapCls}>
             <input  ref="minInput" type="text"   {...inputProps}
                              onChange={this.changeHandler.bind(this,"minValue")} onKeyDown={this.keyDownHandler.bind(this,"minValue")}
                              onBlur={this.blurHandler.bind(this,"minValue")}
                              value={this.state.minValue}></input>
                 <span className="seperation">--</span>
             <input  ref="maxInput" type="text"   {...inputProps}
            onChange={this.changeHandler.bind(this,"maxValue")} onKeyDown={this.keyDownHandler.bind(this,"maxValue")}
            onBlur={this.blurHandler.bind(this,"maxValue")}
            value={this.state.maxValue}></input>
             <input type="button" onClick={this.showQuickSlect} value="..." className="wasabi-button green size-default"></input>
                 <div className="quick-select-wrap" style={this.state.showQuickSlectFlag?{display:"block"}:{}}>
                     <label><span>快速选择</span> <i onClick={this.hideQuickSlect} className="icon-close"></i></label>
                     <ul>
                         {
                             this.props.data.map((item, i)=> {
                                 return  <li key={item.value+i}  onClick={this.onSelect.bind(this,item.value)}>{item.text}</li>;
                             })
                         }
                     </ul>
                 </div>
         </div>
         );

        return (<div className={componentClassName+this.state.validateClass} onPaste={this.onPaste} style={ controlStyle}>
                <Label name={this.props.label} ref="label" hide={this.state.hide} required={this.state.required}></Label>
                <div className={ "wasabi-form-group-body"} style={{width:!this.props.label?"100%":null}}>
                    {control}
                    <small className={"wasabi-help-block "+this.props.position} style={{display:(this.state.helpTip&&this.state.helpTip!="")?this.state.helpShow:"none"}}>
                        <div className="text">{this.state.helpTip}</div></small>
                </div>
            </div>
        )
    }
});
module .exports=TextRange;