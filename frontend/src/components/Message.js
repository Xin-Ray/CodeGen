import React from 'react'
import axios from 'axios'
class Message extends React.Component {
    state = {
        chat: [],
        msg: ''
    }
    handleChange = (e) => {
        console.log(e.target.value);
        this.setState({ msg: e.target.value });
    }
    handleSend = () => {


        if (this.state.msg != '') {
            axios.post('http://127.0.0.1:5000/user', { 'msg': this.state.msg })
                .then(res => {
                    let ch = this.state.chat;
                    ch.push({ from: 'our', msag: this.state.msg });
                    ch.push({ from: 'cb', msag: res.data });
                    this.setState({ chat: ch, msg: '' });
                    console.log(this.state);


                })
                .catch(err => {
                    console.log(err);
                });
            //manual data feeding
            let ch = this.state.chat;
            ch.push({ from: 'our', msag: this.state.msg });
            ch.push({ from: 'cb', msag: "Hi! I am good , how aboutyou ?" });
            this.setState({ chat: ch, msg: '' });
            console.log(this.state);


            this.forceUpdate();
        }
        let interval = window.setInterval(function () {
            var elem = document.getElementById('chatt');
            elem.scrollTop = elem.scrollHeight;
            window.clearInterval(interval);
        }, 5000)
    }
    render() {
        return (
            <div id="fullscreen"  >
                <div id="leftSideBar">
                    <div class="information">
                        <div class="agent-info">CodeGen</div>
                        <div class="code-agent-automatically-review-llm-code">
                            Code Agent, automatically review llm code
                        </div>
                    </div>
                </div>
                <div id="chatContainer">

                    <div id='chatt' style={{ height: '75vh', marginLeft: '20px', marginRight: '20px' }}>
                        {
                            this.state.chat.map((msg) => {
                                if (msg.from == 'cb') {
                                    return <div id="msgLeft" style={{
                                        flexWrap: 'wrap', fontSize: '17px', fontFamily: 'cursive',
                                        marginBottom: '10px', borderRadius: '5px', marginRight: '500px',
                                        padding: '10px', paddingBottom: '10px',
                                        backgroundColor: '#f9f9f9', color: 'black', float: 'left',
                                        display: 'block'
                                    }}>{msg.msag} </div>
                                }
                                else {
                                    return <div style={{
                                        flexWrap: 'wrap', fontSize: '17px', fontFamily: 'cursive', marginRight: '20px',
                                        marginBottom: '10px', borderRadius: '5px', marginLeft: '500px',
                                        padding: '10px', paddingBottom: '10px', backgroundColor: 'whitesmoke',
                                        float: 'right', display: 'block', color: 'black'
                                    }}>{msg.msag}</div>
                                }
                            })
                        }
                    </div>
                    <div style={{ height: '2vh', }}>
                        <input type='text' name='msg'
                            onChange={(e) => this.handleChange(e)}
                            class="form-control"

                            style={{
                                marginLeft: '20px', width: '70%', float: 'left', flex: 1,
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '3px',
                                marginRight: '10px'
                            }}
                            value={this.state.msg} />
                        <button onClick={() => this.handleSend()} style={{
                            paddingLeft: '25px', paddingRight: '25px', padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            marginRight: '10px', backgroundColor: '#5b9bd5', color: 'white', border: 'none', width: '100px'
                        }} class="btn btn-primary">Send</button>
                    </div>
                </div>
            </div >
        )
    }
}
export default Message;