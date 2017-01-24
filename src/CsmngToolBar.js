/**
 * Created by Administrator on 2016/12/12.
 */
import React from 'react';
export default class CsmngToolBar extends React.Component {


    handleClick(operate){
        this.props.onOperateChange(operate);
    }


    render() {

        var items = [
            {"id": "upload", "name": "上传", "className": "icon", "available": true},
            {"id": "upload_folder", "name": "上传文件夹", "className": "big_icon", "available": true},
            {"id": "download", "name": "下载", "className": "icon", "available": false},
            {"id": "create_folder", "name": "新建文件夹", "className": "icon", "available": true},
            {"id": "move", "name": "移动", "className": "icon", "available": false},
            {"id": "delete", "name": "删除", "className": "icon", "available": false},
            {"id": "rename", "name": "重命名", "className": "icon", "available": false},
            {"id": "recycle", "name": "回收站", "className": "icon", "available": true}
        ];

        //不支持批量的操作项
        if (this.props.selectItems) {
            //只支持单个操作文件
            if(this.props.selectItems.length === 1 && this.props.selectItems[0].type !==0){
                items[2].available = true;
                items[6].available = true;
            }

            if (this.props.selectItems.length >= 1){
                items[4].available = true;
                items[5].available = true;
            }
        }

        return (

            <div className="com_toolbar">
                <div className="wrap">
                    {
                        items.map(function (item) {
                            var image = "../build/img/" + item.id + ".png";
                            return <a id={item.id} className={item.available ? "available" : "unavailable"} onClick={this.handleClick.bind(this,item.id)}><img
                                className={item.className}
                                src={image}/><label>{item.name}</label><img
                                src="../build/img/u230_line.png" className="separator" alt=""/></a>
                        }.bind(this))
                    }
                </div>
            </div>
        )
    }
}