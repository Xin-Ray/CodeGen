import React from 'react'
import axios from 'axios'
import { io } from 'socket.io-client';



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
        //socket connection
        const socket = io(' http://127.0.0.1:5002');
        socket.on('connect', () => {
            console.log('Connected to the server');
        });

        if (this.state.msg != '') {
            socket.emit('message', { content: this.state.msg });
            /*axios.post('http://127.0.0.1:5000/user', { 'msg': this.state.msg })
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
            */
            socket.on('message', data => {
                console.log('Received message:', data);
            });
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

                    <div id='chatt' >
                        {
                            this.state.chat.map((msg) => {
                                if (msg.from == 'cb') {
                                    return <div id="botWindow" >{msg.msag} </div>
                                }
                                else {
                                    return <div id="userWindow" >{msg.msag}</div>
                                }
                            })
                        }
                    </div>
                    <div id="chatCont" >
                        <input type='text' name='msg' id="msgText"
                            onChange={(e) => this.handleChange(e)}
                            class="form-control"
                            value={this.state.msg} />
                        <button id="submitBtn" onClick={() => this.handleSend()}
                            type="submit"
                            class="btn btn-primary">Send</button>
                    </div>
                </div>
            </div >
        )
    }
}
export default Message;