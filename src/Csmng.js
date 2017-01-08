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

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPath: "/csample",
            selectItems: [],
            showUploadPanel: false,
            operate: "",
            updateAt: 0,
        }
    }

    //监控工具栏点击事件
    onOperateChange(operate) {
        var url;
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
                url = "http://" + Content.CSHOST + "/v0.1/download?path=" + encodeURIComponent(dentry.path);
                if (dentry.scope === 0) {
                    url += "&session=" + Content.SESSION;
                }
                window.open(url);
                break;
            case "delete":
                var deletePaths = [];
                for (var i = 0; i < this.state.selectItems.length; i++) {
                    deletePaths.push(this.state.selectItems[i].path);
                }
                var body = {
                    path: this.state.currentPath,
                    paths: deletePaths
                };
                url = "http://" + Content.CSHOST + "/v0.1/dentries/actions/delete?session=" + Content.SESSION;
                CSHttpClient.doPatchRequest(url, JSON.stringify(body), null, function () {
                    this.setState({
                        updateAt: new Date().getTime()
                    });
                }, function (error) {
                    console.log(error);
                });
                break;
        }
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
                <DentryListPanel
                    currentPath={this.state.currentPath}
                    onCurrentPathChange={this.onChangePath.bind(this)}
                    onSelectChange={this.onChangeSelect.bind(this)}
                    updateAt={this.state.updateAt}/>
                <CsmngFooter/>
            </div>
        )
    }

}

React.render(<App client={window.CSClient}/>, document.getElementById('app'));