import React from 'react'
import axios from 'axios'
import { io } from 'socket.io-client';



class Message extends React.Component {
    state = {
        chat: [],
        msg: ''
    }
    handleKeyPress = (event) => {
        // Check if the pressed key is "Enter" (keyCode 13)
        if (event.key === 'Enter') {
            // Trigger the click event when "Enter" is pressed
            this.handleSend();
        }
    };

    handleChange = (e) => {
        console.log(e.target.value);
        this.setState({ msg: e.target.value });
    }
    handleSend = () => {
        //socket connection
        const socket = io('http://127.0.0.1:5002');
        socket.on('connect', () => {
            console.log('Connected to the server');
        });

        if (this.state.msg != '') {
            socket.emit('message', { content: this.state.msg });

            socket.on('message', data => {
                console.log('Received message:', data);
                if (data.sender === 'assistant') {
                    // Extract the message content from data.data using regular expressions
                    const match = data.data.match(/```([\s\S]+?)```/);

                    if (match && match[1]) {
                        let actionMessage = match[1].trim();
                        // Add two lines before "TERMINATE" and before "### Explanation:"
                        actionMessage = actionMessage.replace(/python/g, 'python code:\n');
                        actionMessage = actionMessage.replace(/TERMINATE/g, '\n\nTERMINATE');
                        actionMessage = actionMessage.replace(/### Explanation:/g, '\n\n### Explanation:');

                        // Check if the message starts with "print("
                        if (actionMessage.startsWith('print("')) {
                            // Remove "print(" from the beginning of the message
                            actionMessage = actionMessage.slice('print("'.length);
                        }

                        this.setState(prevState => ({
                            chat: [...prevState.chat, { from: 'cb', msag: actionMessage }]
                        }));
                    }
                }



                if (data.sender === 'user_proxy') {
                    console.log("rpoxy")
                    return;
                }

            });


            this.setState(prevState => {
                let ch = [...prevState.chat];
                ch.push({ from: 'our', msag: prevState.msg });
                ch.push({ from: 'cb', msag: prevState.data });
                console.log("check:", ch)

                return { chat: ch, msg: '' };
            }, () => {
                // Callback function that will be called after the state is updated
                console.log(this.state);
            });
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
                            onKeyDown={(e) => this.handleKeyPress(e)}
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