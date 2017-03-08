/**
 * Created by Administrator on 2017/1/24 0024.
 */
import React from 'react';
import DentryDetail from './DentryDetail';
import CsmngDialog from './CsmngDialog.js';
export default class CsmngRecycle extends React.Component {

    constructor(props) {
        super(props);
        this.updateAt = 0;
        this.pageTop = 0;
        this.pageButtom = 0;
        this.hasNextPage = false;
        this.hasPrePage = false;
        this.length = 0;
        this.selectItems = [];
        this.state = {
            display: "none",
            data: []
        }
    }


    handleCheck(item) {
        debugger;
        var index = this.selectItems.indexOf(item);
        if (index === -1) {
            this.selectItems.push(item);
        } else {
            this.selectItems.splice(index, 1);
        }
        if (this.selectItems.length === this.state.data.length && this.selectItems.length !== 0) {
            this.setState({
                data: this.selectItems
            })
        }
    }

    getList(url, direction) {
        $.get(url, function (result) {
            if (result.items.length > 15) {
                this.hasNextPage = true;
                switch (direction) {
                    case "next":
                        result.items.pop();
                        this.hasPrePage = true;
                        break;
                    case "pre":
                        result.items.shift();
                        this.hasPrePage = true;
                        break;
                    default:
                        result.items.pop();
                        this.hasPrePage = false;
                }
            } else {
                switch (direction) {
                    case "next":
                        this.hasPrePage = true;
                        this.hasNextPage = false;
                        break;
                    case "pre":
                        this.hasPrePage = false;
                        this.hasNextPage = true;
                        break;
                    default:
                        this.hasPrePage = false;
                        this.hasNextPage = false;
                }
            }
            this.length = result.items.length;
            if (this.length < 15) {
                for (var i = 0; i < 15 - this.length; i++) {
                    result.items.push({});
                }
            }
            this.setState({
                data: result.items
            });
        }.bind(this));
    }

    //获取上一页
    pagePre() {
        var url = "http://" + Content.HOST + "/v0.1/recycle?$filter=expireAt+gt+" + this.pageTop + "&$limit=16&$orderby=expireAt+Asc&session=" + Content.SESSION;
        this.getList(url, "pre")
    }

    //获取下一页
    pageNext() {
        var url = "http://" + Content.HOST + "/v0.1/recycle?$filter=expireAt+lt+" + this.pageButtom + "&$limit=16&$orderby=expireAt+Desc&session=" + Content.SESSION;
        this.getList(url, "next")
    }

    //关闭对话框
    closePanel() {
        this.setState({
            display: "none"
        });
    }

    //清空回收站
    flushRecycle() {
        this.props.showDialog("flush");
        var _self = this;
        CsmngDialog.confirm(function () {
            var url = "http://" + Content.HOST + "/v0.1/recycle/actions/flush?session=" + Content.SESSION;
            CSHttpClient.doPostRequest(url, JSON.stringify({}), {}, function () {
                var url = "http://" + Content.HOST + "/v0.1/recycle?$filter=expireAt+gt+0&$limit=16&$orderby=expireAt+Desc&session=" + Content.SESSION;
                _self.getList(url);
            }, function () {
                var msg = {
                    error: "清空回收站失败！",
                    errorType: "error"
                };
                _self.props.onShowErrorMsg(msg);
            });
        })

    }


    //组件接收到新的props
    componentWillReceiveProps(nextProps) {
        if (nextProps.updateAt > this.updateAt) {
            this.updateAt = nextProps.updateAt;
            this.setState({
                display: ""
            });
            var url = "http://" + Content.HOST + "/v0.1/recycle?$filter=expireAt+gt+0&$limit=16&$orderby=expireAt+Desc&session=" + Content.SESSION;
            this.getList(url);
        }
    }

    render() {
        var offset = 0;
        var selectAll = this.state.data.length > 0 && this.selectItems.length === this.state.data.length;
        return (
            <div className="fancybox-overlay fancybox-overlay-fixed"
                 style={{width: "auto", height: "auto", display: this.state.display}}>
                <div className="function_dialog recycle_dialog">
                    <div className="dg_header">
                        <h3>回收站</h3>
                        <a href="#" className="dg dg_del closeBtn" onClick={this.closePanel.bind(this)}></a>
                    </div>
                    <div className="function_container">
                        <div className="function_tool">
                            <h5>此处删除后将无法恢复</h5>
                            <a id="flush_recycle" className="btn2 btn_float_right"
                               onClick={this.flushRecycle.bind(this)}>清空</a>
                            <a id="delete_recycle_dentry" className="btn2 btn_float_right">彻底删除</a>
                            <a id="restore_dentry" className="btn2 btn_float_right">还原</a>

                        </div>
                        <div id="recycle_list">
                            <table id="recycle_table" className="function_table">
                                <tr id="recycle_title" className="table_tile">
                                    <td className="list_td" style={{width: "30px", textAlign: "center"}}><input
                                        id="check_recycle_all" type="checkbox" checked={selectAll}></input>
                                    </td>
                                    <td className="list_td" style={{width: "auto"}}>文件名</td>
                                    <td className="list_td" style={{width: "60px"}}>大小</td>
                                    <td className="list_td" style={{width: "140px"}}>过期时间</td>
                                </tr>
                                <tr id="recycle_bottom" style={{display: "none"}}></tr>
                                {
                                    this.state.data.map(function (item) {

                                        if (!item.dentry_id) {
                                            return <tr className="dentry_detail"/>
                                        }

                                        if (offset === 0) {
                                            this.pageTop = item.expire_at;
                                        }
                                        if (offset === this.length - 1) {
                                            this.pageButtom = item.expire_at;
                                            offset = 0;
                                        }
                                        offset++;
                                        var size = "-";
                                        var ext = "";
                                        var expireAt = DentryDetail.formatDate(item.expire_at);
                                        if (item.inode) {
                                            size = item.inode.size;
                                            ext = item.inode.ext;
                                            size = DentryDetail.convertSize(size);
                                        }
                                        var iconAddr = DentryDetail.getDentryImage(item.type, ext);
                                        return <tr className="dentry_detail">
                                            <td className="list_td" style={{textAlign: "center"}}><input type="checkbox"
                                                                                                         className="recycle_checkbox"
                                                                                                         onClick={this.handleCheck.bind(this,item)}/>
                                            </td>
                                            <td className="list_td_name"><img className="dentry_icon"
                                                                              src={iconAddr}/>

                                                <div className="list_link"><label
                                                    className="dentry_name">{item.name}</label></div>
                                            </td>
                                            <td className="list_td">{size}</td>
                                            <td className="list_td">{expireAt}</td>
                                        </tr>

                                    }.bind(this))
                                }
                            </table>
                        </div>
                        <div className="dg_button">
                            {
                                this.hasPrePage === true ? <div style={{width: "50%", height: "50px", float: "left"}}>
                                    <a id="recycle_pre_list"
                                       className="btn1 "
                                       style={{
                                           float: "right",
                                           width: "80px",
                                           fontSize: "14px",
                                           height: "25px",
                                           paddingTop: "7px",
                                           marginRight: "20px"
                                       }} onClick={this.pagePre.bind(this)}>上一页</a>
                                </div> : <div></div>

                            }
                            {
                                this.hasNextPage === true ? <div style={{width: "50%", height: "50px", float: "right"}}>
                                    <a id="recycle_next_list"
                                       className="btn1 "
                                       style={{
                                           float: "left",
                                           width: "80px",
                                           fontSize: "14px",
                                           height: "25px",
                                           paddingTop: "7px"
                                       }} onClick={this.pageNext.bind(this)}>下一页</a>
                                </div> : <div></div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }


}