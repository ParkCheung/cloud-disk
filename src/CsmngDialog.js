/**
 * Created by Administrator on 2017/1/9.
 */
import React from 'react';
export default class CsmngDialog extends React.Component {

    static doFun() {
    };

    static undoFun() {
    };


    constructor(props) {
        super(props);
        this.updateAt = 0;
        this.state = {
            display: "none"
        }
    }

    //关闭对话框
    closeDialog(confirmed) {
        this.setState({
            display: "none"
        });
        if (confirmed) {
            if(typeof CsmngDialog.doFun === "function"){
                CsmngDialog.doFun();
            }
        } else {
            if(typeof CsmngDialog.undoFun === "function"){
                CsmngDialog.undoFun();
            }
        }
    }


    static confirm(doFun, undoFun) {
        CsmngDialog.doFun = doFun;
        CsmngDialog.undoFun = undoFun;
    }

    //组件接收到新的props
    componentWillReceiveProps(nextProps) {
        if (nextProps.updateAt > this.updateAt) {
            this.updateAt = nextProps.updateAt;
            this.setState({
                display: ""
            })
        }
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
                extra: ""
            },
            flush: {
                title: "清空",
                content: "你确认要清空回收站？",
                extra: ""
            }
        };

        if (info[this.props.operate]) {
            defaultInfo = info[this.props.operate];
        }

        return (
            <div className="fancybox-overlay fancybox-overlay-fixed"
                 style={{width: "auto", height: "auto", display: this.state.display, zIndex: "9999"}}>
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