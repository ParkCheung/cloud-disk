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

class App extends React.Component {
    constructor(props) {
        super(props);
        this.confirmed = false;
        this.state = {
            currentPath: "/" + Content.SERVICENAME,
            selectItems: [],
            showUploadPanel: false,
            showDialog: false,
            operate: "",
            updateAt: 0,
            error: "",
            errorType: ""
        }
    }

    deleteDentry(items) {

        this.setState({
            selectItems : items
        });
        if (!this.confirmed) {
            //弹出确认窗口
            this.setState({
                showDialog: true,
                operate: "delete"
            });
        } else {
            this.confirmed = false;
            var deletePaths = [];
            for (var i = 0; i < items.length; i++) {
                deletePaths.push(items[i].path);
            }
            var body = {
                parent_path: this.state.currentPath,
                paths: deletePaths
            };
            var url = "http://" + Content.HOST + "/v0.1/dentries/actions/delete?session=" + Content.SESSION + "&fromPath=true";
            var _self = this;
            CSHttpClient.doPatchRequest(url, JSON.stringify(body), null, function () {
                _self.setState({
                    updateAt: new Date().getTime(),
                });
            }, function () {
                _self.setState({
                    error: "删除文件失败！",
                    errorType: "error"
                });
            });
        }
    }

    //监控工具栏点击事件
    onOperateChange(operate) {
        var url;
        var _self = this;
        switch (operate) {
            case "upload":
            case "upload_folder":
                this.setState({
                    showUploadPanel: true,
                    operate: operate
                });
                break;
            case "download":
                var dentry = this.state.selectItems[0];
                //文件 直接下载
                url = "http://" + Content.HOST + "/v0.1/download?path=" + encodeURIComponent(dentry.path);
                if (dentry.scope === 0) {
                    url += "&session=" + Content.SESSION;
                }
                window.open(url);
                break;
            case "delete":
                this.deleteDentry(this.state.selectItems);
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
                    updateAt: -1
                }, function () {
                    var item = _self.state.selectItems[0];
                    var id = "#" + item.dentry_id;
                    $(id).focus();
                    document.getElementById(item.dentry_id).setSelectionRange(0, item.name.lastIndexOf("."));
                });
                break;
        }
    }

    onCreateDentry(name) {
        var body = {
            path: this.state.currentPath,
            name: name
        };
        var _self = this;
        var url = "http://" + Content.HOST + "/v0.1/dentries?session=" + Content.SESSION;
        CSHttpClient.doPostRequest(url, JSON.stringify(body), {}, function () {
            document.getElementById("create_folder_dentry").style.display = "none";
            document.getElementById("new_dentry_name").value = "新建文件夹";
            _self.setState({
                updateAt: new Date().getTime()
            });

        }, function () {
            _self.setState({
                error: "创建目录失败！",
                errorType: "error",
            });
        });
    }

    //关闭上传面板
    closeUploadPanel() {
        this.setState({
            showUploadPanel: false
        });
    }

    //列表路径变化
    onChangePath(path) {
        this.setState({
            currentPath: path
        });
    }

    //列表选项变化
    onChangeSelect(selectedItems) {
        this.setState({
            selectItems: selectedItems
        });
    }

    //上传成功 刷新列表
    onUploadSuccess() {
        this.setState({
            updateAt: new Date().getTime()
        });
    }

    //已操作完对话框
    onCloseDialog(confirmed) {
        this.confirmed = confirmed;
        this.setState({
            showDialog: false
        });
        //点击确认
        if (confirmed) {
            this.onOperateChange(this.state.operate);
        }
    }

    //显示错误
    onShowErrorMsg(msg) {
        this.setState({
            error: msg.error,
            errorType: msg.errorType,
        });
    }

    //清除error信息
    onClearError() {
        this.setState({
            error: "",
            errorType: ""
        });
    }

    render() {
        return (
            <div>
                <CsmngHeader/>
                <CsmngNavigation currentPath={this.state.currentPath}
                                 onClick={this.onChangePath.bind(this)}/>
                <CsmngToolBar selectItems={this.state.selectItems}
                              onOperateChange={this.onOperateChange.bind(this)}/>
                <UploadPanel show={this.state.showUploadPanel}
                             type={this.state.operate}
                             closeUploadPanel={this.closeUploadPanel.bind(this)}
                             currentPath={this.state.currentPath}
                             uploadSuccess={this.onUploadSuccess.bind(this)}/>
                <CsmngDialog show={this.state.showDialog} operate={this.state.operate}
                             onCloseDialog={this.onCloseDialog.bind(this)}/>
                <CsmngInfo text={this.state.error} errorType={this.state.errorType}
                           onClearError={this.onClearError.bind(this)}/>
                <DentryListPanel
                    currentPath={this.state.currentPath}
                    onCurrentPathChange={this.onChangePath.bind(this)}
                    onDeleteDentry={this.deleteDentry.bind(this)}
                    onSelectChange={this.onChangeSelect.bind(this)}
                    onCreateDentry={this.onCreateDentry.bind(this)}
                    onShowErrorMsg={this.onShowErrorMsg.bind(this)}
                    updateAt={this.state.updateAt}/>
                <CsmngFooter/>
            </div>
        )
    }

}

React.render(<App client={window.CSClient}/>, document.getElementById('app'));