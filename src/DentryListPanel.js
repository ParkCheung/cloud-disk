/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
import 'whatwg-fetch';
import DentryDetail from './DentryDetail.js';
var $ = require("../build/jquery-2.2.0.min.js");

export default class DentryListPanel extends React.Component {

    constructor(props) {
        super(props);
        this.pageTop = 0;
        this.pageButtom = 0;
        // this.handleClick = this.handleClick.bind(this);
        this.state = {
            data: []
        };
    }

    getList(url) {
        $.get(url, function (result) {
            this.setState({
                data: result.items
            });
        }.bind(this));
    }


    pageUp() {
        var url = "http://sdpcs.dev.web.nd/v0.1/dentries?path=" + this.props.path + "&$filter=updateAt+gt+" + this.pageTop + "&$limit=15&$orderby=updateAt+Asc&session=" + this.props.session;
        this.getList(url)
    }

    pageDown() {
        var url = "http://sdpcs.dev.web.nd/v0.1/dentries?path=" + this.props.path + "&$filter=updateAt+lt+" + this.pageButtom + "&$limit=15&$orderby=updateAt+Desc&session=" + this.props.session;
        this.getList(url)
    }

    componentDidMount() {
        var url = "http://sdpcs.dev.web.nd/v0.1/dentries?path=" + this.props.path + "&$filter=updateAt+gt+0&$limit=15&$orderby=updateAt+Desc&session=" + this.props.session;
        this.getList(url)
    }

    render() {
        var offset = 0;
        var length =  this.state.data.length;
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
                                }
                                offset++;
                                return <DentryDetail dentry={item}/>
                            }.bind(this))
                        }
                    </table>
                    <div id="page_turning" className="page_turning">
                        <div className="wrap page_div">
                            <div className="page_button"><a id="next_list" className="btn1 btn_dialog"
                                                            onClick={this.pageDown.bind(this)}>下一页</a>
                            </div>
                            <div className="page_button"><a id="pre_list" className="btn1 btn_dialog"  onClick={this.pageUp.bind(this)}>上一页</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}