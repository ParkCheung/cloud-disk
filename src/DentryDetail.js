/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
export default class DentryDetail extends React.Component {


    static convertSize(value) {
        if (value === "-") {
            return value;
        }

        if (null === value || value === '') {
            return "0 Bytes";
        }
        var unitArr = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        var index = 0;

        var quotient = parseFloat(value);
        while (quotient > 1024) {
            index += 1;
            quotient = quotient / 1024;
        }
        return quotient.toFixed(2) + " " + unitArr[index];
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

    static formatDate(updateAt) {
        var date = new Date(updateAt);
        return date.getFullYear() + "-" + (date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " " + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
    }


    handleClick(){
        this.props.onClick(this.state)
    }

    render() {
        var item = this.props.dentry;
        var size = "-";
        var ext = "";
        var updateAt = DentryDetail.formatDate(item.update_at);
        if (item.inode) {
            size = item.inode.size;
            ext = item.inode.ext;
            size = DentryDetail.convertSize(size);
        }
        var iconAddr = DentryDetail.getDentryImage(item.type, ext);
        return (
            <tr className="dentry_detail">
                <td className="list_td"><input type="checkbox"/>
                </td>
                <td className="list_td">
                    <div className="list_dentry_name"><img className="dentry_icon"
                                                           src={iconAddr}/>
                    </div>
                    <div className="list_link"/>
                    <label className="dentry_name" onClick={this.handleClick.bind(this)}>{item.name}</label>
                    <div className="list_link"/>
                    <a className="btn-single-delete"><img src="build/img/recycle.png"/></a>
                    <a className="btn-single-download"><img src="build/img/download2.png"/></a>
                    <a className="btn-download-link"><img src="build/img/link.png"/></a>

                </td>
                <td className="list_td"><input type="checkbox" checked={item.scope == 1}
                                               className="checkbox-scope"/></td>
                <td className="list_td">{size}</td>
                <td className="list_td">{updateAt}</td>
            </tr>
        )
    }
}
