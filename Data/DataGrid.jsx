/**
 *Created by wangzhiyong on 2016-04-05
 * desc:列表组件,由此组件开始独立重构所组件,不再依赖
 * wasabi框架的第一个组件
 * 2016-06-09后开始调整整个样式
 * 2017-01-04 注意了,这里渲染分页与复制的CopyDataGrid不一样，因为CopyDataGrid宽度比较小可能放不下
 *
 */
require("../Sass/Data/DataGrid.scss");
require("../Sass/Data/DataGridDetail.scss");
var React=require("react");
var unit=require("../libs/unit.js");
var FetchModel=require("../Model/FetchModel.js");
var HeaderModel=require("../Model/HeaderModel.js");
var Button=require("../Buttons/Button.jsx");
var LinkButton=require("../Buttons/LinkButton.jsx");
var CheckBox=require("../Form/CheckBox.jsx");
var Input=require("../Form/Input.jsx");
var Radio=require("../Form/Radio.jsx");
var Modal=require("../Layout/Modal.jsx");
var Message=require("../Unit/Message.jsx");
var Transfer=require("./Transfer.jsx");
var shouldComponentUpdate=require("../Mixins/shouldComponentUpdate.js");
var DataGridHandler=require("../Mixins/DataGridHandler.js");
var DataGridExtend=require("../Mixins/DataGridExtend.js");
var pasteExtend=require("../Mixins/pasteExtend.js");
var ClickAway=require("../Unit/ClickAway.js");
var showUpdate=require("../Mixins/showUpdate.js");
var regs=require("../Lang/regs.js");
var MiniTable=require("./MiniTable.jsx");

var DataGrid=React.createClass({
    mixins:[shouldComponentUpdate,DataGridHandler,DataGridExtend,pasteExtend,ClickAway,showUpdate],
    propTypes: {
        width:React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string,
        ]) ,//宽度
        height:React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string,
        ]) ,//高度
        selectAble:React.PropTypes.bool,// 是否显示选择，默认值 false
        singleSelect:React.PropTypes.bool,//是否为单选,默认值为 false
        detailAble:React.PropTypes.bool,//是否显示详情,默认值 false
        focusAble:React.PropTypes.bool,//是否显示焦点行，默认值 false
        moveAble:React.PropTypes.bool,//是否鼠标经过表格标记当前行 默认 true
        editAble:React.PropTypes.bool,//是否允许编辑
        borderAble:React.PropTypes.bool,//是否显示表格边框，默认值 false

        clearChecked:React.PropTypes.bool,//刷新数据后是否清除选择,true
        selectChecked:React.PropTypes.bool,//选择行的时候是否同时选中,false
        pagination:React.PropTypes.bool,//是否分页,默认值 true

        pageIndex:React.PropTypes.number,//当前页号
        pageSize:React.PropTypes.number,//分页大小，默认20
        sortName:React.PropTypes.string,//排序字段,
        sortOrder:React.PropTypes.oneOf([
            "asc",
            "desc",
        ]),//排序方式,默认asc,
        keyField:React.PropTypes.string,//关键字段
        headers:React.PropTypes.array,//表头设置
        footer:React.PropTypes.oneOfType([
            React.PropTypes.array,
            React.PropTypes.element,
        ]) ,//页脚,
        total:React.PropTypes.number,// 总条目数，有url没用，默认为 0
        data:React.PropTypes.array,//当前页数据（json）

        url:React.PropTypes.string,//ajax地址

        backSource:React.PropTypes.string,//ajax的返回的数据源中哪个属性作为数据源(旧版本)
        dataSource:React.PropTypes.string,//ajax的返回的数据源中哪个属性作为数据源(新版本)
        footerSource:React.PropTypes.string,//页脚数据源,
        totalSource:React.PropTypes.string,//ajax的返回的数据源中哪个属性作为总记录数源

        params:React.PropTypes.object,//查询条件
        onClick:React.PropTypes.func,//单击事件
        onDoubleClick:React.PropTypes.func,//双击事件
        onChecked:React.PropTypes.func,//监听表格中某一行被选中/取消
        updateHandler:React.PropTypes.func,//手动更新事件，父组件一定要有返回值,返回详情组件
        detailHandler:React.PropTypes.func,//展示详情的函数，父组件一定要有返回值,返回详情组件


        pagePosition:React.PropTypes.oneOf([
            "top",
            "bottom",
            "both"
        ]),//分页栏的位置

        pasteUrl:React.PropTypes.string,//粘贴后的url
        pasteParamsHandler:React.PropTypes.func,//对粘贴后的数据进行处理,形成参数并且返回
        headerUrl:React.PropTypes.string,//自定义列地址
        defaultHeaderUrl:React.PropTypes.string,//默认的自定义列接口
        updateUrl:React.PropTypes.string,//列更新的地址

        selectAbleTextField:React.PropTypes.string,// 是否可选择字段名 通过当前行数据的具体情况 判断行头是否可选择
        selectAbleValueField:React.PropTypes.string,// 与selectAbleTextField对应  数据行.selectAbleTextField==selectAbleValueField  则当前行可选择
        draggable:React.PropTypes.bool,//表格行 是否允许拖拽
        isDetailTable:React.PropTypes.bool,//是否为详情页中的table（即table中的table）

    },
    getDefaultProps:function(){
        return{
            width:"100%",
            height:null,
            minHeight:null,
            selectAble:false,
            singleSelect:false,
            detailAble:false,
            focusAble:true,
            moveAble:true,
            borderAble:false,
            clearChecked:true,//是否清空选择的
            selectChecked:false,
            pagination:true,
            pageIndex:1,
            pageSize:20,
            sortName:"id",
            sortOrder:"asc",
            keyField:"id",
            headers:[],
            total:0,
            data:[],
            url:null,//
            backSource:"data",//
            dataSource:"data",//
            totalSource:"total",//
            params:null,
            footer:null,//页脚
            onClick:null,
            onDoubleClick:null,

            onChecked:null,
            updateHandler:null,
            detailHandler:null,

            footerSource:"footer",//页脚数据源
            pagePosition:"bottom",//默认分页在底部
            pasteUrl:null,
            pasteParamsHandler:null,
            headerUrl:null,
            editAble:false,//是否允许编辑
            updateUrl:null,
            selectAbleTextField:"",
            selectAbleValueField:"",
            draggable:false,
            sumConent:"", //表格统计内容
            isDetailTable:false
        }
    },
    getInitialState:function() {
        this.clientHeight=document.documentElement.clientHeight;//先得到高度,防止后期页面发生晃动
        var data=[];
        if(this.props.data instanceof  Array)
        {
            data=this.props.data;
        }
        return {
            url:this.props.url,

            params:unit.clone( this.props.params),//这里一定要复制,只有复制才可以比较两次参数是否发生改变没有,防止父组件状态任何改变而导致不停的查询
            pageIndex:this.props.pageIndex,
            pageSize:this.props.pageSize,
            sortName:this.props.sortName,
            sortOrder:this.props.sortOrder,
            data:(this.props.pagination==true? data.slice(0,this.props.pageSize):data),//只只保留当前的数据
            checkedData:new Map(),
            detailView:null,//详情行,
            detailIndex:null,//显示详情的行下标
            total:this.props.total,//总记录数
            loading:(this.props.url||this.props.headerUrl)?true:false,//显示正在加载图示
            loadDataing:false,//区别于loading，此属性仅配合显示“暂无数据”的背景图
            footer:this.props.footer,//页脚
            headers:this.props.headers,//表头会可能后期才传送,也会动态改变
            height:this.props.height,//如果没有设置高度还要从当前页面中计算出来空白高度,以适应布局
            minHeight:this.props.minHeight,//设置real-talble最小高度
            headerMenu:[],//被隐藏的列
            panelShow:false,//列表的操作面板
            headerUrl:this.props.headerUrl,
            updateUrl:this.props.updateUrl,
            editAble:this.props.editAble,
            editIndex:null,//当前处理编辑的列
            remoteHeaders:null,//自定义列的数据
            addData:new Map(),//新增的数据,因为有可能新增一个空的，然后再修改
            updatedData:new Map(),//被修改过的数据，因为要判断曾经是否修改
            deleteData:[],//删除的数据
            trMouseOverIndex:null,//鼠标经过tr的当前行标值
            focusIndex:null,//鼠标点击tr的当前行标值

        }
    },
    componentWillReceiveProps:function(nextProps) {
        /*
         url与params而url可能是通过reload方法传进来的,并没有作为状态值绑定
         headers可能是后期才传了,见Page组件可知
         所以此处需要详细判断
         另外 pageSize组件
         */
        if(nextProps.url) {
            //说明父组件将url作为状态值来绑定的
            /*
             注意了***************（见reload方法）
             isReloadType的作用:
             为真:说明是通过reload方法来执行更新的,组件本身的params与父组件的params已经不同步了,不能更新
             为假:说明是父组件仅仅使用了状态值作为通信方式,先判断是否有params变化，没有则不查询,有从第一页开始查询
             *********
             */

            //先更新一些可能会更新的属性
            //先处理表头的筛选，因为可能存在远程的加载的表头数据
            var filterResult=  this.headerFilterHandler(nextProps.headers,this.state.headers);
            var neeeUpdate= this.showUpdate(this.state.headers,filterResult.headers);

            if(!neeeUpdate)
            {
                if(this.state.headerUrl!=nextProps.headerUrl)
                {
                    neeeUpdate=true;
                }
            }
            if(neeeUpdate) {
                this.setState({
                    headers: filterResult.headers,
                    headerUrl: nextProps.headerUrl
                })
            }

            if(this.state.headerUrl!=nextProps.headerUrl)
            {
                this.getHeaderDataHandler(nextProps.headerUrl);
            }

            if (this.isReloadType!=true&&this.showUpdate(  nextProps.params,this.state.params)) {
                //仅仅通过状态值更新,参数有变,更新
                this.updateHandler(nextProps.url,this.state.pageSize, 1, this.state.sortName, this.state.sortOrder, nextProps.params);
            }
            else {//父组件状态值没有发生变化,或者使用reload方法更新的



            }


        }
        else
        { //说明父组件将url没有作为状态值来绑定的
            if(this.state.url)
            {//组件本身的url不为空说明通过reload方法绑定了url,父组件本身没有绑定url,所以不能查询

                if(nextProps.headers)
                { //存在着这种情况,后期才传headers,所以要更新一下
                    this.setState({
                        headers: nextProps.headers,
                    })
                }
            }
            else {
                //没有url时，自定义更新事件
                if (nextProps.data != null && nextProps.data != undefined && nextProps.data instanceof Array) {
                    this.setState({
                        data: (this.props.pagination == true ? nextProps.data.slice(0, nextProps.pageSize) : nextProps.data),
                        total: nextProps.total,
                        pageIndex: nextProps.pageIndex,
                        pageSize: nextProps.pageSize,
                        sortName: this.props.sortName,
                        sortOrder: nextProps.sortOrder,
                        headers: nextProps.headers,//表头可能会更新
                    })
                }
            }

        }
        if(nextProps.minHeight){
            /*设置表格的最低高度*/
            this.setState({
                minHeight:nextProps.minHeight
            });
        }

    },
    componentDidMount:function(){
        this.setWidthAndHeight();//重新计算列表的高度,固定的表头每一列的宽度
        //渲染后再开始加载数据
        if(this.state.headerUrl){//如果存在自定义列
            this.getHeaderDataHandler();
        }
        if(this.state.url)
        {//如果存在url,
            this.updateHandler(this.state.url,this.state.pageSize,this.state.pageIndex,this.state.sortName,this.state.sortOrder)
        }
        this.registerClickAway(this.hideMenuHandler, this.refs.grid);//注册全局单击事件
    },
    componentDidUpdate:function() {
        this.setWidthAndHeight();//重新计算列表的高度,固定的表头每一列的宽度
        var _this=this;
        if(this.refs.realTableDetail){
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
            if (MutationObserver) {
                var observer = new MutationObserver(function (mutations) {
                    var height=_this.refs.realTableDetail.offsetHeight-1;
                    try
                    {
                        _this.refs.fixedRightDetail.style.height=height+"px";
                        _this.refs.fixedRightDetail.children[0].style.height=height+"px";
                        _this.refs.fixedRightDetail.children[0].children[0].style.height=height+"px";
                        _this.refs.fixedRightDetail.children[0].children[0].children[0].style.height=height+"px";
                    }
                    catch (e){

                    }

                    try {
                        _this.refs.fixedLeftDetail.style.height=height+"px";
                        _this.refs.fixedLeftDetail.children[0].style.height=height+"px";
                        _this.refs.fixedLeftDetail.children[0].children[0].style.height=height+"px";
                        _this.refs.fixedLeftDetail.children[0].children[0].children[0].style.height=height+"px";
                    }catch(e) {

                    }
                }.bind(this));
                //主要监听节点插入和节点属性变化（不监听节点删除）
                observer.observe(this.refs.realTableDetail,{attributes: true,childList: true,subtree: true});
            }
        }

    },
    renderHeader :function(fixed) {//渲染表头
        if(this.state.headers instanceof  Array)
        {

        }
        else {
            return null;
        }
        let headers = [];

        if(fixed&&fixed=="fixedRight"){}else{
            if (this.props.selectAble) {
                let props={
                    value:this.checkCurrentPageCheckedAll()==true?"yes":null,
                    data:[{value:"yes",text:""}],
                    onSelect:this.checkedAllHandler,
                    name:"all",
                }
                //使用label,因为多个列可能绑定一个字段
                if(this.props.singleSelect==true){
                    headers.push(
                        <th  key="headercheckbox" className="check-column" name="check-column" style={{width:35}} >
                            <div className="wasabi-table-cell" name="check-column" ></div>
                        </th>

                    );
                }
                else {
                    headers.push(
                        <th key="headercheckbox" className="check-column" name="check-column" style={{width:35}} >
                            <div className="wasabi-table-cell" name="check-column"><CheckBox {...props} ></CheckBox></div>
                        </th>
                    );
                }

            }
        }
        this.state.headers.map((header, index) => {
            if (!header||header.hide == true||(fixed?!(header.fixed==fixed):false)) {//如果有列需要左\右固定,则需进一步判断
                //隐藏则不显示
                return ;
            }else {
                if (this.state.headerMenu.length > 0 && this.state.headerMenu.indexOf(header.label) > -1) {//父组件更新状态值，发现某一行处理被隐藏中，则不显示
                    return ;
                }
                else {
                    let sortOrder = "";
                    var props = {};//设置单击事件
                    if (header.sortAble) {
                        sortOrder = " both";
                        if (this.state.sortName == header.name) {
                            //是当前排序字段
                            sortOrder += " " + this.state.sortOrder;
                            props.onClick = this.onSort.bind(this, header.name, this.state.sortOrder == "asc" ? "desc" : "asc");
                        }
                        else {
                            props.onClick = this.onSort.bind(this, header.name, "desc");
                        }
                    }
                    //使用label作为元素name属性，是因为可能有多个列对应同一个字段
                    var savecontrol=null;//保存按钮
                    if(this.state.editIndex!=null&&index==0)
                    {//0是有效值
                        savecontrol=<LinkButton key="save" style={{color:"#666666",fontSize:12,position:"absolute"}} iconCls={"icon-submit"} name="save" tip="保存" onClick={this.remoteUpdateRow.bind(this,null)}/>
                    }
                    let labelContent = <span>{header.label}</span>;
                    if(header.sortAble){
                        let isUpActive =  (this.state.sortName === header.name) && (this.state.sortOrder === "asc");
                        let isDownActive =  (this.state.sortName === header.name) && (this.state.sortOrder === "desc");
                        let upClickFn = (e)=>{e.stopPropagation();this.onSort(header.name,"asc");};
                        let downClickFn = (e)=>{e.stopPropagation();this.onSort(header.name,"desc");};

                        labelContent = ( <span title="点击可进行排序"><span>{header.label}</span>
                        <span className="sort-icon-wrap"><i onClick={upClickFn} className={"sort-icon-up "+ (isUpActive?"active":"")}></i>
                            <i onClick={downClickFn}  className={"sort-icon-down "+ (isDownActive?"active":"")}></i></span></span>)
                    }
                    let headerClass = "wasabi-table-cell ";
                    if(header.className){
                        headerClass += header.className;
                    }
                    if(header.required){
                        headerClass += " required ";
                    }
                    headers.push(
                        <th key={"header" + index.toString()} name={header.label} {...props}
                            className={"" + sortOrder}
                            style={{textAlign: (header.align ? header.align : "left")}}
                            onMouseMove={this.headerMouseMoveHandler}
                            onContextMenu={this.headerContextMenuHandler}
                            onMouseDown={this.headerMouseDownHandler}>
                            <div className={headerClass} name={header.label} style={{
                                width:(header.width?header.width:null), textAlign: (header.align ? header.align : "left")
                            }}>{labelContent}{savecontrol}</div>
                        </th>)


                }
            }
        });


        return headers;
    },
    renderFixedLeftHeader(){
        var fixedLeftHeaders=this.renderHeader("fixedLeft");
        return fixedLeftHeaders;
    },
    renderFixedRightHeader(){
        var fixedRightHeaders=this.renderHeader("fixedRight");
        return fixedRightHeaders;
    },
    renderBody:function(fixed) {//渲染表体
        var trobj=[];
        if(this.state.data instanceof Array&&this.state.headers instanceof  Array)
        {

        }
        else
        {
            return ;
        }


        this.state.data.map((rowData,rowIndex)=> {
            this.state.data[rowIndex].hasSelectBtn=false;//当前行首是否有选择按钮(checkbox or radio)
            let tds = [];//当前的列集合
            let key=this.getKey(rowIndex);//获取这一行的关键值
            //设置这一行的选择列
            if (this.props.selectAble) {
                let props = {
                    value: this.state.checkedData.has(key) == true ? key : null,
                    data: [{value: key, text: ""}],
                    onSelect: this.onChecked.bind(this, rowIndex),
                    name: key,
                }

                if (this.props.singleSelect == true) {
                    if(this.props.selectAbleTextField){
                        if(this.props.selectAbleValueField){}else{
                            console.warn("请传递selectAbleValueField值")
                        }
                        if(rowData[this.props.selectAbleTextField]==this.props.selectAbleValueField){
                            this.state.data[rowIndex].hasSelectBtn=true;
                            if(fixed&&fixed=="fixedRight"){}else{
                                tds.push(
                                    <td key={"bodycheckbox"+rowIndex.toString()} className="check-column" style={{width:35}}>
                                        <div className="wasabi-table-cell" > <Radio {...props} ></Radio></div></td>
                                );
                            }
                        }else{
                            if(fixed&&fixed=="fixedRight"){}else{
                                tds.push(
                                    <td  key="bodycheckbox" className="check-column" style={{width:35}} >
                                        <div className="wasabi-table-cell"></div>
                                    </td>
                                );
                            }
                        }
                    }else{
                        this.state.data[rowIndex].hasSelectBtn=true;
                        if(fixed&&fixed=="fixedRight"){}else{
                            tds.push(
                                <td key={"bodycheckbox"+rowIndex.toString()} className="check-column" style={{width:35}}>
                                    <div className="wasabi-table-cell" > <Radio {...props} ></Radio></div></td>
                            );
                        }
                    }
                }
                else {
                    if(this.props.selectAbleTextField){
                        if(this.props.selectAbleValueField){}else{
                            console.warn("请给组件传递selectAbleValueField值")
                        }
                        if(rowData[this.props.selectAbleTextField]==this.props.selectAbleValueField){
                            this.state.data[rowIndex].hasSelectBtn=true;
                            if(fixed&&fixed=="fixedRight"){}else{
                                tds.push(
                                    <td key={"bodycheckbox"+rowIndex.toString()} className="check-column" style={{width:35}}>
                                        <div className="wasabi-table-cell"  ><CheckBox {...props} ></CheckBox></div></td>
                                );
                            }
                        }else{
                            if(fixed&&fixed=="fixedRight"){}else{
                                tds.push(
                                    <td  key="bodycheckbox" className="check-column" style={{width:35}} >
                                        <div className="wasabi-table-cell"></div>
                                    </td>
                                );
                            }
                        }
                    }else{
                        this.state.data[rowIndex].hasSelectBtn=true;
                        if(fixed&&fixed=="fixedRight"){}else{
                            tds.push(
                                <td key={"bodycheckbox"+rowIndex.toString()} className="check-column" style={{width:35}}>
                                    <div className="wasabi-table-cell"  ><CheckBox {...props} ></CheckBox></div></td>
                            );
                        }
                    }
                }
            }



            //生成数据列
            this.state.headers.map((header, columnIndex) => {
                if (!header||header.hide||(fixed?!(header.fixed==fixed):false)) {
                    return;
                }
                if( this.state.headerMenu.length>0&&this.state.headerMenu.indexOf(header.label)>-1) {//父组件更新状态值，发现某一行处理被隐藏中，则不显示
                    return ;
                }

                let content = header.content;
                if (typeof content === 'string') {//指定的列
                    content =this. substitute(content, rowData);
                } else if (typeof content === 'function') {//函数
                    try {
                        content = content(rowData,rowIndex,header);
                    }
                    catch (e)
                    {
                        content="";
                    }

                } else {//为空时
                    content = rowData[header.name];
                }


                if(this.state.editIndex!=null &&this.state.editIndex==rowIndex&&header.editor)
                {
                    let currentValue=rowData[header.name];
                    let currentText=rowData[header.name];
                    if(typeof header.editor.content=== 'function') {
                        let valueResult= header.editor.content(rowData,rowIndex);
                        if(valueResult)
                        {
                            currentValue=valueResult.value;
                            currentText=valueResult.text;

                        }
                    }
                    tds.push(<td onClick={this.onClick.bind(this,rowIndex,rowData)}
                                 onDoubleClick={this.onDoubleClick.bind(this,rowIndex,rowData)}
                                 key={"col"+rowIndex.toString()+"-"+columnIndex.toString()}
                    ><div className="wasabi-table-cell" width={header.width?header.width:null}   style={{width:(header.width?header.width:null),textAlign:(header.align?header.align:"left")}}>
                        <Input {...header.editor.options} type={header.editor.type} value={currentValue} text={currentText} onChange={this.rowEditHandler.bind(this,columnIndex)}
                               onSelect={this.rowEditHandler.bind(this,columnIndex)} label={""}></Input>
                    </div></td>);
                }
                else
                {
                    if (columnIndex==0&& (this.props.detailAble ||header.detailAble||rowData.detailAble)) {

                        //在第一列显示详情 
                        var iconCls="icon-down";//详情列的图标
                        if(this.state.detailIndex==key)
                        {
                            iconCls="icon-up";//详情列-展开
                        }

                        tds.push(<td onClick={this.detailHandler.bind(this,rowIndex,rowData)}
                                     key={"col"+rowIndex.toString()+"-"+columnIndex.toString()}>
                            <div className="wasabi-table-cell"  style={{width:(header.width?header.width:null),textAlign:(header.align?header.align:"left")}}>
                                <div> <span style={{display:"inline-block"}}>{content}</span><i style={{position:"relative",top:"2px",cursor:"pointer"}} className={iconCls} color="#666666" title="查看详情"></i></div>
                            </div>
                        </td>);
                    }
                    else {
                        tds.push(<td onClick={this.onClick.bind(this,rowIndex,rowData)}
                                     onDoubleClick={this.onDoubleClick.bind(this,rowIndex,rowData)}
                                     key={"col"+rowIndex.toString()+"-"+columnIndex.toString()}
                                     style={header.width?{whiteSpace:"initial"}:{}}
                        ><div className="wasabi-table-cell"    style={{width:(header.width?header.width:null),textAlign:(header.align?header.align:"left")}}>{content}</div></td>);
                    }
                }


            });
            let trClassName=null;
            if((rowIndex*1)%2==0)
            {//不是选中行的时候
                trClassName="even";
            }
            if((rowIndex*1)==this.focusIndex&&this.props.focusAble)
            {
                trClassName="selected";
            }
            if(this.state.trMouseOverIndex!=null&&this.state.trMouseOverIndex==rowIndex){
                trClassName+=" trMouseOver";
            }
            if(rowData.className){
                trClassName+=" "+rowData.className
            }
            trobj.push(<tr
                className={trClassName}
                key={"row"+rowIndex.toString()}
                onMouseOver={this.onMouseOver.bind(this,rowIndex)}
                onMouseDown={this.onMouseDown.bind(this,rowIndex)}

                style={{cursor:this.props.draggable?"move":"default"}}
                draggable={this.props.draggable}
                onDragStart={this.domdrugstart.bind(this,rowIndex,rowData)}
                onDragEnter={this.domdrugenter.bind(this,rowIndex)}
                onDragOver={this.domdrugover}
                onDragLeave={this.domdrugleave}
                onDrop={this.domdrop.bind(this,rowIndex)}
                onDragEnd={this.domdrapend}>{tds}</tr>);

            if(this.state.detailIndex==key&&tds.length!=0)//如果左右固定栏  没有数据  则详情页不显示了
            {
                var colSpan = this.state.headers.length;
                if (this.props.selectAble == true) {
                    colSpan++;
                }
                switch (fixed){
                    case "fixedLeft":
                        trobj.push(<tr ref="fixedLeftDetail" key={this.state.detailIndex+"detail"} style={{borderLeft:"1px solid #e7e7e7"}}>
                            <td colSpan={colSpan}><div className="wasabi-detail" ><div ref="fixedLeftWasabiDetailWrap"  className="wasabi-detail-Wrap"></div></div></td>
                        </tr>);
                        break;
                    case "fixedRight":
                        let fixedRightHeadersLength = this.state.headers.filter(function(item,i,arr){
                            return item.fixed==="fixedRight";//过滤出固定于右边的个数
                        }).length;
                        let tds = [];
                        for(let i=0;i<fixedRightHeadersLength;i++){
                            if(i===0){
                                tds.push(<td key={"fixedTd"+i}><div className="wasabi-detail" ><div ref="fixedRightWasabiDetailWrap"  className="wasabi-detail-Wrap"></div></div></td>);
                            }else{
                                tds.push(<td key={"fixedTd"+i}><div className="wasabi-detail" ><div></div></div></td>); //填充补数
                            }
                        }
                        trobj.push(<tr ref="fixedRightDetail" key={this.state.detailIndex+"detail"} style={{borderLeft:"1px solid #e7e7e7"}}>
                            {tds}
                        </tr>);
                        break;
                    default:
                        trobj.push(<tr ref="realTableDetail" key={this.state.detailIndex+"detail"} style={{borderLeft:"1px solid #e7e7e7"}}>
                            <td colSpan={colSpan}><div className="wasabi-detail" ><div ref="wasabiDetailWrap" className="wasabi-detail-Wrap">{this.state.detailView}</div></div></td>
                        </tr>);
                        break;

                }

            }

        });

        return trobj;

    },
    renderFixedLeftBody:function () {
        var fixedLeftBody=this.renderBody("fixedLeft");
        return fixedLeftBody;
    },
    renderFixedRightBody:function () {
        var fixedRightBody=this.renderBody("fixedRight");
        return fixedRightBody;
    },
    substitute:function(str, obj) {//得到绑定字段的内容
        return str.replace((/\\?\{([^{}]+)\}/g), function(match, name){
            if (match.charAt(0) === '\\') {
                return match.slice(1);
            }
            return (obj[name] === null || obj[name] === undefined) ? '' : obj[name];
        });
    },
    renderTotal:function() {//渲染总记录数，当前记录的下标
        if(this.state.headers&&this.state.headers.length>0)
        {
            var beginOrderNumber=0; var endOrderNumber=0;//数据开始序号与结束序
            var total=this.state.total;//总记录数
            var pageTotal = ( parseInt(this.state.total / this.state.pageSize));//共多少页
            if ((this.state.total % this.state.pageSize) > 0) {
                pageTotal++;//求余后得到最终总页数
            }
            if(pageTotal==0)
            {//数据为空，直接返回
                return null;
            }

            var control;//记录数组件
            if(this.state.data instanceof Array ) {
                if(this.state.data.length>0)
                {
                    if(this.props.pagination)
                    {
                        beginOrderNumber=this.state.pageSize*(this.state.pageIndex-1)+1;
                        endOrderNumber=this.state.pageSize*(this.state.pageIndex-1)+this.state.data.length;
                    }
                    else
                    {
                        endOrderNumber=this.state.data.length;
                        total=this.state.data.length;
                    }

                }

            }
            var  totalControl=<span className="pagination-info">第{this.state.pageIndex}/{pageTotal}页,共{total}行记录</span>;
            if(this.props.pagination==false)
            {
                totalControl=<span className="pagination-info">共{total}行记录</span>;
            }
            control=  <div key="pagination-detail" className="pagination-detail">{totalControl}
                <div style={{display:this.props.pagination?"inline-block":"none"}}>每页<select className="page-select" value={this.state.pageSize} onChange={this.pageSizeHandler}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>条</div>
            </div>;
            return control;
        }
        else
        {
            return null;
        }

    },
    renderPagination:function(type) {//显示分页控件
        var paginationCom=null;
        if (this.props.pagination) {

            var pageTotal = ( parseInt(this.state.total / this.state.pageSize));//共多少页
            if ((this.state.total % this.state.pageSize) > 0) {
                pageTotal++;//求余后得到最终总页数
            }
            if(pageTotal==0)
            {//数据为空，直接返回
                return null;
            }

            if (pageTotal >3) {//大于3页，
                let pageComponent = [];//分页组件
                //简化显示方式，否则在grid嵌套时，而数据过多时无法显示完整
                paginationCom= <div className="pull-right pagination">
                    <ul className="pagination" style={{marginTop:type=="top"?0:4,marginBottom:type=="top"?4:0}}>
                        <li key={"lipre"} className="page-pre"><a href="javascript:void(0)" onClick={this.prePaginationHandler}>{"<"}</a></li>

                        <li key="linext"  className="page-next"><a href="javascript:void(0)" onClick={this.nextPaginationHandler} >{">"}</a></li>
                    </ul>
                </div>;
            }
            else {
                //小于3页直接显示
                let pagearr = [];
                for (let i = 0; i < pageTotal; i++) {
                    var control=<li key={"li"+i} className={"page-number "+((this.state.pageIndex*1)==(i+1)?"active":"")}>
                        <a href="javascript:void(0)"  onClick={this.paginationHandler.bind(this,(i+1))}>{(i + 1)}</a></li>;
                    pagearr.push(control);
                }
                paginationCom = (
                    <div className="pull-right">
                        <ul className="pagination" >
                            {
                                pagearr
                            }
                        </ul>
                    </div>
                )

            }

        }
        return paginationCom;

    },
    renderPaginationTwo:function(type) {//显示分页控件
        var paginationCom=null;
        if (this.props.pagination) {

            var pageAll = ( parseInt(this.state.total / this.state.pageSize));//共多少页
            if ((this.state.total % this.state.pageSize) > 0) {
                pageAll++;//求余后得到最终总页数
            }
            if(pageAll==0)
            {//数据为空，直接返回
                return null;
            }

            if (pageAll > 7) {//大于7页，
                let pageComponent = [];//分页组件
                let firstIndex=0;//第一个显示哪一页
                let lastIndex=0;//最后一个显示哪一页
                let predisabledli= <li key="predis" className="page-last-separator disabled"><a href="javascript:void(0)">...</a></li>;//多余的分页标记
                let lastdisabledli= <li key="lastdis" className="page-last-separator disabled"><a href="javascript:void(0)">...</a></li>;//多余的分页标记
                if(this.state.pageIndex>=4&&this.state.pageIndex<=pageAll-3)
                {//处于中间位置的页号
                    firstIndex=this.state.pageIndex-2;
                    lastIndex=this.state.pageIndex+2;
                }
                else {
                    //非中间位置
                    if(this.state.pageIndex<4) {
                        //靠前的位置
                        firstIndex = 2;
                        lastIndex = 6;
                        predisabledli=null;//设置为空
                    }else
                    {//靠后的位置
                        if(this.state.pageIndex>pageAll-3)
                        {
                            firstIndex = pageAll-5;
                            lastIndex = pageAll-1;
                            lastdisabledli=null;//设置为空
                        }
                    }
                }
                for (let i=firstIndex; i <=lastIndex; i++) {
                    pageComponent.push(<li key={"li"+i} className={"page-number "+((this.state.pageIndex*1)==(i)?"active":"")}><a
                        href="javascript:void(0)" onClick={this.paginationHandler.bind(this,(i))}>{(i)}</a></li>);
                }
                pageComponent.unshift(predisabledli);pageComponent.push(lastdisabledli);
                paginationCom= <div className="pull-right pagination">
                    <ul className="pagination" style={{marginTop:type=="top"?0:3,marginBottom:type=="top"?3:0}}>
                        <li key={"lipre"} className="page-pre"><a href="javascript:void(0)" onClick={this.prePaginationHandler} >‹</a></li>
                        <li key={"lifirst"} className={"page-number "+((this.state.pageIndex*1)==(1)?"active":"")}><a
                            href="javascript:void(0)" onClick={this.paginationHandler.bind(this,(1))}>{( 1)}</a></li>
                        {
                            pageComponent
                        }

                        <li key="lilast" className={"page-number "+((this.state.pageIndex*1)==(pageAll)?"active":"")}><a href="javascript:void(0)"  onClick={this.paginationHandler.bind(this,(pageAll))}>{(pageAll)}</a></li>
                        <li key="linext"  className="page-next"><a href="javascript:void(0)" onClick={this.nextPaginationHandler} >›</a></li>
                    </ul>
                </div>;
            }
            else {
                //小于7页直接显示

                let pagearr = [];
                for (let i = 0; i < pageAll; i++) {
                    var control=<li key={"li"+i} className={"page-number "+((this.state.pageIndex*1)==(i+1)?"active":"")}>
                        <a href="javascript:void(0)"  onClick={this.paginationHandler.bind(this,(i+1))}>{(i + 1)}</a></li>;
                    pagearr.push(control);
                }
                paginationCom = (
                    <div className="pull-right">
                        <ul className="pagination" style={{marginTop:type=="top"?0:3,marginBottom:type=="top"?3:0}}>
                            {
                                pagearr
                            }
                        </ul>
                    </div>
                )

            }

        }
        return paginationCom;

    },
    renderFooter:function() {//渲染页脚
        var tds = [];
        this.footerActualData=[];//,页脚的实际统计数据，用于返回
        if (this.state.footer instanceof Array) {
            //分页的情况下
            if (this.props.selectAble) {
                tds.push(
                    <td key="footerselect" className="check-column"></td>
                );
            }
            this.state.headers.map((header,headerindex)=>
            {
                if (!header||header.hide) {
                    return;
                }
                if( this.state.headerMenu.length>0&&this.state.headerMenu.indexOf(header.label)>-1) {//父组件更新状态值，发现某一行处理被隐藏中，则不显示
                    return ;
                }

                var footerchild=this.state.footer.filter(function(d)
                {
                    return d.name==header.name;
                })
                if(footerchild&&footerchild.length>0)
                {
                    if(footerchild[0].value!=null&&footerchild[0].value!=undefined)
                    {//如果有值
                        var obj={};obj[header.name]=footerchild[0].value;
                        this.footerActualData.push(obj);
                        tds.push(<td key={headerindex+header.name}>{footerchild[0].value}</td>)
                    }
                    else {
                        //表明从本页数据统计
                        switch (footerchild[0].type)
                        {
                            case "sum":
                                var obj={};obj[header.name]=this.sumHandler(footerchild[0]);
                                this. footerActualData.push(obj);
                                if(obj[header.name]!=null)
                                {
                                    tds.push(<td  key={header.name} >{"总计："+obj[header.name]}</td>);
                                }
                                else {
                                    tds.push(<td  key={header.name} ></td>);
                                }
                                break;
                            case "avg":
                                var obj1={};obj1[header.name]=this.avgHandler(footerchild[0]);
                                this. footerActualData.push(obj1);
                                if(obj[header.name]!=null)
                                {
                                    tds.push(<td  key={headerindex+header.name} >{"平均值："+obj1[header.name]}</td>);
                                }
                                else {
                                    tds.push(<td  key={headerindex+header.name} ></td>);
                                }
                                break ;
                            default:
                                tds.push(<td  key={headerindex+header.name}></td>);
                        }
                    }
                }
                else
                {
                    tds.push(<td key={header.name+headerindex}></td>);
                }

            });

            return <tr className="wasabi-footer-tr" key="footertr" style={{height:36}}>{tds}</tr>;
        }else if(this.state.footer) {//直接传的元素标签
            this.state.headers.map((header,headerindex)=>{
                if(headerindex!=0){
                    tds.push(<td key={header.name+headerindex}></td>);
                }
            })
            return <tr className="wasabi-footer-tr" key="footertr" style={{height:36}}><td>{this.props.footer}</td>{tds}</tr>;
        }


    },
    render:function() {
        let className="table table-no-bordered";
        if(this.props.borderAble===true)
        {//无边框
            className="table";
        }
        let headerControl=this.renderHeader();
        let gridHeight=this.state.height;//
        let gridMinHeight = this.state.minHeight;
        let tableHeight="auto";

        if(this.state.url && gridHeight=="auto"){
            gridMinHeight = Math.max(gridMinHeight||0,250);//对于一些设置了url，并且height为auto的；要设置最小高度250，是为了能够显示“暂无数据”的背景图
            //gridHeight = 250; 
        }
        if(regs.number.test(gridHeight))
        {
            let sumContentHeight = this.props.sumConent?42:0;//底部汇总处高度
            gridHeight-= sumContentHeight;
            tableHeight=gridHeight?( this.props.pagePosition=="both")?gridHeight-70:gridHeight-35:null; // 70,35为分页栏高度
        }

        var headerMenuCotrol=[];//右键菜单中隐藏的列
        if(this.state.headerMenu.length>0)
        {
            this.state.headerMenu.map((item,index)=>
            {
                headerMenuCotrol.push(
                    <li key={index}><a href="javascript:void(0);" className="header-menu-item" onMouseDown={this.menuHeaderShowHandler.bind(this,index,item)} >{"显示["+item+"]"}</a></li>)
            })
        }

        return (
            <div>
                <div className="wasabi-table" ref="grid"
                     onPaste={this.onPaste}
                     onMouseDown={this.gridMouseDownHandler}
                     onContextMenu={this.gridContextMenuHandler}
                     style={{width:this.props.width,height:gridHeight}}  >
                    <div className="wasabi-table-pagination" ref="toppagination"
                         style={{display:(this.props.pagePosition=="top"||this.props.pagePosition=="both")?this.props.pagination?"block":"none":"none"}}>
                        <div style={{display:(this.props.pagination?"block":(this.state.data instanceof Array &&this.state.data.length>0)?"block":"none")}}>
                            {this.renderPaginationTwo("top")}
                        </div>
                        {this.renderTotal()}

                    </div>

                    <div className="table-container" ref="tableContainer">
                        <div className="table-fixed" ref="fixedTableContainer">
                            <table  className={className} key="fixedTable"  ref="fixedTable"
                                    onMouseMove={this.fixedTableMouseMoveHandler} onMouseUp={this.fixedTableMouseUpHandler}>
                                <thead>
                                <tr>
                                    {headerControl}
                                </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="table-realTable"  ref="realTableContainer" style={{height:tableHeight,minHeight:gridMinHeight}}
                             onScroll={this.tableBodyScrollHandler.bind(this,this.props.isDetailTable)}>
                            <table  className={className} key="realTable"  ref="realTable">
                                <thead >
                                <tr>
                                    {headerControl}
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.renderBody()
                                }
                                {
                                    this.renderFooter()
                                }
                                </tbody>
                            </table>
                        </div>

                        <div className="wasabi-table-fixed-left-container" ref="wasabiTableFixedLeftContainer">
                            <div className="wasabi-table-fixed-left-header" ref="fixedLeftHeaderTableContainer">
                                <table className={className} ref="fixedleftHeaderTable">
                                    <thead>
                                    <tr>
                                        {this.renderFixedLeftHeader()}
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                            <div className="wasabi-table-fixed-left-body" ref="fixedLeftBodyTableContainer">
                                <table className={className} ref="fixedLeftBodyTable">
                                    <thead>
                                    <tr>
                                        {this.renderFixedLeftHeader()}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.renderFixedLeftBody()
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="wasabi-table-fixed-right-container" ref="wasabiTableFixedRightContainer">
                            <div className="wasabi-table-fixed-right-header" ref="fixedRightHeaderTableContainer">
                                <table className={className} ref="fixedrightHeaderTable">
                                    <thead>
                                    <tr>
                                        {this.renderFixedRightHeader()}
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                            <div className="wasabi-table-fixed-right-body" ref="fixedRightBodyTableContainer">
                                <table className={className} ref="fixedRightBodyTable">
                                    <thead>
                                    <tr>
                                        {this.renderFixedRightHeader()}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.renderFixedRightBody()
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div style={{display:(this.state.url && !this.state.loadDataing && (!this.state.data || !this.state.data.length))?"block":"none"}}  className="wasabi-no-data">
                        <span className="text">暂无数据</span>{/*设置了url并且loadDataing完，且没有数据才显示*/}
                    </div>
                    <div style={{display:(this.props.sumConent?"block":"none")}} className="wasabi-table-sum" ref="tablesum">
                        {this.props.sumConent}
                    </div>
                    <div className="wasabi-table-pagination" ref="bottompagination"
                         style={{display:(this.props.pagination?"block":(this.props.pagePosition=="bottom"||this.props.pagePosition=="both")?"block":"none")}}>
                        <div style={{display:(this.props.pagination?"block":(this.state.data instanceof Array &&this.state.data.length>0)?"block":"none")}}>
                            {this.renderPaginationTwo()}
                        </div>
                        {this.renderTotal()}

                    </div>
                    <div className="wasabi-table-loading" style={{display:this.state.loading==true?"block":"none"}}></div>
                    <div className="wasabi-load-icon"  style={{display:this.state.loading==true?"block":"none"}}></div>
                    <div onMouseUp={this.divideMouseUpHandler}  ref="tabledivide" className="wasabi-table-divide"  style={{top:(this.props.pagePosition=="top"||this.props.pagePosition=="both")?35:0}}></div>
                    <div className="wasabi-header-menu-container" ref="headermenu">
                        <ul className="wasabi-header-menu">
                            <li key="first"><a href="javascript:void(0);" className="header-menu-item" onMouseDown={this.menuHideHandler} >隐藏此列</a></li>
                            {headerMenuCotrol}
                        </ul>
                    </div>
                    <MiniTable ref="setHeaderTableModal" data={this.state.remoteHeaders} OKHandler={this.setHeaderModalOKHandler} resetHandler={this.resetHandler}/>
                </div>
            </div>
        );
    }
});
module .exports=DataGrid;
