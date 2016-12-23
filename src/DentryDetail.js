/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
var $ = require("../build/jquery-2.2.0.min.js");
export default class DentryDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {data: []};
    }

    componentDidMount() {
        $.get(this.props.listUrl, function (result) {
            this.setState({
                data: result.items
            });
        }.bind(this));
    }

    static getDentryImage(type, ext) {
        var iconPath;
        if (type == 0) {
            return "build/img/floder_icon.png";
        }
        switch (ext) {
            case ".doc":
            case ".docx":
                iconPath = "build/img/doc_icon.png";
                break;
            case ".exe":
                iconPath = "build/img/exe_icon.png";
                break;
            case ".pdf":
                iconPath = "build/img/pdf_icon.png";
                break;
            case ".txt":
                iconPath = "build/img/txt_icon.png";
                break;
            case ".ppt":
            case ".pptx":
                iconPath = "build/img/ppt_icon.png";
                break;
            case ".xls":
            case ".xlsx":
                iconPath = "build/img/xls_icon.png";
                break;
            case ".zip":
            case ".rar":
            case ".gz":
                iconPath = "build/img/zip_icon.png";
                break;
            case ".flv":
            case ".mp3":
            case ".mp4":
            case ".rmvb":
            case ".avi":
                iconPath = "build/img/vedio_icon.png";
                break;
            case ".jpg":
            case ".png":
            case ".jpeg":
            case ".webp":
            case ".bmp":
                iconPath = "build/img/image_icon.png";
                break;
            default :
                iconPath = "build/img/file_icon.png";
                break;
        }
        return iconPath;
    }



    render() {

        return (
            <div>
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
                            var size = "-";
                            var ext = "";
                            if(item.inode){
                                size = item.inode.size;
                                ext = item.inode.ext;
                            }
                            var iconAddr = DentryDetail.getDentryImage(item.type,ext);

                            return <tr className="dentry_detail">
                                <td className="list_td"><input type="checkbox" className="checkbox"/>
                                </td>
                                <td className="list_td">
                                    <div className="list_dentry_name"><img className="dentry_icon"
                                                                           src={iconAddr}/>
                                    </div>
                                    <div className="list_link"/>
                                    <label className="dentry_name">{item.name}</label>
                                    <div className="list_link"/>
                                    <a className="btn-single-delete"><img src="build/img/recycle.png"/></a>
                                    <a className="btn-single-download"><img src="build/img/download2.png"/></a>
                                    <a className="btn-download-link"><img src="build/img/link.png"/></a>

                                </td>
                                <td className="list_td"><input type="checkbox" checked="checked"
                                                               className="checkbox-scope"/></td>
                                <td className="list_td">{size}</td>
                                <td className="list_td">{item.update_at}</td>
                            </tr>
                        })
                    }
                </table>
            </div>
        )
    }
}