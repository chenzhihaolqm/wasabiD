
require("../Sass/Form/InputNumber.scss");
let React=require("react");
let Input=require("./Input.jsx");
var InputNumber=React.createClass({
    propTypes: {
       defaultValue: React.PropTypes.number,
        value: React.PropTypes.number,
        step: React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string]),
        max: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
        min: React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string]),
        disabled: React.PropTypes.bool,
        onChange:React.PropTypes.func,
    },
    getDefaultProps:function() {
        return{
            step: 1,
            max: Infinity,
            min: 0,
            value:0
        }
    },
    getInitialState:function() {
        return{
           value:this.props.value
        }
    },
    componentWillReceiveProps:function(nextProps) {
        this.setState({
            value:nextProps.value
        });
    },
    componentWillUpdate(nextProps, nextState){
          //console.log(`${nextProps.value}---------${nextState.value}`);
          /*if(nextProps.value !== nextState.value){
              this.props.onChange && this.props.onChange(nextState.value);
          }*/

    },
    increaseNum:function(){
        let nextVal = eval(this.state.value||0) + this.props.step;
        if(nextVal<=this.props.max){
            this.setState({
                value:nextVal
            });
            this.props.onChange && this.props.onChange(nextVal);
        }
    },
    decreaseNum:function(){
        let preVal = eval(this.state.value||0) - this.props.step;
        if(preVal>=this.props.min){
            this.setState({
                value:preVal
            });
            this.props.onChange && this.props.onChange(preVal);
        }
    },
    changeHandler:function(event){
        let inpuptValue = event.target.value;
        if(/^\d+$/.test(inpuptValue)||inpuptValue===""){
            let transferVal = eval(inpuptValue||0);
            if((this.props.min<=transferVal && this.props.max>=transferVal)||inpuptValue==="" ){
                this.setState({
                    value:inpuptValue
                });
                this.props.onChange && this.props.onChange(inpuptValue);  
            }
        }
    },

    render:function() {
        let prevDisabled = eval(this.state.value||0)<= this.props.min;
        let nextDisabled = eval(this.state.value||0)>= this.props.max;
        let preCls = "icon_decrease"+(prevDisabled?" disabled":"");
        let nextCls = "icon_increase"+(nextDisabled?" disabled":"");
        return (<div className="el-input-number">
                <input  type="text" value={this.state.value}  onChange={this.changeHandler}></input>
                <span className={preCls} onClick={this.decreaseNum}>-</span>
                <span className={nextCls} onClick={this.increaseNum}>+</span>
             </div>
        )
    }
});
module .exports=InputNumber;