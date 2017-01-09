/**
 * 上传面板
 * Created by Administrator on 2017/1/4.
 */
import React from 'react';
import Progress from './Progress'
export default class UploadPanel extends React.Component {
    constructor(props) {
        super(props);
        this.preTime = 0;
        this.preLoaded = 0;
        this.uploadingNum = 0;
        this.state = {
            files: []
        };

        //获取session
        this.cssession = {
            getSession: function (callback) {
                callback(Content.SESSION);
            }.bind(this)
        };

        //监听器
        this.listenner = {
            onNotifySuccess: function () {
                if (--this.uploadingNum === 0) {
                    this.updateList();
                }
            }.bind(this),

            onNotifyFail: function (data) {
                console.log(data);
            },

            onNotifyProgress: function (progress) {
                var percent = Math.floor((progress.loaded / progress.total).toFixed(2) * 100);
                $('#' + progress.file_hash + ' div[name="progress_bar"]').css("width", percent + "%");
                $('#' + progress.file_hash + ' p').text(percent + "%");

                if (this.preTime === 0) {
                    $('#' + progress.file_hash + "_speed" + ' div').html(0.00 + "KB/s");
                }
                var currentLoaded = progress.loaded;
                var currentTime = new Date().getTime();

                if (currentTime - this.preTime >= 1000) {
                    var speed = (currentLoaded - this.preLoaded) / (currentTime - this.preTime) * 1000;
                    if (speed < 0) {
                        speed = 0
                    }
                    $('#' + progress.file_hash + "_speed" + ' div').html((speed / 1024).toFixed(2) + "KB/s");
                    this.preTime = currentTime;
                    this.preLoaded = currentLoaded;
                }
            }.bind(this)
        };
    }


    //关闭面板操作并刷新列表
    closePanel() {
        this.props.closeUploadPanel();
        this.updateList();
    }

    //上传文件成功 刷新列表
    updateList() {
        this.props.uploadSuccess(this.currentPath);
    }

    //选择文件后开始上传
    handleChange(e) {
        var fileList = e.target.files;
        var files = [];
        for (var k = 0; k < fileList.length; k++) {
            fileList[k].hash = CSUtils.randomString(16);
            files.push(fileList[k]);
        }

        this.setState({
            files: this.state.files.concat(files)
        });

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var remotePath = this.currentPath + "/" + (file.webkitRelativePath ? file.webkitRelativePath : file.name);
            this.uploadingNum++;
            //TODO 获取公开私密属性
            CSClient.upload(Content.SERVICENAME, file, remotePath, 0, this.listenner, null, this.cssession);
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

    //移除文件 终止上传
    removeFile(file) {
        CSClient.stop(file);

        //重新渲染进度界面
        var filesList = this.state.files;
        for (var i = 0; i < filesList.length; i++) {
            if (filesList[i].hash == file.hash) {
                filesList.splice(i, 1);
                break;
            }
        }
        this.setState({
            files: filesList
        });
        if( this.uploadingNum > 0){
            this.uploadingNum--;
        }
    }

    render() {
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
                                    <input type="file" name="file" multiple="true" ref="file_select"
                                           style={{display: "none"}} onChange={this.handleChange.bind(this)}/>
                                    <a id="upload_button"
                                       className="btn1 btn_float_right" onClick={this.handleClick.bind(this)}>上传文件</a>
                                </div> :
                                    <div style={{float: "right"}}>
                                        <input type="file" style={{display: "none"}} ref="upload_floder_chooser"
                                               onChange={this.handleChange.bind(this)}/>
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
                        <Progress files={this.state.files} onRemoveFile={this.removeFile.bind(this)}/>
                    </div>
                </div>
            </div>
        )
    }
}