/**
 * Created by MrZhang on 2017/1/8.
 */
import React from 'react';
import DentryDetail from './DentryDetail'
export default class Progress extends React.Component {


    removeFile(file) {
        this.props.onRemoveFile(file);
    }

    render() {
        var files = this.props.files;
        return (
            <div className="upload_show">
                <table className="function_table">
                    <tr id="Upload_title" className="table_tile">
                        <td style={{width: "120px"}}><label>文件名</label></td>
                        <td style={{width: "280px"}}></td>
                        <td style={{width: "80px"}}><label>大小</label></td>
                        <td style={{width: "100px"}}><label>上传速度</label></td>
                    </tr>
                    {
                        files.map(function (file) {
                            var filename = file.name.length > 20 ? file.name.substring(0, 20) + "..." : file.name;
                            return <tr className="upload_detail">
                                <td style={{width: "120px"}}><label title={file.name}>{filename}</label></td>
                                <td id={file.hash}>
                                    <div className="progress">
                                        <div name="progress_bar" className="green"></div>
                                    </div>
                                    <p style={{width: "30px", float: "left", paddingTop: "6px"}}>0%</p>
                                    <image className="progress_image" src="build/img/delete.png"
                                           style={{cursor: "pointer", float: "right", paddingTop: "8px"}}
                                           title="点击取消文件上传" onClick={this.removeFile.bind(this, file)}/>
                                </td>
                                <image className="complete" src="build/img/complete.png"
                                       style={{float: "right", height: "20px", display: "none"}}/>
                                <td><label>{DentryDetail.convertSize(file.size)}</label></td>
                                <td id={file.hash + "_speed"}>
                                    <div style={{width: "106px", marginLeft: "10px"}}></div>
                                </td>
                            </tr>
                        }.bind(this))
                    }
                </table>
            </div>
        )
    }
}