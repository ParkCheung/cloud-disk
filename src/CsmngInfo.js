/**
 * Created by Administrator on 2017/1/9.
 */
import React from 'react';
export default class CsmngInfo extends React.Component {

    constructor(props) {
        super(props);
        this.updateAt = 0;
        this.state = {
            text: "",
            errorType: "info",
            display: "none"
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.updateAt > this.updateAt) {
            this.updateAt = nextProps.updateAt;
            this.setState({
                text: nextProps.message.error,
                errorType: nextProps.message.errorType,
                display: ""
            });

            var _self = this;
            window.setTimeout(function () {
                _self.setState({
                    display: "none"
                });
                _self.props.onClearError();
            }, 1000)
        }
    }

    render() {

        var text = this.state.text;
        var errorType = "main main_sensitive_gray hip_" + this.state.errorType;

        return (
            <div className="question_pop" style={{display: this.state.display}}>
                <div id="hip_panel" className="hip_wap">
                    <div className="pop_body">
                        <div className={errorType}>
                            <span className="text">{text}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}