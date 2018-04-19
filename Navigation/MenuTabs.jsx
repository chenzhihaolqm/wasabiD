/*create by wangzy
 //date:2016-03-02后开始a独立框架改造
 //标签页组
 */
require("../Sass/Navigation/MenuTabs.scss");
require("../Sass/Buttons/icon.scss");
var React =require("react");
var Tab=require("./MenuTab.jsx");
var TabSection=require("./MenuTabSection.jsx");
var LinkButton=require("../Buttons/LinkButton.jsx");
var unit=require("../libs/unit.js");

class MenuTabs extends  React.Component {
    constructor(props) {
        super(props);
        this.menuHandler = this.menuHandler.bind(this);
        this.homeHandler = this.homeHandler.bind(this);
        this.userHandler=  this.userHandler.bind(this);
        this.tabClickHandler = this.tabClickHandler.bind(this);
        this.tabCloseHandler = this.tabCloseHandler.bind(this);
        this.leftClickHandler= this.leftClickHandler.bind(this);
        this.rightClickHandler= this.rightClickHandler.bind(this);
        this.onWindowResize=this.onWindowResize.bind(this);

        //复制一份，当菜单关闭时用于比较显示的位置，不能直接复制给状态值，这样会导致不停的刷新
        this.oldTabsLength=(this.props.tabs).length;
        let resultWidth=this.setDeWidth();

        var rightIndex=0;//右边下标
        if(this.props.tabs instanceof  Array&&this.props.tabs.length>0) {
            if (this.props.tabs.length < resultWidth.availNum) {
                rightIndex = this.props.tabs.length - 1;
            }
            else {
                rightIndex = resultWidth.availNum - 1;
            }
        }


        this.  state = {
            tabs: this.props.tabs,
            homeActive: -1,//主页是否处于激活状态
            menuVisible: false,//
            leftIndex: 0,//可见的第一个下标
            rightIndex:rightIndex,//可见的最后一个下标
            availWidth:resultWidth.availWidth,//可以宽度
            availNum: resultWidth.availNum,//可用个数
            tabMoveLineClass:"bottomLine",
        }
    }

    static    propTypes = {
        tabs: React.PropTypes.array,//标签页数据
        menuHandler: React.PropTypes.func,//菜单按钮的单击事件
        homeUrl: React.PropTypes.string,//主页的链接地址
        userHandler: React.PropTypes.func,//用户个人中心按钮的单击事件
        userComponent:React.PropTypes.any,//用户自定义的组件
        menuComponent:React.PropTypes.any,//用户自定义菜单栏组件
        tabNumChangeHandler: React.PropTypes.func,//标签页数据发生改变事件
        logoImg: React.PropTypes.string,//系统logo图片

    }
    static defaultProps = {
        tabs: null,
        menuHandler: null,
        homeUrl: null,
        userHandler: null,
        userComponent: null,//用户自定义组件
        menuComponent:null,
        cellWidth: 121,//单元格默认宽度
        tabNumChangeHandler:null,//标签页数据发生改变事件
        logoImg: "",//系统logo图片
    }


    setDeWidth() {//设置可以用宽度与可用个数
        var detractWidth = 0;//被减去的宽度,
        if (this.props.menuHandler) {//是否有菜单按钮
            detractWidth += 40;
        }
        if (this.props.homeUrl) {//是否有主页按钮
            detractWidth += 40;
        }
        if (this.props.userComponent) {//是否自定义用户信息
            detractWidth += 300;
        }
        else if (this.props.userHandler) {//是否有用户按钮
            detractWidth += 40;
        }
        var availWidth=document.body.getBoundingClientRect().width - 200;
        var availNum = parseInt((availWidth) / this.props.cellWidth);
        return {
            availWidth: availWidth,//可用宽度
            availNum: availNum,//可用个数
        }
    }
    componentWillReceiveProps(nextProps) {

        var leftIndex=this.state.leftIndex;
        var rightIndex=this.state.rightIndex;
        if(nextProps.tabs instanceof  Array) {
            if(nextProps.tabs.length<=this.state.availNum){//没有超过不管

                leftIndex=0;
                rightIndex=nextProps.tabs.length-1;
            }
            else{
                if(nextProps.tabs.length>this.oldTabsLength){//追加了

                    leftIndex=nextProps.tabs.length-this.state.availNum;
                    rightIndex=nextProps.tabs.length-1;
                }
                else if(nextProps.tabs.length<this.oldTabsLength) {//减少了

                    if(rightIndex<nextProps.tabs.length-1)
                    {//不用处理，仍然可以显示

                    }
                    else
                    {//左侧处理，右侧显示最后一个

                        leftIndex=this.state.leftIndex-(this.oldTabsLength-nextProps.tabs.length);
                        rightIndex=nextProps.tabs.length-1;
                    }

                }
            }
        }
        /*通过js控制iframe添加，移除，更改显示状态*/
        this.iframeSectionHandler(nextProps.newTab,nextProps.closeTab,nextProps.tabs);

        this.setState({
            tabs:( nextProps.tabs),
            leftIndex:leftIndex,
            rightIndex:rightIndex,
            homeActive: (nextProps.tabs&&nextProps.tabs.length>0)?false:true,//判断主页是否激活
            menuVisible: nextProps.menuVisible,//菜单按钮是否打开
            tabMoveLineClass:"",
        })
    }
    showIframe(iframe){
        iframe.className = "checkedsection";
    }
    hideIframe(iframe){
        iframe.className = "tabsection";
    }
    /*通过js控制iframe添加，移除，更改显示状态*/
    iframeSectionHandler(newTab,closeTab,allTabs){
        var iframeWrap =  document.getElementById("iframeWrap");
        var iframes = iframeWrap ? Array.from(iframeWrap.getElementsByTagName("iframe")):[];
        if(newTab){
            /*新打开一个菜单*/
            iframes.forEach(iframe=>{
                this.hideIframe(iframe);
            });
            var  bodyHeight=document.documentElement.clientHeight-80;
            var iframe = document.createElement("iframe");
            iframe.src = newTab.url;
            iframe.uuid = newTab.uuid;
            iframe.style.height = bodyHeight+"px";
            this.showIframe(iframe);
            iframeWrap && iframeWrap.appendChild(iframe);

        } else if(closeTab){
            /*关闭一个菜单*/
            if(iframes){
                for(let iframe of iframes){
                   if( iframe.uuid== closeTab.uuid){
                       iframeWrap && iframeWrap.removeChild(iframe);
                   }
                }
            }
        }
        if(!newTab && iframes){
            /*关闭菜单或切换菜单时，判断要展示哪个菜单*/
            for(let iframe of iframes){
                this.hideIframe(iframe);
            }
            var showHomeIndex = true; //是否展示首页
            for(let tabItem of allTabs){
                if(tabItem.active && iframes ){
                    for(let iframe of iframes){
                        if( iframe.uuid== tabItem.uuid){
                            this.showIframe(iframe);
                            showHomeIndex = false;
                            break;
                        }
                    }
                    break;    
                }
            }
            if(showHomeIndex && iframes[0]){
                let homeIframe = iframes[0];
                this.showIframe(homeIframe);
            }
        }

    }
    menuHandler() {//显示/隐藏菜单的事件
        this.setState({
            menuVisible: !this.state.menuVisible
        })
        this.props.menuHandler(!this.state.menuVisible);//回调父组件
    }
    userHandler(){
        if(this.props.userComponent)
        {//如果自定义了组件，不处理

        }
        else
        {
            if(this.props.userHandler)
            {
                this.props.userHandler();//回调父组件
            }
        }

    }

    homeHandler(){//主页的单击事件
        var newTabs = this.state.tabs;
        //当前激动的tab下标保存
        for (var i = 0; i < newTabs.length; i++) {

            newTabs[i].active = false;

        }
        /*通过js控制iframe添加，移除，更改显示状态*/
        this.iframeSectionHandler("","",newTabs);
        unit.elasticMove(this.refs.tabBottomLine,"left",0);//弹性运动
        this.setState({
            homeActive:true,
            tabs:newTabs,
            tabMoveLineClass:"bottomLine",
        })

    }



    tabClickHandler(index,event) {
        unit.elasticMove(this.refs.tabBottomLine,"left",event.target.offsetParent.offsetLeft);//弹性运动
        //页签单击事件
        var newTabs = this.state.tabs;
        //当前激动的tab下标保存
        for (var i = 0; i < newTabs.length; i++) {
            if (i == index) {
                newTabs[index].active = true;
            }
            else {
                newTabs[i].active = false;
            }
        }
        /*通过js控制iframe添加，移除，更改显示状态*/
        this.iframeSectionHandler("","",newTabs);
        this.setState({
            tabs: newTabs,
            homeActive:false,
            tabMoveLineClass:"bottomLine",
        });
    }

    tabCloseHandler(index) {

        this.oldTabsLength=this.state.tabs.length;//保留旧的
        var newTabs =this.state.tabs;
        var parentuuid = newTabs[index].parentuuid;
        var parentIndex = null;//父页面的下标
        for (var i = 0; i < newTabs.length; i++) {
            if (newTabs[i].uuid == parentuuid) {
                parentIndex = i;
                break;
            }
        }
        if (newTabs[index].active == true) { //删除tab为激活的tab
            if (parentIndex != null) {//存在父页面，父页面激活
                newTabs[parentIndex].active = true;
            }
            else {//不存在父页面，激活临近页面
                if (index < newTabs.length - 1) {//不是最后一个，下一个激活
                    newTabs[index + 1].active = true;

                }
                else {
                    //最后一个，上一个激活
                    if (index != 0) {
                        newTabs[index - 1].active = true;
                    }
                    else {
                    }

                }
            }
        }
        var closeTab = newTabs[index];
        newTabs.splice(index, 1);//删除

        var leftIndex=this.state.leftIndex;
        var rightIndex=this.state.rightIndex;


        if(newTabs.length<=this.state.availNum){//没有超过不管
            leftIndex=0;
            rightIndex=newTabs.length-1;
        }
        else{
            if(rightIndex<newTabs.length)
            {//不用处理，仍然可以显示,注意这里的

            }
            else
            {//左侧处理，右侧显示最后一个
                leftIndex=leftIndex-1;
                rightIndex=newTabs.length-1;
            }


        }
        /*通过js控制iframe添加，移除，更改显示状态*/
        this.iframeSectionHandler("",closeTab,newTabs);
        this.setState({
            tabs: newTabs,
            leftIndex:leftIndex,
            rightIndex:rightIndex,
            homeActive:newTabs.length==0?true:false
        })
        if (this.props.tabNumChangeHandler) {
            this.props.tabNumChangeHandler(newTabs);//返回给你父组组件更新
        }
    }


    leftClickHandler() {

        if(this.state.leftIndex>0)
        {
            this.setState({
                leftIndex:this.state.leftIndex-1,
                rightIndex:this.state.rightIndex-1,
            })
        }
    }
    rightClickHandler() {
        if (this.state.rightIndex < this.state.tabs.length - 1) {
            this.setState({
                leftIndex: this.state.leftIndex + 1,
                rightIndex: this.state.rightIndex + 1,
            })
        }
    }


    componentDidMount() {
        window.addEventListener('resize', this.onWindowResize)
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize)
    }

    onWindowResize(){
        let resultWidth=this.setDeWidth();
        var rightIndex=0;//右边下标
        if(this.props.tabs instanceof  Array&&this.props.tabs.length>0) {
            if (this.props.tabs.length < resultWidth.availNum) {
                rightIndex = this.props.tabs.length - 1;
            }
            else {
                rightIndex = resultWidth.availNum - 1;
            }
        }
        this.setState({
            rightIndex:rightIndex,//可见的最后一个下标
            availWidth:resultWidth.availWidth,//可以宽度
            availNum: resultWidth.availNum,//可用个数
        })
    }

    render() {
        var tabobj = [];
        var sectionobj = [];
        var tabclickHandler = this.tabClickHandler;
        var tabCloseHandler = this.tabCloseHandler;
        var showArrow=false;//是否显示箭头

        if(this.state.tabs instanceof  Array) {
            if (this.state.tabs.length > this.state.availNum) {//大于可用个数
                showArrow = true;
            }

            this.state.tabs.map((child, index) => {
                if (child.active == true) {//保存当前激活标签uuid，用于子标签中打开新标签时设置其父标签
                    window.localStorage.setItem("alog_currentTabUUID", child.uuid);//保存当前激活节点，用于新建tab
                    if (child.parentuuid != null) {//记录当前节点的父节点，用于关闭时更新父tab
                        var parentTabUUID = window.localStorage.getItem("parentTabUUID");
                        if (parentTabUUID == null) {
                            parentTabUUID = "";
                        };
                        parentTabUUID += child.uuid + "$" + child.parentuuid;//);//保存当前激活节点的uuid及父节点的uuid,用于关闭tab时刷新父节点,
                        window.localStorage.setItem("parentTabUUID", parentTabUUID);
                    }

                }
                tabobj.push(<Tab key={"tab" + index}  noBottomBorder={this.state.tabMoveLineClass?true:false} onContextMenu={this.headerContextMenuHandler} index={index}  title={child.title} iconCls={child.iconCls}
                                 active={child.active} clickHandler={tabclickHandler}
                                 closeHandler={tabCloseHandler} hide={(index>=this.state.leftIndex&&index<=this.state.rightIndex)?false:true} ></Tab>);
                sectionobj.push(<TabSection key={"tabsection" + index} url={child.url}
                                            active={(this.state.homeActive) ? false : child.active}
                                            content={child.content}></TabSection>);
            });
        }
        else {

        }

        if (this.props.homeUrl ) {//如果有主页的话
            tabobj.unshift(<Tab key={"tab"} noBottomBorder={this.state.tabMoveLineClass?true:false} title={"首页"} index={-1}
                                active={(this.state.homeActive)?true:false} clickHandler={this.homeHandler}
                             closeHandler={tabCloseHandler} ></Tab>);
            sectionobj.unshift(<TabSection key={"homesection"} url={this.props.homeUrl}
                                           active={(this.state.homeActive)?true:false}></TabSection>)
        }

        var  bodyHeight=document.documentElement.clientHeight-80;
        return (
            <div className="wasabi-nav-container">
                <ul className=" wasabi-nav-tabs" ref="menutab">  
                    <li className="tabmenu"><img src={this.props.logoImg}></img></li>
                    <li className="content"> 
                        {this.props.menuComponent}
                    </li>
                    <li style={{display:(this.props.userComponent||this.props.userHandler)?"inline-block":"none"}}
                        className={(this.props.userComponent?"tabuser-control":this.props.userHandler?"tabuser":"") }
                         onClick={this.userHandler}>{this.props.userComponent}
                    </li>
                </ul>
                <div className="tabWrap">
                    <div className="left icon-left" onClick={this.leftClickHandler} style={{display:showArrow?"inline-block":"none"}}></div>
                    <ul style={{left:this.state.left}} ref="tabWrapUl">{tabobj}<li className={this.state.tabMoveLineClass} ref="tabBottomLine"></li></ul>
                    <div className="right icon-right" onClick={this.rightClickHandler} style={{display:showArrow?"inline-block":"none"}}></div>
                </div>
                <section ref="iframeWrap"  id="iframeWrap">
                        <iframe className="checkedsection" src={this.props.homeUrl} style={{height:bodyHeight}} ></iframe>
                </section>

            </div>);

    }
};
module.exports=MenuTabs;
