import React from 'react'
import { io } from 'socket.io-client';



class Message extends React.Component {
    state = {
        chat: [],
        msg: '',
        modelType: 'GPT',
        loading: false,
        //socketUrl: ''
        socketUrl: 'http://127.0.0.1:5002' // default value
    }
   
    handleKeyPress = (event) => {
        // Check if the pressed key is "Enter" (keyCode 13)
        if (event.key === 'Enter') {
            // Trigger the click event when "Enter" is pressed
            this.handleSend();
        }
    };

    handleChange = (e) => {
        //console.log(e.target.value);
        this.setState({ msg: e.target.value });
    }

    handleSend = () => {
        //socket connection
        const socket = io('http://127.0.0.1:5002');
        //let socket = io(this.state.url);

        if (this.state.msg !== '') {
            this.setState({ loading: true }); // Indicate loading state

            socket.emit('message', { content: this.state.msg });
            let responseMsg = '';

            socket.on('message', data => {
                console.log('Received message:', data);
                if (data.sender === 'assistant') {
                    this.setState({ loading: false }); // Set loading to false when you receive the response
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
                        responseMsg = actionMessage || "Response from the server";
                    }
                }

                this.setState(prevState => ({
                    chat: [...prevState.chat, { from: 'cb', msg: responseMsg }],
                    loading: false // Turn off loading state after receiving the response
                }));
            });


            // Adding message bubble for the user's message immediately
            this.setState(prevState => {
                return {
                    chat: [...prevState.chat, { from: 'our', msg: prevState.msg }],
                    msg: ''
                };
            });
        }
    }

    render() {
        return (
            <div id="fullscreen"  >
                <div id="leftSideBar">
                    <div className="information">
                        <div className="agent-info">CodeGen</div>
                        <div className="decs">Code Agent, automatically run and execute code</div>
                        <div className="llm-selection">
                            <form>
                                <div className="radio-buttons">
                                    <input
                                        type="radio"
                                        id="gpt"
                                        name="modelType"
                                        value="GPT"
                                        checked={this.state.modelType === 'GPT'}
                                        onChange={(e) => this.setState({ modelType: e.target.value })}
                                    />
                                    <label htmlFor="gpt">GPT</label>

                                    <input
                                        type="radio"
                                        id="llm"
                                        name="modelType"
                                        value="LLM"
                                        checked={this.state.modelType === 'LLM'}
                                        onChange={(e) => this.setState({ modelType: e.target.value })}
                                    />
                                    <label htmlFor="llm">LLM</label>
                                </div>
                                <div className="inputs">
                                    <label htmlFor="modelName">Model Name</label>
                                    <input
                                        type="text"
                                        id="modelName"
                                        placeholder="Model Name"
                                        value={this.state.modelName}
                                        onChange={(e) => this.setState({ modelName: e.target.value })}
                                    />
                                    <label htmlFor="urlName">URL</label>
                                    <input
                                        type="text"
                                        id="urlName"
                                        value={this.state.socketUrl}
                                        //onChange={this.handleUrlChange}
                                        onChange={(e) => this.setState({ url: e.target.value })}
                                        
                                    />
                                    <label htmlFor="keyName">API Key</label>
                                    <input
                                        type="text"
                                        id="keyName"
                                        placeholder="API_Key"
                                        value={this.state.apiKey}
                                        onChange={(e) => this.setState({ apiKey: e.target.value })}
                                    />
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                <div id="chatContainer">

                    <div id='chatt'>
                        {this.state.loading && <div id="loading">Loading...</div>}
                        {this.state.chat.map((msg, index) => {
                            let bubble = null;
                            if (msg.from === 'cb') {
                                bubble = <div key={index} id="botWindow">{msg.msg}</div>;
                            } else if (msg.from === 'our' && msg.msg.trim() !== '') {
                                bubble = <div key={index} id="userWindow">{msg.msg}</div>;
                            }
                            return bubble;
                        })}
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