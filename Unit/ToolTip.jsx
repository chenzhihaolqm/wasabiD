let React=require("react");
require("../Sass/Unit/newToolTip.scss");
let ToolTip=React.createClass({
    propTypes:{
        theme:React.PropTypes.oneOf([
            "dark",
            "light",
        ]),//主题
        size:React.PropTypes.oneOf([
            "small",
            "medium",
            "large"
        ]),//大小
        direction:React.PropTypes.oneOf([
            "south",
            "west",
            "north",
            "east",
        ]),//方向
        iconCls:React.PropTypes.string,//图片
        color:React.PropTypes.string,//图片字体颜色
        content:React.PropTypes.any,//提示信息
    },
    getDefaultProps:function(){
        return{
           theme:"dark",
            size:"medium",
            direction:"west", 
            iconCls:"icon-help",
            color:"#999",   
            content:"",
        };
    },
    getInitialState :function(){
        return{
            hide:true,
            direction:this.props.direction
        };
    },
    showTipHandler:function(event){
        if(event && event.target){
            if(this.refs.iconHelp == event.target){
                event.stopPropagation();
            }
        }
        this.calcTooltipWidth();
        this.setState({
            hide:false
        });
    },
    calcTooltipWidth:function(){
        var toolTip = this.refs.tooltip;
        var target = this.refs.tipTarget;
        var triangle = this.refs.triangle;
        var tarClientRect = target.getBoundingClientRect();
        var tipClientRect=toolTip.getBoundingClientRect();
        var tipWidth = toolTip.offsetWidth;
        var tarWidth = target.offsetWidth;
        var tarLeft = target.offsetLeft;
        var tipLeft = tarLeft+((tarWidth-tipWidth)/2);
        const triangleWidth = 10;

        if(tarClientRect.left+tipLeft<0){
            /*超出左边界*/  
            if(this.state.direction!="west" && this.state.direction!="east"){
                tipLeft = 0;
                toolTip.style.left = tipLeft+5+"px";
                triangle.style.left = (tarWidth/2 -triangleWidth)+"px";
            }
        }else if(tarClientRect.left+Math.abs((tarWidth-tipWidth)/2)>=document.body.clientWidth){
            /*超出右边界*/
            if(this.state.direction!="west" && this.state.direction!="east") {
                tipLeft = tarLeft + (tarWidth - tipWidth);
                toolTip.style.left = tipLeft+5+"px";
                triangle.style.left = (tipWidth-tarWidth/2 - triangleWidth)+"px";
            }
        }else if(this.state.direction!="west" && this.state.direction!="east"){
            /*正常*/
            toolTip.style.left = tipLeft+"px";
            triangle.style.left = (tipWidth/2 - triangleWidth)+"px";
        }
    },
    componentDidMount:function(){
        //判断方向位置
    },
    hideTipHandler:function(event) {//鼠标移开时隐藏下拉
        this.setState({
            hide:true,
        })
    },
    render:function(){
        var className=this.props.theme+"-tooltip"+" "+this.props.theme+" "+this.props.size+" "+this.state.direction;
        var containerClassName = this.props.theme+"-tooltip "+ this.state.direction;
        var tipBodyClassName = "tip-body "+ this.props.theme+" "+ this.props.size;
        return (
            <div className="tooltip-div"
                 onMouseLeave={this.hideTipHandler}
                 style={this.props.style}>
                <div ref="tipTarget" className="tooltip-button" onClick={this.showTipHandler}>
                    {this.props.children}
                    <span ref="iconHelp"  className={"wasabiD-toolTip-icon "+this.props.iconCls}
                          onMouseOver={this.showTipHandler}
                          style={{color:this.props.color}}></span>
                </div>
                <div ref="tooltip" className={containerClassName} style={{visibility:(this.state.hide==true?"hidden":"visible")}}>
                    <span ref="triangle" className="triangle"></span>
                    <div className={tipBodyClassName}>{this.props.content}</div>
                </div>
            </div>
        );
    }
});
module .exports=ToolTip;