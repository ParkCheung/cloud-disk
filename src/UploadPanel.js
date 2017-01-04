/**
 * Created by Administrator on 2017/1/4.
 */
import React from 'react';
export default class UploadPanel extends React.Component {


    closePanel() {
        this.props.closeUploadPanel();
    }


    handleClick() {
        if (this.props.type === "upload") {
            React.findDOMNode(this.refs.file_select).click();
        }else {
            var input = React.findDOMNode(this.refs.upload_floder_chooser);
            input.setAttribute('webkitdirectory', '');
            input.setAttribute('directory', '');
            input.click();
        }
    }

    render() {
        var display = this.props.show ? "" : "none";
        return (
            <div className="fancybox-overlay fancybox-overlay-fixed" id="upload_div"
                 style={{width: "auto", height: "auto", display: display}}>
                <div className="function_dialog upload_dialog">
                    <div className="dg_header">
                        <h3>上传</h3>
                        <a href="#" className="dg dg_del closeBtn" onClick={this.closePanel.bind(this)}></a>
                    </div>
                    <div className="function_container">
                        <div className="function_tool">
                            <h5>文件最大支持300MB</h5>
                            {
                                this.props.type === "upload" ? <div style={{float: "right"}}>
                                    <input type="file" name="file" multiple ref="file_select" style={{display: "none"}}/>
                                    <a id="upload_button"
                                       className="btn1 btn_float_right" onClick={this.handleClick.bind(this)}>上传文件</a>
                                </div> :
                                    <div style={{float: "right"}}>
                                        <input type="file" style={{display: "none"}} ref="upload_floder_chooser"
                                               webkitdirectory directory/>
                                        <a id="upload_floder_button"
                                           className="btn1 btn_float_right" onClick={this.handleClick.bind(this)}>上传文件夹</a>
                                    </div>
                            }

                            <label style={{padding: "13px", float: "right", "vertical-align": "middle"}}>
                                <input id="scope_check" type="checkbox"/>
                                <label style={{height: "100%", "vertical-align": "middle","margin-left":"5px"}}>公开文件</label>
                            </label>
                        </div>
                        <div className="upload_show">

                            <table className="function_table">
                                <tr id="Upload_title" className="table_tile">
                                    <td style={{width: "100px"}}><label>文件名</label></td>
                                    <td style={{width: "280px"}}></td>
                                    <td style={{width: "80px"}}><label>大小</label></td>
                                    <td style={{width: "100px"}}><label>上传速度</label></td>
                                    <td style={{width: "20px"}}></td>
                                </tr>
                            </table>
                        </div>
                        <div id="showUploadProgress" className="show_UploadProgress">
                            <table id="Upload_table" className="function_table" style={{width: "633px"}}>
                                <tr id="Upload_bottom">
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}