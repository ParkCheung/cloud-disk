/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
import DentryDetail from './DentryDetail.js';

export default class DentryListPanel extends React.Component {

    constructor(props) {
        super(props);
        this.pageTop = 0;
        this.pageButtom = 0;
        this.hasNextPage = false;
        this.hasPrePage = false;
        this.currentPath = "";
        this.updateAt = this.props.updateAt;
        this.selectItems = [];
        this.state = {
            data: [],
            checkAll: false
        };
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
            this.setState({
                data: result.items
            });
        }.bind(this));
    }

    //文件夹翻页 文件下载
    handleItemClick(item) {
        var url;
        //文件夹 获取列表
        if (item.type === 0) {
            this.props.onCurrentPathChange(item.path);
        } else {
            //文件 直接下载
            url = "http://" + Content.CSHOST + "/v0.1/download?path=" + encodeURIComponent(item.path);
            if (item.scope === 0) {
                url += "&session=" + Content.SESSION;
            }
            window.open(url);
        }
    }

    handleCheckAllClick() {
        this.selectItems = this.selectItems.length < this.state.data.length ? this.state.data : [];
        this.props.onSelectChange(this.selectItems);
    }


    //列表选项被选中事件
    handleCheckClick(item) {
        var index = this.selectItems.indexOf(item);
        if (index === -1) {
            this.selectItems.push(item);
        } else {
            this.selectItems.splice(index, 1);
        }
        this.props.onSelectChange(this.selectItems);
    }

    //获取上一页
    pagePre() {
        var url = "http://" + Content.CSHOST + "/v0.1/dentries?path=" + this.currentPath + "&$filter=updateAt+gt+" + this.pageTop + "&$limit=16&$orderby=updateAt+Asc&session=" + Content.SESSION;
        this.getList(url, "pre")
    }

    //获取下一页
    pageNext() {
        var url = "http://" + Content.CSHOST + "/v0.1/dentries?path=" + this.currentPath + "&$filter=updateAt+lt+" + this.pageButtom + "&$limit=16&$orderby=updateAt+Desc&session=" + Content.SESSION;
        this.getList(url, "next")
    }

    render() {
        //第一次进入该目录或者列表有更新
        if (this.props.currentPath !== this.currentPath || this.props.updateAt > this.updateAt) {
            this.currentPath = this.props.currentPath;
            this.updateAt = this.props.updateAt;
            var url = "http://" + Content.CSHOST + "/v0.1/dentries?path=" + this.currentPath + "&$filter=updateAt+gt+0&$limit=16&$orderby=updateAt+Desc&session=" + Content.SESSION;
            this.getList(url);
            //防止重复渲染
            return (<div></div>)
        } else {
            var offset = 0;
            var length = this.state.data.length;
            var selectAll = length > 0 && this.selectItems.length === length;

            var newFolder = {
                name: "新建文件夹",
                type: 0,
                update_at: new Date().getTime()
            };

            return (
                <div className="content_container list_mode_div">
                    <div className="wrap" style={{float: "left"}}>
                        <table id="list_table" className="list_table">
                            <tr id="list_title" className="list_title">
                                <td className="list_td" style={{width: " 30px"}}><input type="checkbox"
                                                                                        checked={selectAll}
                                                                                        onClick={this.handleCheckAllClick.bind(this)}/>
                                </td>
                                <td className="list_td_name" style={{width: "auto"}}>文件名</td>
                                <td className="list_td" style={{width: "30px"}}>公开</td>
                                <td className="list_td" style={{width: "60px"}}>大小</td>
                                <td className="list_td" style={{width: "150px"}}>修改日期</td>
                            </tr>
                            <DentryDetail dentry={newFolder} checked={false} display="none" nodeType="input"
                                          createDentry={this.props.onCreateDentry.bind(this)}/>
                            {
                                this.state.data.map(function (item) {
                                    if (offset === 0) {
                                        this.pageTop = item.update_at;
                                    }
                                    if (offset === length - 1) {
                                        this.pageButtom = item.update_at;
                                        offset = 0;
                                    }
                                    offset++;
                                    var checked = this.selectItems.indexOf(item) !== -1;
                                    return <DentryDetail onItemClick={this.handleItemClick.bind(this, item)}
                                                         onCheckClick={this.handleCheckClick.bind(this, item)}
                                                         dentry={item}
                                                         checked={checked}
                                                         nodeType={this.props.updateAt === -1 && this.selectItems.indexOf(item) != -1?"input":""}/>
                                }.bind(this))
                            }
                        </table>
                        <div id="page_turning" className="page_turning">
                            <div className="wrap page_div">
                                {
                                    this.hasNextPage === true ?
                                        <div className="page_button"><a id="next_list" className="btn1 btn_dialog"
                                                                        onClick={this.pageNext.bind(this)}>下一页</a>
                                        </div> : <div></div>
                                }
                                {
                                    this.hasPrePage === true ?
                                        <div className="page_button"><a id="pre_list" className="btn1 btn_dialog"
                                                                        onClick={this.pagePre.bind(this)}>上一页</a>
                                        </div> : <div></div>
                                }
                            </div>
                        </div>

                    </div>
                </div>
            );
        }
    }

}