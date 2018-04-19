/**
 * Created by zhiyongwang on 2016-02-24.
 * 页签数据模型
 */
class TabModel
{
    constructor(title,url=null,active=false,content=null,iconCls=null,parentuuid=null,unique=false)
    {
        this.title=title;
        this.url=url;
        this.active=active;
        this.content=content;
        this.iconCls=iconCls;
         function uuid() {//生成uuid
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        }
        this.uuid=uuid();//生成一个唯一标识。只读属性
        this.parentuuid=parentuuid;//父标签页的唯一标识
        this.unique = unique;  //是否需要检查去重复，如果为true就是要检查判断是否已经存在同名菜单，有则打开原有菜单
    }
}
module .exports=TabModel;