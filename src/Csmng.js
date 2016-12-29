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
            currentPath: "/my_sample"
        }
    }


    onChangePath(path){
        this.setState({
            currentPath: path
        });
    }

   render(){
       return(
           <div>
               <CsmngHeader/>
               <CsmngNavigation currentPath={this.state.currentPath} onClick={this.onChangePath.bind(this)}/>
               <CsmngToolBar/>
               <DentryListPanel session="e6773402-8f17-4cf1-ba9f-02526af0d399" currentPath={this.state.currentPath} onCurrentPathChange={this.onChangePath.bind(this)}/>
               <CsmngFooter/>
           </div>
       )
   }

}

React.render(<App />, document.getElementById('app'));