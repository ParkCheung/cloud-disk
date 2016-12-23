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

   render(){
       return(
           <div>
               <CsmngHeader/>
               <CsmngNavigation/>
               <CsmngToolBar/>
               <DentryListPanel/>
               <CsmngFooter/>
           </div>
       )
   }

}

React.render(<App />, document.getElementById('app'));