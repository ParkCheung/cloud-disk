/**
 * Created by Administrator on 2017/1/9.
 */
import React from 'react';
export default class CsmngDialog extends React.Component {



    //关闭对话框
    closeDialog(confirmed) {
        this.props.onCloseDialog(confirmed);
    }

    render() {

        var defaultInfo = {
            title: "确认",
            content: "",
            extra: ""
        };

        var info = {
            delete: {
                title: "删除",
                content: "你确认要删除？",
                extra: "删除后可以在回收站找回哦"
            }
        };

        if(info[this.props.operate]){
            defaultInfo = info[this.props.operate];
        }

        var display = this.props.show ? "" : "none";
        return (
            <div className="fancybox-overlay fancybox-overlay-fixed"
                 style={{width: "auto", height: "auto", display: display}}>
                <div className="my_dialog">
                    <div className="dialog">
                        <div className="dg_header">
                            <h3 id="dialog_title">删除</h3>
                            <a href="#" className="dg dg_del closeBtn" onClick={this.closeDialog.bind(this, false)}></a>
                        </div>
                        <div className="dg_container">
                            <div className="dg_content">
                                <p>{defaultInfo.content}</p>
                                <h5>{defaultInfo.extra}</h5>
                            </div>
                            <div className="dg_button">
                                <a className="btn1 btn_dialog" href="#" id="confirm_btn"
                                   onClick={this.closeDialog.bind(this, true)}
                                >确定</a>
                                <a className="btn2 btn_dialog" href="#" id="cancel_btn"
                                   onClick={this.closeDialog.bind(this, false)}
                                >取消</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}