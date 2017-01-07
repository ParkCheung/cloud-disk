/**
 * 上传面板
 * Created by Administrator on 2017/1/4.
 */
import React from 'react';
export default class UploadPanel extends React.Component {
    constructor(props) {
        super(props);
        this.cssession = {
            getSession: function (callback) {
                callback(this.props.csSession);
            }.bind(this)
        };

        this.listenner = {
            onNotifySuccess: function (data) {
                console.log(data);
                this.updateList();
            }.bind(this),

            onNotifyFail: function (data) {
                console.log(data);
            },

            onNotifyProgress: function (progress) {
                console.log(JSON.stringify(progress));
                // var percent = Math.floor((progress.loaded / progress.total).toFixed(2) * 100);
                // $('#progress_bar').css("width", percent + "%");
                // $('#progress_num').text(percent + "%");
            }
        };
    }


    //关闭面板操作
    closePanel() {
        this.props.closeUploadPanel();
    }

    updateList() {
        this.props.uploadSuccess(this.currentPath);
    }

    handleChange(e) {

        var files = e.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var remotePath = this.currentPath + "/" + file.name;
            CSClient.upload(this.serviceName, file, remotePath, 0, this.listenner, null, this.cssession);
        }
    }


    //点击上传文件获取上传文件夹
    handleClick() {
        if (this.props.type === "upload") {
            React.findDOMNode(this.refs.file_select).click();
        } else {
            var input = React.findDOMNode(this.refs.upload_floder_chooser);
            input.setAttribute('webkitdirectory', '');
            input.setAttribute('directory', '');
            input.click();
        }
    }

    render() {

        this.serviceName = this.props.serviceName;
        this.session = this.props.session;
        this.currentPath = this.props.currentPath;

        var display = this.props.show ? "" : "none";
        return (
            <div className="fancybox-overlay fancybox-overlay-fixed" id="upload_div"
                 style={{width: "auto", height: "auto", display: display}}>
                <div className="function_dialog upload_dialog">
                    <div className="dg_header">
                        <h3>上传</h3>
                        <a href="#" className="dg dg_del closeBtn" onClick={this.closePanel.bind(this)}/>
                    </div>
                    <div className="function_container">
                        <div className="function_tool">
                            <h5>文件最大支持300MB</h5>
                            {
                                this.props.type === "upload" ? <div style={{float: "right"}}>
                                    <input type="file" name="file" multiple="" ref="file_select"
                                           style={{display: "none"}} onChange={this.handleChange.bind(this)}/>
                                    <a id="upload_button"
                                       className="btn1 btn_float_right" onClick={this.handleClick.bind(this)}>上传文件</a>
                                </div> :
                                    <div style={{float: "right"}}>
                                        <input type="file" style={{display: "none"}} ref="upload_floder_chooser"/>
                                        <a id="upload_floder_button"
                                           className="btn1 btn_float_right"
                                           onClick={this.handleClick.bind(this)}>上传文件夹</a>
                                    </div>
                            }

                            <label style={{padding: "13px", float: "right", "vertical-align": "middle"}}>
                                <input id="scope_check" type="checkbox"/>
                                <label style={{
                                    height: "100%",
                                    "vertical-align": "middle",
                                    "margin-left": "5px"
                                }}>公开文件</label>
                            </label>
                        </div>
                        <div className="upload_show">

                            <table className="function_table">
                                <tr id="Upload_title" className="table_tile">
                                    <td style={{width: "100px"}}><label>文件名</label></td>
                                    <td style={{width: "280px"}}></td>
                                    <td style={{width: "80px"}}><label>大小</label></td>
                                    <td style={{width: "100px"}}><label>上传速度</label></td>
                                    <td style={{width: "20px"}}></td>
                                </tr>
                            </table>
                        </div>
                        <div id="showUploadProgress" className="show_UploadProgress">
                            <table id="Upload_table" className="function_table" style={{width: "633px"}}>
                                <tr id="Upload_bottom">
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}