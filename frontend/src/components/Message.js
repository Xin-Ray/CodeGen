import React from 'react'
import { io } from 'socket.io-client';
import CodeDisplay from './CodeDisplay';
import githubImage from '../images/github.jpeg';
import downloadImage from '../images/download.jpeg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';


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
        code: '',
        creator: 'Codegen Team',
        files: [
            { name: 'Dummy1.py', type: 'python' },
            { name: 'Dummy2.py', type: 'python' },
            { name: 'Dummy3.py', type: 'python' },
            { name: 'Dummy4.py', type: 'python' },
            // ... other files
        ],
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

                        // Add the new message with code
                        addMessageToChat(senderName, null, extractedCode);
                    } else {
                        // Check for repetitive messages
                        const lastMessage = this.state.chat[this.state.chat.length - 1];
                        if (!lastMessage || lastMessage.from !== senderName || lastMessage.msg !== responseMsg) {
                            // If the message is new, add it to the chat history
                            addMessageToChat(senderName, responseMsg);
                        }
                    }
                }
            });

            // Utility function to add a message to the chat
            const addMessageToChat = (senderName, msg, code = null) => {
                this.setState(prevState => ({
                    chat: [...prevState.chat, { from: senderName, msg, code }],
                    loading: false // Turn off loading state after receiving the response
                }));
            };


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
    handleDownload = () => {
        // This example assumes you have the file you want to download available at a certain URL
        const fileUrl = 'path_to_your_file/websocket.py'; // URL to the file
        const fileName = 'websocket.py'; // Name of the file to download

        // Create a new anchor element dynamically
        const anchorElement = document.createElement('a');
        anchorElement.href = fileUrl;
        anchorElement.download = fileName; // The download attribute specifies that the target will be downloaded

        // Append anchor to the body
        document.body.appendChild(anchorElement);
        // Trigger the download by simulating a click on the anchor
        anchorElement.click();
        // Clean up: remove anchor from body
        document.body.removeChild(anchorElement);
    };

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
                    <div className="code-file-section">
                        <div className="section-title">Code File</div>
                        <div className="fileBox">
                            <div><ul className="file-list">
                                {this.state.files.map((file, index) => (
                                    <li key={index} className="file-item">
                                        <i className="file-icon"></i> {/* Replace with actual icon */}
                                        {file.name}
                                    </li>
                                ))}
                            </ul>
                            </div>

                        </div>
                        <div className="download-all" onClick={() => this.handleDownload()}>
                            <span className="download-text">Download All</span>
                            <img src={downloadImage} alt="Download" className="download-icon" />
                        </div>
                    </div>
                    <div className="created-by-section">
                        <img src={githubImage} alt="GitHub" className="creator-image" />
                        <span>Created by {this.state.creator}</span>
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

                    <div className="input-group">
                        <button className="add-file-btn">
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                        <input type='text'
                            name='msg'
                            id="msgText"
                            placeholder="Type your message here..."
                            onChange={(e) => this.handleChange(e)}
                            onKeyDown={(e) => this.handleKeyPress(e)}
                            class="form-control"
                            value={this.state.msg} />
                        <button id="submitBtn"
                            onClick={() => this.handleSend()}
                            type="submit"
                            class="btn btn-primary"> <FontAwesomeIcon icon={faPaperPlane} /></button>
                    </div>


                </div>
            </div >
        )
    }
}
export default Message;