/**
 * Created by zhiyongwang
 * date:2016-04-05后开始独立改造
 * 下拉框
 */
require("../Sass/Form/Select.scss");
let React=require("react");
let unit=require("../libs/unit.js");
var FetchModel=require("../Model/FetchModel.js");
var validation=require("../Lang/validation.js");
let setStyle=require("../Mixins/SetStyle.js");
var validate=require("../Mixins/Validate.js");
var showUpdate=require("../Mixins/showUpdate.js");
var shouldComponentUpdate=require("../Mixins/shouldComponentUpdate.js");
var Label=require("../Unit/Label.jsx");
var Message=require("../Unit/Message.jsx");
var ClickAway=require("../Unit/ClickAway.js");
let Select=React.createClass({
    mixins:[setStyle,validate,showUpdate,shouldComponentUpdate,ClickAway],
    PropTypes:{
        name:React.PropTypes.string.isRequired,//字段名
        label:React.PropTypes.oneOfType([React.PropTypes.string,React.PropTypes.element,React.PropTypes.node]),//字段文字说明属性
        width:React.PropTypes.number,//宽度
        height:React.PropTypes.number,//高度
        value:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string]),//默认值,
        text:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string,React.PropTypes.element]),//默认文本值
        placeholder:React.PropTypes.string,//输入框预留文字
        readonly:React.PropTypes.bool,//是否只读
        required:React.PropTypes.bool,//是否必填
        onlyline:React.PropTypes.bool,//是否只占一行
        hide:React.PropTypes.bool,//是否隐藏
        regexp:React.PropTypes.string,//正则表达式
        invalidTip:React.PropTypes.string,//无效时的提示字符
        style:React.PropTypes.object,//自定义style
        componentClass:React.PropTypes.string,//自定义class
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

        //其他属性
        min:React.PropTypes.number,//最少选择几个
        max:React.PropTypes.number,//最多选择几个
        onClick: React.PropTypes.func,//自定义单击事件，这样就可以将普通下拉框组合其他组件

        //其他属性
        multiple:React.PropTypes.bool,//是否允许多选
        valueField: React.PropTypes.string,//数据字段值名称
        textField:React.PropTypes.string,//数据字段文本名称
        shortTextField:React.PropTypes.string,//数据字段简写文本名称
        url:React.PropTypes.string,//ajax的后台地址
        params:React.PropTypes.object,//查询参数
        dataSource:React.PropTypes.string,//ajax的返回的数据源中哪个属性作为数据源,为null时直接后台返回的数据作为数据源
        data:React.PropTypes.array,//自定义数据源
        extraData:React.PropTypes.array,//额外的数据,对url有效
        onSelect: React.PropTypes.func,//选中后的事件，回传，value,与text,data
        addAbled:React.PropTypes.bool,//是否允许自动添加
        addHandler:React.PropTypes.func,//添加后的回调  
        onBeforeSelect:React.PropTypes.func,//选择之前的事件
        enableInput:React.PropTypes.bool,//是否允许用户自定义输入(用户输入的值提交数据.默认不允许-必须选择下拉框中的值)

        exceptValue:React.PropTypes.string,//排除显示的数据(字符串类型,直接跟valueField对应的值做匹配)

        hideClearIcon:React.PropTypes.bool,//是否隐藏 清除icon
    },
    getDefaultProps:function() {
        return{
            name:"",
            label:null,
            width:null,
            height:null,
            value:"",
            text:"",
            placeholder:"",
            readonly:false,
            required:false,
            onlyline:false,
            hide:false,
            regexp:null,
            invalidTip:null,
            style:null,
            className:"",
            componentClass:"",
            size:"default",
            position:"default",
            //其他属性
            min:null,
            max:null,
            onClick:null,
            //其他属性
            multiple:false,
            valueField:"value",
            textField:"text",
            shortTextField:"",
            url:null,
            params:null,
            dataSource:"data",
            data:null,
            extraData:null,
            onSelect:null,
            writable:false,
            addAbled:false,
            addHandler:null,
            enableInput:false,
            exceptValue:null,
            hideClearIcon:false,
        };
    },
    getInitialState:function() {
        var newData=[];var text=this.props.text;
        if(this.props.data&&this.props.data instanceof  Array)
        {
            for(let i=0;i<this.props.data.length;i++)
            {
                let obj=this.props.data[i];
                obj.text=this.props.data[i][this.props.textField];
                obj.value=this.props.data[i][this.props.valueField];
                if(obj.value==this.props.value)
                {
                    text=obj.text;//根据value赋值
                }
                newData.push(obj);
            }
        }

        return {
            hide:this.props.hide,
            params:unit.clone(this.props.params),//参数
            data:newData,
            value:this.props.value,
            text:text,
            show:false,//是否显示下拉选项
            multiple:this.props.multiple,
            min:this.props.min,
            max:this.props.max,
            readonly:this.props.readonly,

            //验证
            required:this.props.required,
            validateClass:"",//验证的样式
            helpShow:"none",//提示信息是否显示
            helpTip:validation["required"],//提示信息
            invalidTip:"",
            filterValue:null,//筛选框的值

            exceptValue:this.props.exceptValue,
        }
    },
    componentWillReceiveProps:function(nextProps) {
        /*
         this.isChange :代表自身发生了改变,防止父组件没有绑定value,text,而导致无法选择
         */

        var value=this.isChange?this.state.value: nextProps.value;
        var text = this.isChange?this.state.text: nextProps.text;
        this.isChange=false;//重置
        var newData = null;
        if(nextProps.data!=null&&nextProps.data instanceof  Array &&(!nextProps.url||nextProps.url=="")) {//没有url,传的是死数据
            newData=[];
            //因为这里统一将数据进行了改造,所以这里要重新处理一下
            for (let i = 0; i < nextProps.data.length; i++) {
                let obj = nextProps.data[i];
                obj.text = nextProps.data[i][this.props.textField];
                obj.value = nextProps.data[i][this.props.valueField];
                if (obj.value == nextProps.value) {
                    text = obj.text;//根据value赋值
                }
                newData.push(obj);
            }

        }
        else {//url形式
            newData = this.state.data;//先得到以前的数据
            if (this.showUpdate(nextProps.params)) {//如果不相同则更新
                this.loadData(this.props.url, nextProps.params);//异步更新
            }
            else {

            }
        }

        this.setState({
            hide:nextProps.hide,
            value:value,
            text:text,
            data: newData,
            params:unit.clone( nextProps.params),
            multiple: nextProps.multiple,
            min: nextProps.min,
            max: nextProps.max,
            readonly: nextProps.readonly,
            required: nextProps.required,
            validateClass:"",//重置验证样式
            helpTip:validation["required"],//提示信息
            filterValue:null,
            exceptValue:nextProps.exceptValue,
        })

    },
    componentWillMount:function() {//如果指定url,先查询数据再绑定
        this.loadData(this.props.url,this.state.params);//查询数据
    },
    componentDidMount:function () {

        this.registerClickAway(this.hideOptions, this.refs.select);//注册全局单击事件
    },
    componentDidUpdate:function() {
        if(this.isChange==true)
        {//说明已经改变了,回传给父组件
            if( this.props.onSelect!=null)
            {
                this.props.onSelect(this.state.value,this.state.text,this.props.name,this.rowData);
            }
        }
    },


    loadData:function(url,params) {
        if(url!=null&&url!="")
        {
            if(params==null)
            {
                var fetchmodel=new FetchModel(url,this.loadSuccess,null,this.loadError);
                unit.fetch.get(fetchmodel);
            }
            else

            {
                var fetchmodel=new FetchModel(url,this.loadSuccess,params,this.loadError);
                unit.fetch.post(fetchmodel);
            }
        }
    },
    loadSuccess:function(data) {//数据加载成功
        var realData=data;
        if(this.props.dataSource==null) {
        }
        else {
            realData=unit.getSource(data,this.props.dataSource);
        }
        var newData=[];var text=this.state.text;
        for(let i=0;i<realData.length;i++)
        {
            let obj=realData[i];//将所有字段添加进来
            obj.text=realData[i][this.props.textField];
            obj.value=realData[i][this.props.valueField];
            if(this.props.shortTextField){
                obj.shortText=realData[i][this.props.shortTextField];  //文本简称
            }
            if(obj.value==this.state.value)
            {
                text=obj.text;//根据value赋值
            }
            newData.push(obj);
        }
        if(this.props.extraData==null||this.props.extraData.length==0)
        {
            //没有额外的数据
        }
        else
        {
            //有额外的数据
            for(let i=0;i<this.props.extraData.length;i++)
            {
                let obj={};
                obj.text=this.props.extraData[i][this.props.textField];
                obj.value=this.props.extraData[i][this.props.valueField];
                if(obj.value==this.state.value)
                {
                    text=obj.text;//根据value赋值
                }
                newData.unshift(obj);
            }
        }
        window.localStorage.setItem(this.props.name+'data' ,JSON.stringify(newData));//用于后期获取所有数据

        this.setState({
            data:newData,
            value:this.state.value,
            text:text,
        })
    },
    loadError:function(errorCode,message) {//查询失败
        Message. error(message);
    },
    showOptions:function(type) {//显示下拉选项
        if (this.state.readonly) {
            return;
        }
        if (this.props.onClick != null) {
            this.props.onClick();
        }
        this.setState({
            show: type==1?!this.state.show:true,
        });
        this.bindClickAway();//绑定全局单击事件
        this.props.togglePicker && this.props.togglePicker(type==1?!this.state.show:true);  //展示或关闭时，给父组件一个回调
    },
    hideOptions:function (event) {
        this.setState({
            show: false
        });
        this.props.togglePicker && this.props.togglePicker(false);  //展示或关闭时，给父组件一个回调
        this.unbindClickAway();//卸载全局单击事件
    },

    onSelect:function(value,text,rowData) {//选中事件
        if(text instanceof Object){//select组件传的text不是一个字符串
            text=text.props.title;
        };

        if((this.props.onBeforeSelect&&value!=this.state.value&&this.props.onBeforeSelect(value,text,rowData))||!this.props.onBeforeSelect)
        {//选择之前的确定事件返回true,或者没有

            this.isChange=true;//代表自身发生了改变,防止父组件没有绑定value,text的状态值,而导致无法选择的结果
            this.rowData=rowData;//临时保存起来
            var newvalue = "";
            var newtext = "";
            if(value==undefined)
            {
                console.error("绑定的valueField没有")
            }
            if(text==undefined)
            {
                console.error("绑定的textField没有");
            }
            if(this.state.multiple) {

                var oldvalue =[];
                var oldtext =[];
                if(this.state.value)
                {
                    oldvalue=this.state.value.toString().split(",");
                    oldtext=this.state.text.toString().split(",");
                }
                if (oldvalue.indexOf(value.toString()) > -1) {//取消选中
                    oldvalue.splice(oldvalue.indexOf(value.toString()),1);
                    oldtext.splice(oldvalue.indexOf(value.toString()),1);
                    newvalue=oldvalue.join(",");
                    newtext=oldtext.join(",");
                }
                else {//选中
                    if(this.state.value&&value!="")//多选的情况下   如果用户选择全部 则直接搜索条件直接设置成全部
                    {
                        newvalue = this.state.value + "," + value;
                        newtext = this.state.text + "," + text;
                    }
                    else
                    {
                        newvalue = value;
                        newtext =  text;
                    }

                }
                this.setState({
                    value:newvalue,
                    text:newtext,
                });
            }
            else
            {
                var newvalue = value;
                var newtext = text;
                this.setState({
                    show:false,
                    value:newvalue,
                    text:newtext,
                    filterValue:null,
                });
            }
            this.validate(newvalue);//
        }


    },
    getComponentData:function() {//只读属性，获取当前下拉的数据源
        return this.state.data;
    },
    getCurrentRowDataByName:function () {
        var returnData=null;
        if(this.state.data instanceof Array && this.state.data.length>0){
            for(var i=0;i<this.state.data.length;i++){
                if(this.state.data[i][this.props.valueField]==this.state.value){
                    returnData=this.state.data[i];
                    break;
                }
            }
        }
      return  returnData;
    },
    onBlur:function () {

        this.refs.label.hideHelp();//隐藏帮助信息

        if(this.props.enableInput){//允许自定义输入 (组件属性enableInput为true,则用户在输入框中键入值后,失去焦点时,则把该键入值作为当前输入框值)
            var changeValue=this.state.filterValue!=null?this.state.filterValue:this.state.value;
            this.props.onBlur&&this.props.onBlur(changeValue,changeValue,this.props.name,this.rowData);//value text name data
        }
    },

    keyUpHandler:function(event) {
        if(this.props.addAbled&&event.keyCode==13) {
            var filter=this.state.data.filter((item,index)=>{
                return item.text==event.target.value;
            })
            if(filter.length==0)
            {


                this.state.data.push({
                    value:event.target.value,
                    text:event.target.value,
                })
                this.setState({
                    data:this.state.data,
                })
                if(this.props.addHandler){
                    this.props.addHandler(this.state.data);
                }
            };

        }
    },
    filterChangeHandler:function(event) {//筛选查询
        this.setState({
            filterValue:event.target.value,
            show:true,
        })
        this.refs.ul.scrollTop=0;//回到顶部
    },
    clearHandler:function() {//清除数据
        if(this.props.onSelect!=null)
        {
            this.props.onSelect("","",this.props.name,null);
        }
        else
        {
            this.setState({
                value:null,
                text:null,
            })
        }
    },
    render:function() {
        var size=this.props.onlyline==true?"onlyline":this.props.size;//组件大小
        var componentClassName=  `wasabi-form-group ${size} ${this.props.componentClass}`;//组件的基本样式
        var style =this.setStyle("input");//设置样式
        var controlStyle=this.props.controlStyle?this.props.controlStyle:{};
        controlStyle.display = this.state.hide == true ? "none" : "block";
        let inputProps=
        {
            readOnly:this.state.readonly==true?"readonly":null,
            style:style,
            name:this.props.name,
            placeholder:(this.props.placeholder===""||this.props.placeholder==null)?this.state.required?"必填项":"":this.props.placeholder,
            className:"wasabi-form-control  "+(this.props.className!=null?this.props.className:""),
            title:this.props.title,

        }//文本框的属性
        var control=null;
        var text=[];
        if(this.state.data&&this.state.data.length>0) {
            control = <ul style={{display:this.state.show==true?"block":"none"}}  ref="ul" >
                {
                    this.state.data.map((child, i)=> {
                        var reg= new RegExp(this.state.filterValue,"i");
                       if(this.state.filterValue && ((child.text+"").search(reg)==-1 && (!child.shortText ||(child.shortText && (child.shortText+"").search(reg)==-1)))){
                            //匹配名称与简称
                            return ;    
                        }
                        else {
                            //TODO 这里要用正则，先保留
                            if(this.state.exceptValue!=null&&typeof this.state.exceptValue=="string"&&((","+this.state.exceptValue+",").indexOf(","+child.value+",")>-1)){
                                return ;
                            }else{
                                var checked = false;
                                //用indexof的原因是需要考虑多选的情况
                                if ((this.state.value !== null && this.state.value !== undefined && this.state.value !== "" && child.value !== "") && (("," + this.state.value.toString()+",").indexOf("," + child.value+",") > -1)) {
                                    checked = true;
                                }
                                else if (this.state.value === "" && child.value === "") {
                                    checked = true;
                                }
                                if(checked){
                                    if(child.text instanceof Object){
                                        text.push(child.text.props.title)
                                    }else{
                                        text.push(child.text);//得到当前value值对应的文本值
                                    }
                                }
                                let showText =child.text;
                                if(child.shortText){// 是否有简称
                                    showText += `(${child.shortText})`;
                                }
                                return (
                                    <li key={"li" + i} className={checked == true ? "active" : ""}
                                        onClick={this.onSelect.bind(this, child.value, child.text, child)}>{showText}</li>
                                )
                            }
                        }
                    })

                }
            </ul>;
        }
        if(text.length==0){
            text.push(this.state.text); // 如果没有匹配到，就显示通过父组件传进来的text
        }
        let clearStyObj = {display:this.state.readonly||this.props.hideClearIcon||this.props.required?"none":(this.state.value==""||!this.state.value)?"none":"inline"}

        return (
            <div className={componentClassName+this.state.validateClass}  ref="select" style={ controlStyle}  >
                <Label name={this.props.label} ref="label" hide={this.state.hide} required={this.state.required}></Label>
                <div className={ "wasabi-form-group-body"} >
                    <div className={"nice-select "}  style={style}    >  
                        <i className={"picker-clear"} onClick={this.clearHandler} style={clearStyObj}></i>
                        <i className={"icon "+(this.state.show?"rotate":"")} onClick={this.showOptions.bind(this,1)}></i>
                        <input ref="inputtxt" type="text" {...inputProps} title={this.props.addAbled?"输入搜索，回车添加":"输入搜索"}  onKeyUp={this.keyUpHandler} value={this.state.filterValue!=null?this.state.filterValue:text.join(",")} onClick={this.showOptions.bind(this,2)} onBlur={this.onBlur}    onChange={this.filterChangeHandler}  />

                        {
                            control
                        }
                    </div>
                    <small className={"wasabi-help-block "+this.props.position} style={{display:(this.state.helpTip&&this.state.helpTip!="")?this.state.helpShow:"none"}}><div className="text">{this.state.helpTip}</div></small>
                </div>
            </div>

        );

    }

});
module.exports=Select;