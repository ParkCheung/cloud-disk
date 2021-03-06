/**
 * Created by Administrator on 2017/1/21 0021.
 */
import React from 'react';
export default class DownloadLinkDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            dentryId: this.props.dentry.dentry_id,
            path: this.props.dentry.path,
            scope: this.props.dentry.scope,
            display:""
        }
    }


    //组件接收到新的props
    componentWillReceiveProps(nextProps) {
        this.setState({
            dentryId: nextProps.dentry.dentry_id,
            path: nextProps.dentry.path,
            scope: nextProps.dentry.scope,
            display:""
        });
    }

    componentDidMount(){
        $(".copy").zclip({
            path: "../build/ZeroClipboard.swf",
            copy: function(){
                if(this.id === "btn_link"){
                    return $(".idLink").text();
                }else {
                    return $(".staticLink").text();
                }
            },
            beforeCopy:function(){/* 按住鼠标时的操作 */
                $(this).css("color","grey");
            },
            afterCopy:function(){/* 复制成功后的操作 */
                // var $copysuc = $("<div class='copy-tips'><div class='copy-tips-wrap'>☺ 复制成功</div></div>");
                // $("body").find(".copy-tips").remove().end().append($copysuc);
                // $(".copy-tips").fadeOut(3000);
            }
        });
    }

    //关闭显示窗口
    handleClick(){
        this.setState({
            display:"none"
        });
        //修改复制链接的样式
        $(".copy").css("color","white");
    }


    render() {

        var params = "serviceName=" + Content.SERVICENAME + "&attachment=true";
        var idLink = "http://" + Content.HOST + "/v0.1/download/actions/direct?dentryId=" + this.state.dentryId;
        var staticLink = "http://" + Content.HOST + "/v0.1";
        if (this.state.scope === 0) {
            idLink += "&session=" + Content.SESSION;
            staticLink += "/" + Content.SESSION;
        }
        idLink += "&" + params;
        staticLink += "/static" + encodeURIComponent(this.state.path).replace(/%2F/g, "/") + "?" + params;

        return (
            <div className="fancybox-overlay fancybox-overlay-fixed" id="downloadLinkDialog"
                 style={{width: "auto", height: "auto",display:this.state.display}}>
                <div className="my_dialog downloadLink">
                    <div className="dialog" style={{overflow: "hidden"}}>
                        <div className="dg_header">
                            <h3>文件下载地址查看</h3>
                            <a href="#" className="dg dg_del closeBtn" onClick={this.handleClick.bind(this)}></a>
                        </div>
                        <div className="dg_container">
                            <div className="link_div">
                                <div className="link_div"><p><span>id方式下载地址：</span><a href={idLink}
                                                                                      className="link idLink">{idLink}</a>
                                </p><a
                                    id="btn_link"
                                    className="btn1 btn_link copy">复制链接</a>
                                </div>
                                <div className="link_div"><p><span>静态路径下载地址：</span><a href={staticLink}
                                                                                      className="link staticLink">{staticLink}</a>
                                </p><a id="btn_static"
                                       className="btn1 btn_link copy">复制链接</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}