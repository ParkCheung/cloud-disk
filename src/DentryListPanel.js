/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
import 'whatwg-fetch';
import DentryDetail from './DentryDetail.js';
export default class DentryListPanel extends React.Component {

    render() {
        return (
            <div className="content_container">
                <div id="list_mode_div" className="list_mode_div">
                    <div className="wrap" style={{float: "left"}}>
                        <DentryDetail listUrl="http://sdpcs.dev.web.nd/v0.1/dentries?dentryId=107aa838-08e1-45dd-8adb-ba7fa02dd4d3&$filter=updateAt+gt+0&$limit=15&$orderby=updateAt+Desc&session=e6773402-8f17-4cf1-ba9f-02526af0d399"/>
                    </div>
                </div>

                {/*<div id="norecord_div">*/}
                    {/*<div className="wrap">*/}
                        {/*<img src="build/img/get_nothing.png"/>*/}
                        {/*<p> 暂无任何文件</p>*/}
                    {/*</div>*/}
                {/*</div>*/}

                {/*翻页按钮*/}
                <div id="page_turning" className="page_turning">
                    <div className="wrap">
                        <div className="page_div">
                            <div className="page_button"><a id="next_list" className="btn1 btn_dialog">下一页</a>
                            </div>
                            <div className="page_button"><a id="pre_list" className="btn1 btn_dialog">上一页</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


}