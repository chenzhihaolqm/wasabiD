/*
 create by wangzy
 date:2016-05-23
 desc:级联选择组件
 采用了es6语法
 */
let React=require("react");
require("../Sass/Form/picker.scss");
let unit=require("../libs/unit.js");

let FetchModel=require("../Model/FetchModel.js");
let PickerModel=require("../Model/PickerModel.js");
var validation=require("../Lang/validation.js");
let setStyle=require("../Mixins/SetStyle.js");
var validate=require("../Mixins/Validate.js");
var showUpdate=require("../Mixins/showUpdate.js");
var shouldComponentUpdate=require("../Mixins/shouldComponentUpdate.js");
var Label=require("../Unit/Label.jsx");
var Message=require("../Unit/Message.jsx");
var ClickAway=require("../Unit/ClickAway.js");
var initSelProvinceVal = "";  //初始化时候的值，每次点击‘编辑’进来都会改变
var initSelCityVal = "";
var initSelDistinctVal = "";
var isSimpleMode = true; //默认为简单模式，当this.props.matchAddressUrl 设置有值时为复杂模式
var triggerPicker = "";  //触发下发的操作
let  Picker =  React.createClass({
    mixins:[setStyle,validate,showUpdate,shouldComponentUpdate,ClickAway],
    propTypes: {
        name:React.PropTypes.string.isRequired,//字段名
        label:React.PropTypes.oneOfType([React.PropTypes.string,React.PropTypes.element,React.PropTypes.node]),//字段文字说明属性
        title:React.PropTypes.string,//提示信息
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

        //其他属性
        valueField: React.PropTypes.string,//数据字段值名称
        textField:React.PropTypes.string,//数据字段文本名称
        url:React.PropTypes.string,//ajax的后台地址
        params:React.PropTypes.object,//查询参数
        dataSource:React.PropTypes.string,//ajax的返回的数据源中哪个属性作为数据源,为null时直接后台返回的数据作为数据源
        data:React.PropTypes.array,//自定义数据源
        onSelect: React.PropTypes.func,//选中后的事件，回传，value,与text,data

        //其他属性
        secondUrl:React.PropTypes.string,//第二层节点的后台地址,
        secondParams:React.PropTypes.object,//第二层节点的后台参数
        secondParamsKey:React.PropTypes.string,//第二层节点的后台参数中传递一级节点value值的参数名称
        thirdUrl:React.PropTypes.string,//第三层节点的后台地址，
        thirdParams:React.PropTypes.object,//第三层节点的后台参数
        thirdParamsKey:React.PropTypes.string,//第三层节点的后台参数中传递二级节点value值的参数名称
        matchAddressUrl:React.PropTypes.string,//模糊搜索匹配的URL地址，有这个参数该组件为复杂模式，否则为简单模式
        hotTitle:React.PropTypes.string,//热门选择标题
        hotData:React.PropTypes.array,//热门选择的数据
        hasDbSelect:React.PropTypes.bool,//是否具备双击选择操作
    },
    getDefaultProps :function(){
        return {
            name:"",
            label:null,
            title:null,
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
            className:null,
            size:"default",
            position:"default",

            //其他属性
            valueField:"value",
            textField:"text",
            url:null,
            params:null,
            dataSource:"data",
            data:null,
            onSelect:null,
            //其他属性
            secondUrl:null,
            secondParams:null,
            secondParamsKey:null,
            thirdUrl:null,
            thirdParams:null,
            thirdParamsKey:null,
            matchAddressUrl:null,
            hotTitle:"热门选择",
            hotData:null,
            hasDbSelect:false,
        }


    },
    getInitialState:function() {
        return {
            hide:this.props.hide,
            value:this.props.value,
            text:this.props.text,
            selectedText:this.props.text, //引入“复杂”模式时添加的，作用是跟input框输入改变时比较有没发生改变
            readonly:this.props.readonly,  

            //其他属性
            params:unit.clone( this.props.params),  
            provinceActiveIndex:null,//一级激活节点下标
            cityActiveIndex:null,//二级激活节点下标
            distinctActiveIndex:null,//三级激活节点下标
            show:false,//是否显示全部的地址
            showPart:false,//是否显示部分的地址
            //其他属性
            secondParams:this.props.secondParams,
            secondParamsKey:this.props.secondParamsKey,
            thirdParams:this.props.thirdParams,
            thirdParamsKey:this.props.thirdParamsKey,
            //验证
            required:this.props.required,
            validateClass:"",//验证的样式
            helpShow:"none",//提示信息是否显示
            helpTip:validation["required"],//提示信息
            invalidTip:"",
            matchAddressData:[], //搜索匹配到下拉data数据
        }
    },
    componentWillReceiveProps:function(nextProps) {
        isSimpleMode = !this.props.matchAddressUrl;
        if(nextProps.value !== this.state.value){   
            /*不相等时再加载，否则没必要*/
            this.initSelValRender(nextProps);//初始化时，有一个初始值；需要将初始值对应的children节点加载出来
        }

        let stateObj ={
            hide:nextProps.hide,
            value:nextProps.value,
            text:nextProps.text,
            selectedText:nextProps.text,
            readonly: nextProps.readonly,
            required: nextProps.required,
            params:unit.clone( nextProps.params),
            secondParams:nextProps.secondParams,
            secondParamsKey:nextProps.secondParamsKey,
            thirdParams:nextProps.thirdParams,
            thirdParamsKey:nextProps.thirdParamsKey,
            validateClass:"",//重置验证样式
            helpTip:validation["required"],//提示信息
            provinceActiveIndex:"",
            cityActiveIndex:"",
            distinctActiveIndex:"",
        }
        if(nextProps.data!=null&&nextProps.data instanceof  Array &&(!nextProps.url||nextProps.url=="")) {
            stateObj.data = nextProps.data,
            this.setState(stateObj);
        }
        else {
            if(this.showUpdate(nextProps.params))
            {//如果不相同则更新
                var fetchmodel=new FetchModel(this.props.url,this.loadProvinceSuccess,nextProps.params,this.loadError);
                unit.fetch.post(fetchmodel);
            }
            this.setState(stateObj);
        }
    },
    componentDidMount:function(){
        if(this.props.value){
            setTimeout(()=>{
                /*延迟加载，等待所有省份数据加载出来*/
                this.initSelValRender(this.props);//初始化时，有一个初始值；需要将初始值对应的children节点加载出来
            },1000)

        }
        if(this.props.url!=null) {
            var fetchmodel=new FetchModel(this.props.url,this.loadProvinceSuccess,this.state.params,this.loadError);
            unit.fetch.post(fetchmodel);
        }
        this.registerClickAway(()=>{
            this.setState({
                show: false,
                showPart: false,
            })
            this.unbindClickAway();//卸载全局单击事件
        }, this.refs.picker);//注册全局单击事件
    },

    /*
    *  初始化全局变量
    *  初始化时，有一个初始值；需要将初始值对应的children节点加载出来
    * */
    initSelValRender:function (nextProps) {
        /*防止缓存了之前的数据，当没有传值时，要先将expand=false*/
        if(this.state.data ){
            for(let item of this.state.data){
                item.expand = false;
                if(item.childrens && item.childrens.length){
                    for(let child of item.childrens){
                        child.expand = false;
                    }
                }
            }
        }
        if(nextProps.value){
            /*设置地址选中值*/
            try{
                let valueArr = nextProps.value.split(",");
                initSelProvinceVal = valueArr[0];
                initSelCityVal = valueArr[1];
                initSelDistinctVal = valueArr[2];
            }catch(e){
                console.log("地址转换出错！");
            }
            if(initSelProvinceVal){
                var fetchmodel=new FetchModel(this.props.secondUrl,(res)=>{
                    let cityData=[];//当前一级节点的二级节点数据
                    var realData=res.data;
                    var newData=this.state.data;
                    //获取真实数据
                    if(!this.props.dataSource) {
                        realData=unit.getSource(res.data,this.props.dataSource);
                    }
                    cityData=this.setPickerModel(realData);//生成二级节点数据模型
                    if(newData instanceof  Array && cityData instanceof  Array &&cityData.length>0) {//有数据
                        for(let i=0;i<newData.length;i++){
                            let item = newData[i];
                            if(item.value == initSelProvinceVal){
                                this.state.provinceActiveIndex = i;  //设置索引值,方便其他函数获取this.state.data嵌套的数据
                                item.expand = true;   //设置展开
                                item.childrens=cityData;//将查询的二级节点赋值给一级激活节点
                                if(initSelCityVal){
                                   this.initThirdValRender(cityData);
                                }
                                break;
                            }
                        }
                    }

                },{level: "CITY",parentCode: initSelProvinceVal});
                unit.fetch.post(fetchmodel);
            }
        }
    },
    /*
     *  初始化时，有一个初始值；需要将初始值对应的children节点加载出来
     *  初始化其中的三级地址展示
     * */
    initThirdValRender:function(cityData){
        var fetchmodel=new FetchModel(this.props.thirdUrl,function(res){
            let districtData=[];//当前二级节点的三级节点数据
            var realData=res.data;
            //获取真实数据
            if(!this.props.dataSource) {
                realData=unit.getSource(res.data,this.props.dataSource);
            }
            districtData=this.setPickerModel(realData);//生成二级节点数据模型
            if(districtData instanceof  Array &&districtData.length>0) {//有数据
                for(let j=0;j<cityData.length;j++){
                    let child = cityData[j];
                    if(child.value == initSelCityVal){
                        this.state.cityActiveIndex = j; //设置索引值,方便其他函数获取this.state.data嵌套的数据
                        child.expand = true;  //设置展开
                        child.childrens=districtData;//将查询的三级节点赋值给二级激活节点
                        break;
                    }
                }
            }
            this.setState({
                data:this.state.data
            });
        }.bind(this),{level: "DISTRICT",parentCode: initSelCityVal});
        unit.fetch.post(fetchmodel);
    },

    loadProvinceSuccess:function(data) {//一级节点的数据加载成功
        let provinceData=[];//一级节点数据
        var realData=data;
        //获取真实数据
        if(this.props.dataSource==null) {
        }
        else {
            realData=unit.getSource(data,this.props.dataSource);
        }
        provinceData=   this.setPickerModel(realData);//生成标准格式model
        this.setState({
            data:provinceData
        })
    },
    loadError:function(errorCode,message) {//查询失败
        Message. error(message);
    },
    changeHandler:function(event) {
        /*复杂模式时，inputChange才生效*/
        if(!isSimpleMode){
            this.setState({
                text:event.target.value,
            })  
        }
    },
    onBlur:function (event) {
        if(!isSimpleMode){
            setTimeout(()=>{  
                if( (""+this.state.text).trim() !== (""+this.state.selectedText).trim()){
                   /*this.state.text会因为inputChange事件而单独改变，当不同于selectedText时，会判定输入不合法，需清空*/
                    if(this.state.data ){
                        for(let item of this.state.data){
                            item.expand = false;  
                            if(item.childrens && item.childrens.length){
                                for(let child of item.childrens){
                                    child.expand = false;
                                }
                            }
                        }
                    } 
                    this.setState({
                        value:"",
                        text:"",
                        selectedText:"",
                        provinceActiveIndex:null,//一级激活节点下标
                        cityActiveIndex:null,//二级激活节点下标
                        distinctActiveIndex:null,//三级激活节点下标
                    });
                }
            },1000); //离开焦点1s后触发检查
        }
        this.refs.label.hideHelp();//隐藏帮助信息
    },

    /*
     * 回车搜索过滤
     * */
    onKeyUpSearch:function(event){
        if ( !isSimpleMode && event.target.value && event.keyCode == 13) {
            var fetchmodel=new FetchModel(this.props.matchAddressUrl,(obj)=>{
                if(obj.success){ 
                    let data = obj.data;
                    this.setState({
                        "matchAddressData":data,
                        showPart:true,
                    });
                    this.bindClickAway();//绑定全局单击事件
                }
            },{"address": event.target.value});
            unit.fetch.post(fetchmodel);
        }
    },
    /*
    * 点击选择过滤了的地址
    * */
    selectMatchAddress:function(addressObj,selectText){
        let selectValue = `${addressObj.provinceCode},${addressObj.cityCode},${addressObj.districtCode}`;
        if (this.props.onSelect != null) {
            this.props.onSelect(selectValue, selectText, this.props.name,null);
        }
        this.validate(selectValue);//验证
        this.setState({
            value:selectValue,
            text:selectText,
            selectedText:selectText,
            showPart:false
        })
    },
    /*
    * 点击输入框
    * */
    clickInput:function(){
        //triggerPicker = "input";
        if(isSimpleMode){
            this.showPicker(2);
        }
    },
    /*
    * 点击右侧旋转三角形按钮
     */
    clickRotateIcon:function(){
        if(isSimpleMode){
            this.showPicker(1);
        }
    },
    /*
     * 点击search-icon显示全部地址
     * */
    showAllAddress:function(){
        this.setState({
            showPart:false
        })
        this.showPicker(2);
    },

    showPicker:function(type) {//显示选择
        if (this.state.readonly) {
            //只读不显示
            return;
        }
        else {
            this.setState({
                show: type==1?!this.state.show:true
            })
        }
        this.bindClickAway();//绑定全局单击事件
    },
    hidePicker:function () {   
        this.setState({
            show: false
        }) 
        this.unbindClickAway();//卸载全局单击事件
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
                selectedText:null
            })
        }
    },
    setPickerModel:function(data) {//根据数据生成标准格式
        let realData = [];
        for (let index = 0; index < data.length; index++) {
            let pickerModel = new PickerModel(data[index][this.props.valueField],data[index][this.props.textField]);
            realData.push(pickerModel);
        }
        return realData;
    },
    activeHot:function(value,text) {
        this.setState({
            show:false,
            value:value,
            text:text,
            selectedText:text
        });
        this.validate(value);//验证
        if (this.props.onSelect != null) {
            this.props.onSelect(value, text, this.props.name);
        }
    },

    flodChildren:function (data) {//将节点折叠起来
        for(var index=0;index<data.length;index++)
        {
            data[index].expand=false;
            if(data[index].childrens &&data[index].childrens instanceof  Array)
            {
                data[index].childrens=  this.flodChildren(data[index].childrens);//遍历
            }
        }
        return data;
    },
    /*
    *  双击选择省份
    * */
    dbClickProvince:function(currentProvinceIndex,currentProvinceValue){
        if(this.props.hasDbSelect)
        {
            let proviceData =this.state.data;
            let selectValue=proviceData[currentProvinceIndex].value;
            let selectText=proviceData[currentProvinceIndex].text;
            this.setState({
                value:selectValue,
                text:selectText,
                selectedText:selectText,
                provinceActiveIndex:currentProvinceIndex,
                cityActiveIndex:null,
                distinctActiveIndex:null,
            })
            if (this.props.onSelect != null) {
                this.props.onSelect(selectValue, selectText, this.props.name,null);
            }
        }

    },
    clickProvince:function(currentProvinceIndex,currentProvinceValue){
        if(this.props.hasDbSelect){
            setTimeout(()=>{
                this.activeProvince(...arguments);
            },200); //双击延后
        }else{
            this.activeProvince(...arguments);
        }
    },
    activeProvince :function(currentProvinceIndex,currentProvinceValue) {//一级节点激活
        var newData=this.state.data;
        let selectValue=this.state.value;
        let selectText=this.state.text;
        if(this.state.provinceActiveIndex===currentProvinceIndex) {//当前节点为激活节点
            var newData=this.state.data;
            if((newData[currentProvinceIndex].childrens instanceof  Array)&&newData[currentProvinceIndex].childrens.length>0) {
                //有子节点则不执行选中事件
                var expand=newData[currentProvinceIndex].expand;
                newData=  this.flodChildren(newData);//折叠
                newData[currentProvinceIndex].expand=!expand;//如果为展开状态则隐藏,否则展开

            }
            else {//没有则立即执行选中事件
                selectValue=newData[currentProvinceIndex].value;
                selectText=newData[currentProvinceIndex].text;
                if (this.props.onSelect != null) {
                    this.props.onSelect(selectValue, selectText, this.props.name,null);
                }

            }
            this.validate(selectValue);//验证
            this.setState({
                value:selectValue,
                text:selectText,
                selectedText:selectText,
                data:newData,
                provinceActiveIndex:currentProvinceIndex,
                cityActiveIndex:null,
                distinctActiveIndex:null,
            })
        }
        else {
            //当前节点不是激活节点
            if(this.props.secondUrl) {//存在二级节点url
                let url=this.props.secondUrl;
                let params=this.state.secondParams;
                if(typeof  params =="object")
                {//判断是否为对象
                    params[this.state.secondParamsKey]=currentProvinceValue;
                }
                else
                {
                    params={};
                    if(this.state.secondParamsKey!=null)
                    {
                        params[this.state.secondParamsKey]=currentProvinceValue;
                    }
                }
                var fetchmodel=new FetchModel(url,this.loadCitySuccess.bind(this,currentProvinceIndex),params,this.loadError);
                unit.fetch.post(fetchmodel);  
            }
            else {//没有二级节点的url
                var newData=this.state.data;

                var expand= newData[currentProvinceIndex].expand;
                newData= this.flodChildren(newData);//折叠
                newData[currentProvinceIndex].expand=!expand;

                if((newData[currentProvinceIndex].childrens instanceof  Array)&&newData[currentProvinceIndex].childrens.length>0) {
                    //有子节点则不执行选中事件
                }
                else {//没有则立即执行选中事件
                    selectValue=newData[currentProvinceIndex].value;
                    selectText=newData[currentProvinceIndex].text;
                    if (this.props.onSelect != null) {
                        this.props.onSelect(selectValue, selectText, this.props.name,null);
                    }

                }
                this.validate(selectValue);//验证
                this.setState({
                    value:selectValue,
                    text:selectText,
                    selectedText:selectText,
                    data:newData,
                    provinceActiveIndex:currentProvinceIndex,
                    cityActiveIndex:null,
                    distinctActiveIndex:null,
                })
            }
        }


    },
    loadCitySuccess:function(currentProviceIndex,data) {//二级节点的数据加载成功
        let cityData=[];//当前一级节点的二级节点数据
        var realData=data;
        var newData=this.state.data;
        let selectValue=this.state.value;
        let selectText=this.state.text;
        //获取真实数据
        if(this.props.dataSource==null) {
        }
        else {  
            realData=unit.getSource(data,this.props.dataSource);
        }
        cityData=this.setPickerModel(realData);//生成二级节点数据模型
        if(cityData instanceof  Array &&cityData.length>0) {//有数据
            newData[currentProviceIndex].childrens=cityData;//将查询的二级节点赋值给一级激活节点
            var expand=newData[currentProviceIndex].expand;
            newData=this.flodChildren(newData);//折叠
            newData[currentProviceIndex].expand=!expand;//当前一级节点展开


        }
        else {//没有数据,则直接执行选择事件
            selectValue=newData[currentProviceIndex].value;
            selectText=newData[currentProviceIndex].text;
            if (this.props.onSelect != null) {
                this.props.onSelect(selectValue, selectText, this.props.name,null);
            }
        }
        this.validate(selectValue);//验证
        this.setState({
            value:selectValue,
            text:selectText,
            selectedText:selectText,
            data:newData,
            provinceActiveIndex:currentProviceIndex,
            cityActiveIndex:null,
            distinctActiveIndex:null,
        })

    },
    /*
     *  双击选择市
     * */
    dbClickCity:function(currentProvinceIndex,currentCityIndex,currentCityValue){
        if(this.props.hasDbSelect){
            let proviceData =this.state.data;
            let selectValue=proviceData[this.state.provinceActiveIndex].value+","+proviceData[this.state.provinceActiveIndex].childrens[currentCityIndex].value;
            let selectText=proviceData[this.state.provinceActiveIndex].text+","+proviceData[this.state.provinceActiveIndex].childrens[currentCityIndex].text;
            this.setState({
                value:selectValue,
                text:selectText,
                selectedText:selectText,
                provinceActiveIndex:currentProvinceIndex,
                cityActiveIndex:currentCityIndex,
                distinctActiveIndex:null,
            })
            if (this.props.onSelect != null) {
                this.props.onSelect(selectValue, selectText, this.props.name,null);
            }
        }
    },
    clickCity:function(currentProvinceIndex,currentCityIndex,currentCityValue){//二级节点激活
        if(this.props.hasDbSelect){
            setTimeout(()=>{
                this.activeCity(...arguments);
            },200); //双击延后
        }else{
            this.activeCity(...arguments);
        }
    },
    activeCity:function(currentProvinceIndex,currentCityIndex,currentCityValue) {//二级节点激活

        var newData=this.state.data;
        let selectValue=this.state.value;
        let selectText=this.state.text;
        if(this.state.provinceActiveIndex===currentProvinceIndex&&this.state.cityActiveIndex===currentCityIndex){
            //当前节点为激活节点
            if((newData[this.state.provinceActiveIndex].childrens[currentCityIndex].childrens instanceof  Array)&&newData[this.state.provinceActiveIndex].childrens[currentCityIndex].childrens.length>0) {
                //有子节点(三级节点)则不执行选中事件
                var expand=newData[this.state.provinceActiveIndex].childrens[currentCityIndex].expand;
                newData=this.flodChildren(newData);//折叠
                newData[this.state.provinceActiveIndex].expand=true;//一级节点展开
                newData[this.state.provinceActiveIndex].childrens[currentCityIndex].expand=!expand;//如果为展开状态则隐藏,否则展开
            }
            else {//没有则立即执行选中事件
                selectValue=newData[this.state.provinceActiveIndex].value+","+newData[this.state.provinceActiveIndex].childrens[currentCityIndex].value;
                selectText=newData[this.state.provinceActiveIndex].text+","+newData[this.state.provinceActiveIndex].childrens[currentCityIndex].text;
                if (this.props.onSelect != null) {
                    this.props.onSelect(selectValue, selectText, this.props.name,null);
                }
            }
            this.validate(selectValue);//验证
            this.setState({
                value:selectValue,
                text:selectText,
                selectedText:selectText,
                data:newData,
                cityActiveIndex:currentCityIndex,
                distinctActiveIndex:null,
            });


        }
        else
        {
            if(this.props.thirdUrl) {//存在三级节点url
                let url=this.props.thirdUrl;
                let params=this.state.thirdParams;
                if(typeof  params =="object")
                {//判断是否为对象
                    params[this.state.thirdParamsKey]=currentCityValue;
                }
                else
                {
                    params={};
                    if(this.state.thirdParamsKey!=null)
                    {
                        params[this.state.thirdParamsKey]=currentCityValue;
                    }
                }
                var fetchmodel=new FetchModel(url,this.loadDistinctSuccess.bind(this,currentCityIndex),params,this.loadError);
                unit.fetch.post(fetchmodel);
            }
            else {

                for(let index=0;index<newData[this.state.provinceActiveIndex].childrens.length;index++)
                {
                    newData[this.state.provinceActiveIndex].childrens[index].expand=false;
                }
                var expand=newData[this.state.provinceActiveIndex].childrens[currentCityIndex].expand;
                newData= this.flodChildren(newData);//折叠

                newData[this.state.provinceActiveIndex].expand=true;//一级节点展开
                newData[this.state.provinceActiveIndex].childrens[currentCityIndex].expand=!expand;

                if((newData[this.state.provinceActiveIndex].childrens[currentCityIndex].childrens instanceof  Array)&&newData[this.state.provinceActiveIndex].childrens[currentCityIndex].childrens.length>0) {
                    //有子节点(三级节点)则不执行选中事件
                }
                else {//没有则立即执行选中事件
                    selectValue=newData[this.state.provinceActiveIndex].value+","+newData[this.state.provinceActiveIndex].childrens[currentCityIndex].value;
                    selectText=newData[this.state.provinceActiveIndex].text+","+newData[this.state.provinceActiveIndex].childrens[currentCityIndex].text;
                    if (this.props.onSelect != null) {
                        this.props.onSelect(selectValue, selectText, this.props.name,null);
                    }
                }
                this.validate(selectValue);//验证
                this.setState({
                    value:selectValue,
                    text:selectText,
                    selectedText:selectText,
                    data:newData,
                    cityActiveIndex:currentCityIndex,
                    distinctActiveIndex:null,
                });
            }
        }

    },
    loadDistinctSuccess:function(currentCityIndex,data){//三级节点查询成功
        let distinctData=[];//当前二级节点的二级节点数据
        var realData=data;
        let selectValue=this.state.value;
        let selectText=this.state.text;
        //获取真实数据
        if(this.props.dataSource==null) {
        }
        else {
            realData=unit.getSource(data,this.props.dataSource);
        }
        distinctData=this.setPickerModel(realData);//生成二级节点数据模型
        var newData=this.state.data;
        if(distinctData instanceof  Array &&distinctData.length>0) {//有数据
            for(var index=0;index<newData[this.state.provinceActiveIndex].childrens.length;index++)
            {
                newData[this.state.provinceActiveIndex].childrens[index].expand=false;
            }   
            newData[this.state.provinceActiveIndex].childrens[currentCityIndex].childrens=distinctData;//将查询的三级节点赋值给二级激活节点
            var expand=  newData[this.state.provinceActiveIndex].childrens[currentCityIndex].expand;
            newData= this.flodChildren(newData);//折叠
            newData[this.state.provinceActiveIndex].expand=true;//一级节点展开
            newData[this.state.provinceActiveIndex].childrens[currentCityIndex].expand=!expand;

        }
        else
        {
            selectValue=newData[this.state.provinceActiveIndex].value+","+newData[this.state.provinceActiveIndex].childrens[currentCityIndex].value;
            selectText=newData[this.state.provinceActiveIndex].text+","+newData[this.state.provinceActiveIndex].childrens[currentCityIndex].text;
            if (this.props.onSelect != null) {
                this.props.onSelect(selectValue, selectText, this.props.name,null);
            }   
        }
        this.validate(selectValue);//验证
        this.setState({
            value:selectValue,
            text:selectText,
            selectedText:selectText,
            data:newData,
            cityActiveIndex:currentCityIndex,
            distinctActiveIndex:null,

        })

    },
    activeDistinct:function(currentDistinctIndex) {//三级节点激活
        var newData=this.state.data;
        let selectValue=this.state.value;
        let selectText=this.state.text;
        for(let index=0;index< newData[this.state.provinceActiveIndex].childrens[this.state.cityActiveIndex].childrens.length;index++)
        {
            newData[this.state.provinceActiveIndex].childrens[this.state.cityActiveIndex].childrens[index].expand=false;
        }
        newData=this.flodChildren(newData);//折叠
        newData[this.state.provinceActiveIndex].expand=true; newData[this.state.provinceActiveIndex].childrens[this.state.cityActiveIndex].expand=true;
        newData[this.state.provinceActiveIndex].childrens[this.state.cityActiveIndex].childrens[currentDistinctIndex].expand=true;
        selectValue=newData[this.state.provinceActiveIndex].value +","
            +newData[this.state.provinceActiveIndex].childrens[this.state.cityActiveIndex].value+","
            +newData[this.state.provinceActiveIndex].childrens[this.state.cityActiveIndex].childrens[currentDistinctIndex].value;
        selectText=newData[this.state.provinceActiveIndex].text +","
            +newData[this.state.provinceActiveIndex].childrens[this.state.cityActiveIndex].text+","
            +newData[this.state.provinceActiveIndex].childrens[this.state.cityActiveIndex].childrens[currentDistinctIndex].text;

        if (this.props.onSelect != null) {
            this.props.onSelect(selectValue, selectText, this.props.name,null);
        }
        this.validate(selectValue);//验证
        this.setState({
            value:selectValue,
            text:selectText,
            selectedText:selectText,
            data:newData,
            distinctActiveIndex:currentDistinctIndex,
        })
    },
    renderHot:function() {//热门选择
        if (this.props.hotData instanceof Array) {
            var controlArray = [];
            this.props.hotData.map((item, index)=> {
                controlArray.push(< li  key={"hot"+item.text} className="hot-item" onClick={this.activeHot.bind(this,item.value,item.text)} title={item.text}>{item.text}</li>);
            });
            return <div className="hot-wrap">
                <div>
                    <p style={{display:(this.props.hotTitle&&this.props.hotTitle!="")?"block":"none"}}>{this.props.hotTitle}</p>
                    <ul>{controlArray}</ul></div>
                <div className= "line" > </div >
            </div>
        }
        else {
            return null;
        }
    },
    renderProvince() {//一级节点渲染
        var provinceVal = "";
        if(this.state.value){
            provinceVal = this.state.value.split(",")[0];
        }
        var provinceComponents=[];
        if(this.state.data instanceof  Array)
        {
            this.state.data.map((child,index)=>
            {
                var left=(index%5)*-65;
                var expandCls = "";
                if(this.state.provinceActiveIndex||this.state.provinceActiveIndex===0){
                    //存在this.state.provinceActiveIndex，代表是用户已经选择过了
                    expandCls = this.state.provinceActiveIndex===index?"expand":"";
                }else{
                    /*否则，采用原来初始化选中的值*/
                    expandCls = provinceVal===child.value?"expand":"";
                }
                provinceComponents.push (<li key={"province"+index} className={"picker-container  "+ expandCls}>
                        <ul className="picker-container-wrap" style={{display:(child.expand?"block":"none"),left:left}}>
                            {
                                this.renderCity(index,child.childrens)
                            }
                        </ul>
                        <div className={"picker-container-name "+ expandCls} onDoubleClick={this.dbClickProvince.bind(this,index,child.value)} onClick={this.clickProvince.bind(this,index,child.value)} title={child.text}>{child.text}</div>
                    </li>
                );
            });
            return provinceComponents;
        }
        else
        {
            return null;
        }
    },
    renderCity:function(provinceIndex,cityData) {//二级节点渲染
        var cityComponents=[];
        if(cityData instanceof  Array)
        {
            var cityVal = "";
            if(this.state.value){
                cityVal = this.state.value.split(",")[1];
            }
            cityData.map((child,index)=>{
                var left=(index%4)*-80;
                if(index%4==0) {
                    left=-14;
                }
                var expandCls = "";
                if(this.state.cityActiveIndex || this.state.cityActiveIndex===0){
                    //存在this.state.cityActiveIndex，代表是用户已经选择过了
                    expandCls = this.state.cityActiveIndex===index?"expand":"";
                }else{
                    /*否则，采用原来初始化选中的值*/
                    expandCls = cityVal===child.value?"expand":"";
                }

                cityComponents.push (
                    <li key={"city"+index} className={"picker-container  "+ expandCls}>
                        <ul className="picker-container-wrap" style={{display:(child.expand?"block":"none"),left:left}}>
                            {
                                this.renderDistinct(child.childrens)
                            }
                        </ul>
                        <div className={"picker-container-name "+ expandCls} onDoubleClick={this.dbClickCity.bind(this,provinceIndex,index,child.value)} onClick={this.clickCity.bind(this,provinceIndex,index,child.value)} title={child.text}>{child.text}</div>
                    </li>
                )
            });
            return cityComponents;
        }else
        {
            return null;
        }

    },
    renderDistinct:function(distinctData) {//三级节点渲染
        var distinctComponents=[];
        if(distinctData instanceof  Array)
        {
            var distinctVal = "";
            if(this.state.value){
                distinctVal = this.state.value.split(",")[2];
            }

            distinctData.map((child,index)=>{
                var expandCls = "";
                if(this.state.distinctActiveIndex){
                    //存在this.state.distinctActiveIndex，代表是用户已经选择过了
                    expandCls = this.state.distinctActiveIndex===index?"expand":"";
                }else{
                    /*否则，采用原来初始化选中的值*/
                    expandCls = distinctVal===child.value?"expand":"";
                }
                distinctComponents.push (
                    <li key={"distinct"+index} className={"pickeritem "+ expandCls}  onClick={this.activeDistinct.bind(this,index,child.value)} title={child.text}>{child.text}</li>
                )
            });
            return distinctComponents;
        }else
        {
            return null;
        }
    },
    renderMatchAddressLis:function(){
        let control=null;
        if(this.state.matchAddressData&&this.state.matchAddressData.length) {
            control = <ul>
                {
                    this.state.matchAddressData.map((child, i)=> {
                        let showText = `${child.province},${child.city},${child.district}`;
                        return (
                            <li key={"mLi" + i} onClick={this.selectMatchAddress.bind(this,child,showText)} >{showText}</li>
                        )
                    })

                }
            </ul>;
        }else{
            control = <ul><li>匹配不到数据</li></ul>;
        }
        return control;
    },
    render:function() {
        var size=this.props.onlyline==true?"onlyline":this.props.size;//组件大小
        var componentClassName=  "wasabi-form-group "+size;//组件的基本样式
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
        //var control=this.renderProvince();

        let isActiveSearchIcon = !isSimpleMode;
        return (
            <div className={componentClassName+this.state.validateClass}  ref="picker"  style={ controlStyle}>
                <Label name={this.props.label} ref="label" hide={this.state.hide} required={this.state.required}></Label>
                <div className={ "wasabi-form-group-body " + (isSimpleMode?"":"complicated-picker")} style={{width:!this.props.label?"100%":null}}>
                    <div className="combobox"  style={{display:this.props.hide==true?"none":"block",width:isSimpleMode?"":"calc(100% - 35px)"}}   >
                        <i className={"picker-clear"} onClick={this.clearHandler} style={{display:this.state.readonly?"none":(this.state.value==""||!this.state.value)?"none":"inline"}}></i>
                        <i className={"pickericon " +(this.state.show?"rotate":"")} onClick={this.clickRotateIcon}></i>
                        <input type="text" {...inputProps} onBlur={this.onBlur} value={this.state.text} onKeyUp={this.onKeyUpSearch}  onClick={this.clickInput}  onChange={this.changeHandler}     />
                        <div className={"dropcontainter  picker "+this.props.position} style={{display:this.state.show==true?"block":"none"}}   >
                            <div className="picker">
                                <div className={"all-address-wrap"}>
                                    {this.renderHot()}
                                    <ul className="wrap" >
                                        <p>请选择地区</p>
                                        {
                                            this.renderProvince()
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={"match-lis-wrap " + (this.state.showPart?"active":"")}>
                            {this.renderMatchAddressLis()}
                        </div>
                    </div>
                    <i className={"wasabi-icon picker-icon-catalog icon-catalog " + (isSimpleMode?"":"active")} title={this.props.iconTip} onClick={this.showAllAddress}></i>
                    <small className={"wasabi-help-block "+this.props.position} style={{display:(this.state.helpTip&&this.state.helpTip!="")?this.state.helpShow:"none"}}><div className="text">{this.state.helpTip}</div></small>
                </div>
            </div>


        )
    }
});
module .exports=Picker;