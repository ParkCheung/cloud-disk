/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
import CsmngHeader from './CsmngHeader.js';
import CsmngNavigation from './CsmngNavigation.js';
import CsmngToolBar from './CsmngToolBar.js';
import DentryListPanel from './DentryListPanel.js';
import CsmngFooter from './CsmngFooter.js';
import UploadPanel from './UploadPanel.js';
import CsmngDialog from './CsmngDialog.js';
import CsmngInfo from './CsmngInfo.js';
import CsmngRecycle from './CsmngRecycle.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.message = "";
        this.selectItems = [];
        this.currentPath = "/" + Content.SERVICENAME;
        this.operate = "";
        this.state = {
            showUploadPanel: 0,            //是否显示文件上传界面
            showDialog: 0,                 //是否显示确认对话框
            showRecycle: 0,                //是否显示回收站界面
            showInfo: 0,                   //是否显示提示信息
            updateList: 0,                 //是否更新列表界面
            updateToolbar: 0,              //是否更新工具栏
            updateNavigation: 0            //是否更新导航栏
        }
    }

    //删除dentry
    deleteDentry(items) {
        this.operate = "delete";
        this.setState({
            selectItems: items,
            showDialog: new Date().getTime()
        });
        var _self = this;
        CsmngDialog.confirm(function () {
            var deletePaths = [];
            for (var i = 0; i < items.length; i++) {
                if(items[i].path){
                    deletePaths.push(items[i].path);
                }
            }
            var body = {
                parent_path: _self.currentPath,
                paths: deletePaths
            };
            var url = "http://" + Content.HOST + "/v0.1/dentries/actions/delete?session=" + Content.SESSION + "&fromPath=true";
            CSHttpClient.doPatchRequest(url, JSON.stringify(body), null, function () {
                _self.setState({
                    updateList: new Date().getTime()
                });
            }, function () {
                _self.onShowErrorMsg({
                    error: "删除文件失败！",
                    errorType: "error"
                });
            });
        });
    }

    //监控工具栏点击事件
    onOperateChange(operate) {
        this.operate = operate;
        var url;
        var _self = this;
        switch (operate) {
            case "upload":
            case "upload_folder":
                this.setState({
                    showUploadPanel: new Date().getTime()
                });
                break;
            case "download":
                var dentry = this.selectItems[0];
                //文件 直接下载
                url = "http://" + Content.HOST + "/v0.1/download?path=" + encodeURIComponent(dentry.path);
                if (dentry.scope === 0) {
                    url += "&session=" + Content.SESSION;
                }
                window.open(url);
                break;
            case "delete":
                this.deleteDentry(this.selectItems);
                break;
            case "create_folder":
                document.getElementById("create_folder_dentry").style.display = "";
                var dom = $("#new_dentry_name");
                dom.focus();
                dom.select();
                break;
            case "rename":
                //重命名 需要将labe转换为input
                this.setState({
                    //不刷新列表，只刷新单个列表项
                    updateList: -1
                }, function () {
                    var item = _self.selectItems[0];
                    var id = "#" + item.dentry_id;
                    $(id).focus();
                    document.getElementById(item.dentry_id).setSelectionRange(0, item.name.lastIndexOf("."));
                });
                break;
            case "recycle":
                this.setState({
                    showRecycle: new Date().getTime()
                });
                break;
        }
    }

    //列表路径变化
    onChangePath(path) {
        this.currentPath = path;
        this.setState({
            updateList: new Date().getTime(),
            updateNavigation: new Date().getTime()
        });
    }

    //列表选项变化
    onChangeSelect(selectedItems) {
        this.selectItems = selectedItems;
        this.setState({
            updateToolbar: new Date().getTime(),
            //防止重命名会显示文本框
            updateList: -2
        });
    }

    //上传成功 刷新列表
    onUploadSuccess() {
        this.setState({
            updateList: new Date().getTime()
        });
    }

    //显示对话框
    onShowDialog(operate) {
        this.operate = operate;
        this.setState({
            showDialog: new Date().getTime()
        });
    }

    //显示错误
    onShowErrorMsg(msg) {
        this.message = msg;
        this.setState({
            showInfo: new Date().getTime()
        });
    }

    render() {
        return (
            <div>
                <CsmngHeader/>
                <CsmngNavigation
                    updateAt={this.state.updateNavigation}
                    currentPath={this.currentPath}
                    onClick={this.onChangePath.bind(this)}
                />
                <CsmngToolBar
                    updateAt={this.state.updateToolbar}
                    selectItems={this.selectItems}
                    onOperateChange={this.onOperateChange.bind(this)}
                />
                <UploadPanel
                    updateAt={this.state.showUploadPanel}
                    type={this.operate}
                    currentPath={this.currentPath}
                    uploadSuccess={this.onUploadSuccess.bind(this)}
                />
                <CsmngDialog
                    updateAt={this.state.showDialog}
                    operate={this.operate}
                />
                <CsmngInfo
                    updateAt={this.state.showInfo}
                    message={this.message}
                />
                <DentryListPanel
                    updateAt={this.state.updateList}
                    currentPath={this.currentPath}
                    onCurrentPathChange={this.onChangePath.bind(this)}
                    onDeleteDentry={this.deleteDentry.bind(this)}
                    onSelectChange={this.onChangeSelect.bind(this)}
                    onShowErrorMsg={this.onShowErrorMsg.bind(this)}
                />
                <CsmngRecycle
                    updateAt={this.state.showRecycle}
                    showDialog={this.onShowDialog.bind(this)}
                    onShowErrorMsg={this.onShowErrorMsg.bind(this)}/>
                <CsmngFooter/>
            </div>
        )
    }

}

React.render(<App client={window.CSClient}/>, document.getElementById('app'));