/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
import CsmngHeader from './CsmngHeader.js';
import CsmngNavigation from './CsmngNavigation.js';
import CsmngToolBar from './CsmngToolBar.js';
import DentryListPanel from './DentryListPanel.js';
import CsmngFooter from './CsmngFooter.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPath: "/csample",
            selectItems: []
        }
    }


    onChangePath(path) {
        this.setState({
            currentPath: path
        });
    }

    onChangeSelect(selectedItems) {
        this.setState({
            selectItems: selectedItems
        });
    }


    render() {

        var csHost = "cs.101.com";
        var csSession = "17d59d2f-c855-474d-92e1-543cc245f988";

        return (
            <div>
                <CsmngHeader/>
                <CsmngNavigation currentPath={this.state.currentPath} onClick={this.onChangePath.bind(this)}/>
                <CsmngToolBar selectItems={this.state.selectItems}/>
                <DentryListPanel host={csHost} session={csSession} currentPath={this.state.currentPath}
                                 onCurrentPathChange={this.onChangePath.bind(this)}
                                 onSelectChange={this.onChangeSelect.bind(this)}/>
                <CsmngFooter/>
            </div>
        )
    }

}

React.render(<App />, document.getElementById('app'));