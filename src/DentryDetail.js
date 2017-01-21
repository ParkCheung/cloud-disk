/**
 * 列表项详情
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
import DownloadLinkDialog from './DownloadLinkDialog';

export default class DentryDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mouseOver: false,
            display:this.props.display
        }
    }


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

    handleClick(type) {
        if (type === "dentry") {
            this.props.onItemClick(this.state);
        } else {
            this.props.onCheckClick(this.state);
        }
    }

    //处理鼠标覆盖事件
    handleMouseOver() {
        this.setState({
            mouseOver: true
        })
    }
    //处理鼠标移除事件
    handleMouseLeave() {
        this.setState({
            mouseOver: false
        })
    }

    //显示下载地址
    showDownloadLink(item){
        React.render(<DownloadLinkDialog dentry={item}/>, document.getElementById('download_link_div'));
    }

    //下载文件
    downloadFile(item){
        //文件 直接下载
        var url = "http://" + Content.CSHOST + "/v0.1/download/actions/direct?path=" + encodeURIComponent(item.path)+"&attachment=true";
        if (item.scope === 0) {
            url += "&session=" + Content.SESSION;
        }
        window.open(url);
    }

    //删除文件
    deleteDentry(){
       this.props.deleteDentry();
    }

    //处理鼠标移除事件
    handleBlur() {
        var name = React.findDOMNode(this.refs.newName).value;
        this.props.createDentry(name);
    }

    render() {
        var item = this.props.dentry;
        var nodeType = this.props.nodeType;
        var size = "-";
        var ext = "";
        var updateAt = DentryDetail.formatDate(item.update_at);
        if (item.inode) {
            size = item.inode.size;
            ext = item.inode.ext;
            size = DentryDetail.convertSize(size);
        }
        var iconAddr = DentryDetail.getDentryImage(item.type, ext);
        var display = this.state.display && this.state.display === "none" ? "none" : "";
        return (
            <tr style={{display: display, backgroundColor: this.state.mouseOver ? "#eee" : ""}}
                id={display === "none" ? "create_folder_dentry" : ""} onMouseOver={this.handleMouseOver.bind(this)}
                onMouseLeave={this.handleMouseLeave.bind(this)}>
                <td className="list_td"><input type="checkbox" checked={this.props.checked}
                                               onClick={this.handleClick.bind(this, "checkbox")}/>
                </td>
                <td className="list_td">
                    <div className="list_dentry_name"><img className="dentry_icon"
                                                           src={iconAddr}/>
                    </div>
                    <div className="list_link"/>
                    {
                        nodeType === "input" ?
                            <input className="new_dentry_name" type="text" defaultValue={item.name} id={item.dentry_id}
                                   maxLength="128" required="required" ref="newName"
                                   onBlur={this.handleBlur.bind(this)}/> :
                            <label className="dentry_name" onClick={this.handleClick.bind(this, "dentry")}
                                   id={item.dentry_id}>{item.name}</label>
                    }
                    <div className="list_link"/>
                    <a className="btn-single-delete" style={{display: this.state.mouseOver ? "" : "none"}}><img
                        src="build/img/recycle.png" onClick={this.deleteDentry.bind(this)}/></a>
                    <a className="btn-single-download"
                       style={{display: this.state.mouseOver && item.type !== 0 ? "" : "none"}}><img
                        src="build/img/download2.png" onClick={this.downloadFile.bind(this,item)}/></a>
                    <a className="btn-download-link" style={{display: this.state.mouseOver && item.type !== 0 ? "" : "none"}} onClick={this.showDownloadLink.bind(this,item)}><img
                        src="build/img/link.png"/></a>

                </td>
                <td className="list_td"><input type="checkbox" checked={item.scope == 1}
                                               className="checkbox-scope"/></td>
                <td className="list_td">{size}</td>
                <td className="list_td">{updateAt}</td>
            </tr>
        )
    }
}
