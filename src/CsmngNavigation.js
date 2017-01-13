/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
export default class CsmngNavigation extends React.Component {

    constructor(props) {
        super(props);
        this.states = {
            currentPath : "",
        }
    }

    handleClick(currentPath){
        this.props.onClick(currentPath);

        this.setState({
            currentPath :currentPath
        })
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            currentPath :nextProps.currentPath
        })
    }

    render() {
        var folders = this.props.currentPath.split("\/");
        folders.shift();
        var count = 0;
        var folderPath = "/" + folders[0];
        return (
            <div className="com_subnav">
                <div id="current_path" className="wrap">
                    <ins className="doc_icon"></ins>
                    {
                        folders.map(function (folder) {
                            if (count++ === 0) {
                                return <a href="#" onClick={this.handleClick.bind(this,folderPath)}>所有文件</a>;
                            } else {
                                folderPath += "/" +folder;
                                return  <a href="#" onClick={this.handleClick.bind(this,folderPath)}><i>&gt;</i>{folder}</a>
                            }
                        }.bind(this))
                    }
                </div>
            </div>
        )
    }
}