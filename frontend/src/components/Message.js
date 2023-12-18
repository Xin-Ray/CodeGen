import React from 'react'
import { io } from 'socket.io-client';
import CodeDisplay from './CodeDisplay';


class Message extends React.Component {
    state = {
        chat: [],
        msg: '',
        sender: '',
        modelType: 'GPT',
        apiKey: '',
        baseUrl: '',
        loading: false,
        url: 'http://127.0.0.1:5002',
        code: ''
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
    handleNewCode = (newCode) => {
        this.setState({ code: newCode });
    };
    handleSend = () => {
        this.setState({ loading: true });
        //socket connection
        //const socket = io('http://127.0.0.1:5002');

        let socket = io(this.state.url);
        console.log("sending", this.state.url, this.state.loading)
        //sending API key
        socket.emit('update_api_key', { 'api_key': this.state.apiKey });

        //sending base URL for LLM
        socket.emit('update_LLM_base_url', { 'base_url': this.state.baseUrl });

        if (this.state.msg !== '') {
            this.setState({ loading: true }); // Indicate loading state

            socket.emit('message', { content: this.state.msg });




            let responseMsg = '';

            socket.on('message', data => {
                console.log('Received message:', data);
                console.log('The data:', data.data);
                console.log('The sender:', data.sender);

                if (data.sender !== 'Admin') {
                    this.setState({ loading: false });
                    let senderName = data.sender;
                    let actionMessage = data.data;
                    let responseMsg = actionMessage || "Response from the server";

                    // Check if the message is a code response
                    const codeResponsePattern = /(```|''')[\s\S]+(```|''')/;
                    if (codeResponsePattern.test(responseMsg)) {
                        // Extract the code using the patterns for Python or Shell
                        const extractedCode = extractCode(responseMsg);

                        // Update only the code in the state for CodeDisplay, do not add it to the chat
                        //this.setState({ code: extractedCode });
                        this.setState(prevState => ({
                            chat: [...prevState.chat, { from: senderName, code: extractedCode }],
                            loading: false // Turn off loading state after receiving the response
                        }));

                    } else {
                        // If it's not code, add it to the chat history
                        this.setState(prevState => ({
                            chat: [...prevState.chat, { from: senderName, msg: responseMsg }],
                            loading: false // Turn off loading state after receiving the response
                        }));
                    }
                }
            });

            // Add the extractCode function in the same scope as your socket event listener
            const extractCode = (response) => {
                const pythonPattern = /'''([\s\S]*?)'''/; // For Python
                const shellPattern = /```([\s\S]*?)```/; // For Shell

                let match = response.match(pythonPattern);
                if (match) return match[1];

                match = response.match(shellPattern);
                if (match) return match[1];

                return 'No code found.';
            };



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
                                {this.state.modelType === 'GPT' && (
                                    <div className="inputs">
                                        <label htmlFor="modelName">Model Name</label>
                                        <input
                                            type="text"
                                            id="modelName"
                                            placeholder="Model Name"
                                            value={this.state.modelName}
                                            onChange={(e) => this.setState({ modelName: e.target.value })}
                                        />
                                        <label htmlFor="urlName">Websocket URL</label>
                                        <input
                                            type="text"
                                            id="urlName"
                                            value={this.state.url}
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
                                )}
                                {this.state.modelType === 'LLM' && (
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
                                            value={this.state.url}
                                            //onChange={this.handleUrlChange}
                                            onChange={(e) => this.setState({ url: e.target.value })}

                                        />

                                        <label htmlFor="keyName">Base URL</label>
                                        <input
                                            type="text"
                                            id="baseUrl"
                                            placeholder="LLM Base URL"
                                            value={this.state.baseUrl}
                                            onChange={(e) => this.setState({ baseUrl: e.target.value })}
                                        />
                                    </div>
                                )}
                            </form>
                        </div>

                    </div>
                </div>
                <div id="chatContainer">

                    <div id='chatt'>

                        {this.state.chat.map((msg, index) => {
                            let bubble = null;
                            if (msg.from !== 'our') {
                                bubble = (
                                    <div key={index} className="messageContainer">
                                        <div id="botWindow" className="codeFormat">
                                            <div className="senderNameLeft">{msg.from}</div> {/* dynamic group agent */}
                                            <div>
                                                {msg.code && <CodeDisplay code={msg.code} />}
                                                {msg.msg}
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else if (msg.from === 'our' && msg.msg.trim() !== '') {
                                bubble = (
                                    <div key={index} className="messageContainer">
                                        <div id="userWindow" className="codeFormat" >
                                            <div className="senderName">You</div> {/* Static name for the user */}
                                            <div >{msg.msg}
                                            </div>
                                        </div>
                                    </div>
                                );
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