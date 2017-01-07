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
        switch (operate) {
            case "upload":
            case "upload_folder":
                this.setState({
                    showUploadPanel: true,
                    operate: operate
                });
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

        var serviceName = "csample";
        var csHost = "cs.101.com";
        var csSession = "17d59d2f-c855-474d-92e1-543cc245f988";

        return (
            <div>
                <CsmngHeader/>
                <CsmngNavigation currentPath={this.state.currentPath} onClick={this.onChangePath.bind(this)}/>
                <CsmngToolBar selectItems={this.state.selectItems} onOperateChange={this.onOperateChange.bind(this)}/>
                <UploadPanel show={this.state.showUploadPanel} type={this.state.operate}
                             closeUploadPanel={this.closeUploadPanel.bind(this)}
                             serviceName={serviceName}
                             csSession={csSession}
                             currentPath={this.state.currentPath}
                             uploadSuccess={this.onUploadSuccess.bind(this)}/>
                <DentryListPanel host={csHost} session={csSession}
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