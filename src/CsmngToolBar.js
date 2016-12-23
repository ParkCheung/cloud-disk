/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
export default class CsmngToolBar extends React.Component {

    render() {

        var items = [
            {"id": "upload", "name": "上传", "className": "icon"},
            {"id": "upload_folder", "name": "上传文件夹", "className": "big_icon"},
            {"id": "download", "name": "下载", "className": "icon"},
            {"id": "create_folder", "name": "新建文件夹", "className": "icon"},
            {"id": "move", "name": "移动", "className": "icon"},
            {"id": "delete", "name": "删除", "className": "icon"},
            {"id": "rename", "name": "重命名", "className": "icon"},
            {"id": "recycle", "name": "回收站", "className": "icon"}
        ];

        return (

            <div className="com_toolbar">
                <div className="wrap">
                    {
                        items.map(function (item) {
                            var image = "build/img/" + item.id + ".png";
                            return <a id={item.id} className="available"><img className={item.className}
                                                                              src={image}/><label>{item.name}</label><img
                                src="build/img/u230_line.png" className="separator" alt=""/></a>
                        })
                    }
                </div>
            </div>
        )
    }
}