/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
import DentryDetail from './DentryDetail.js';
var $ = require("../build/jquery-2.2.0.min.js");

export default class DentryListPanel extends React.Component {

    constructor(props) {
        super(props);
        this.pageTop = 0;
        this.pageButtom = 0;
        this.hasNextPage = false;
        this.hasPrePage = false;
        this.currentPath = "";
        this.session = this.props.session;
        this.state = {
            data: []
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
    handleItemClick(item){
        if(item.type === 0){
            this.currentPath = item.path;
            this.props.onCurrentPathChange(this.currentPath);
            var url = "http://sdpcs.dev.web.nd/v0.1/dentries?path=" + this.currentPath + "&$filter=updateAt+gt+0&$limit=16&$orderby=updateAt+Desc&session=" + this.session;
            this.getList(url)
        }
    }

    //获取上一页
    pagePre() {
        var url = "http://sdpcs.dev.web.nd/v0.1/dentries?path=" + this.currentPath + "&$filter=updateAt+gt+" + this.pageTop + "&$limit=16&$orderby=updateAt+Asc&session=" + this.session;
        this.getList(url, "pre")
    }

    //获取下一页
    pageNext() {
        var url = "http://sdpcs.dev.web.nd/v0.1/dentries?path=" + this.currentPath + "&$filter=updateAt+lt+" + this.pageButtom + "&$limit=16&$orderby=updateAt+Desc&session=" + this.session;
        this.getList(url, "next")
    }

    render() {
        //第一次进入该目录
        if(this.props.currentPath !== this.currentPath){
            this.currentPath = this.props.currentPath;
            var url = "http://sdpcs.dev.web.nd/v0.1/dentries?path=" + this.currentPath + "&$filter=updateAt+gt+0&$limit=16&$orderby=updateAt+Desc&session=" + this.session;
            this.getList(url)
        }

        var offset = 0;
        var length = this.state.data.length;
        return (
            <div className="content_container list_mode_div">
                <div className="wrap" style={{float: "left"}}>

                    <table id="list_table" className="list_table">
                        <tr id="list_title" className="list_title">
                            <td className="list_td" style={{width: " 30px"}}><input type="checkbox" id="check_all"/>
                            </td>
                            <td className="list_td_name" style={{width: "auto"}}>文件名</td>
                            <td className="list_td" style={{width: "30px"}}>公开</td>
                            <td className="list_td" style={{width: "60px"}}>大小</td>
                            <td className="list_td" style={{width: "150px"}}>修改日期</td>
                        </tr>
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
                                return <DentryDetail onClick={this.handleItemClick.bind(this,item)} dentry={item}/>
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