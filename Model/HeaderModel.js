/**
 * Created by zhiyongwang on 2016-02-24.
 * 列表表头模型
 */
 var EditorModel=require("./EditorModel");
class HeaderModel {
    constructor(name,label,content=null,hide=false,sortAble=false,width=null,fixed=null,align="left",
                rowspan=null,colspan=null,editor=null,required=false,className="")
    {
        this.name=name;
        this.label=label;
        this.content=content;
        this.hide=hide;
        this.sortAble=sortAble;
        this.width=width;
        this.fixed=fixed;//fixedLeft or fixedRight  当前列是否固定在左侧 or 右侧
        this.align=align;
        this.rowspan=rowspan;//表头占几行
        this.colspan=colspan;//表头占几列
        this.editor=editor;//处理编辑时的,默认为文本
        this.required=required;//为header添加的是否必填样式
        this.className=className;//为header添加的class样式
    }
}
module .exports=HeaderModel;