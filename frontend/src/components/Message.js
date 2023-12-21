import React from 'react'
import { io } from 'socket.io-client';
import CodeDisplay from './CodeDisplay';
import githubImage from '../images/github.jpeg';
import downloadImage from '../images/download.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

// Utility functions to convert Base64 data to Blob and Blob to File
function base64ToBlob(base64Data, contentType) {
    const byteCharacters = atob(base64Data);

    // Create an array buffer and a view (as a byte array)
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Create a blob from the byte array
    return new Blob([byteArray], { type: contentType });
}

// Utility function to download a blob
function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chat: [],
            msg: '',
            sender: '',
            modelType: sessionStorage.getItem('modelType') || 'GPT',
            LLMmodelName: sessionStorage.getItem('LLMmodelName') || '',
            GPTmodelName: sessionStorage.getItem('GPTmodelName') || '', // 从 sessionStorage 获取 Model Name
            apiKey: sessionStorage.getItem('apiKey') || '', // 从 sessionStorage 获取 API Key
            baseUrl: sessionStorage.getItem('baseUrl')|| 'https://alert-passengers-alexandria-mat.trycloudflare.com/v1',
            loading: false,
            url: 'http://127.0.0.1:5003',
            code: '',
            creator: 'Codegen Team',
            files: [
                { name: 'Dummy1.py', type: 'python' },
                { name: 'Dummy2.py', type: 'python' },
                { name: 'Dummy3.py', type: 'python' },
                { name: 'Dummy4.py', type: 'python' },
                // ... 其他文件
            ],
            receivedFiles: [],
        };
        this.socket = null;
    }

   
    componentDidMount() {
        // connect Wbsocket with state
        this.socket = io(this.state.url);

        // listen to the connection events
        this.socket.on('connect', () => {
            console.log('Connected to the server');
        });

        //
        this.socket.on('message', data => {
            console.log('Received message:', data);
            console.log('The data:', data.data);
            console.log('The sender:', data.sender);

            if (data.sender !== 'Admin') {
                this.setState({ loading: false });
                let senderName = data.sender;
                let actionMessage = data.data;
                let responseMsg = actionMessage || "Response from the server";


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


                // Check if the message is a code response
                const codeResponsePattern = /(```|''')[\s\S]+(```|''')/;
                
                if (codeResponsePattern.test(responseMsg)) {
                    // Extract the code using the patterns for Python or Shell
                    const extractedCode = extractCode(responseMsg);
                  
                    // Remove the extracted code from the response message
                    const messageWithoutCode = responseMsg.replace(extractedCode, '').trim();
                  
                    // Add the new message with code
                    addMessageToChat(senderName, messageWithoutCode, extractedCode);
                  }
                 else {
                    // Check for repetitive messages
                    const lastMessage = this.state.chat[this.state.chat.length - 1];
                    if (!lastMessage || lastMessage.from !== senderName || lastMessage.msg !== responseMsg) {
                        // If the message is new, add it to the chat history
                        addMessageToChat(senderName, responseMsg);
                    }
                }
            }
        });

        // Listen to the file_received event
        this.socket.on('file_received', (fileInfo) => {
            // Assuming the data is a Base64 string and you have the filename
            console.log('Received file:', fileInfo.fileName);
            this.setState(prevState => ({
                receivedFiles: [...prevState.receivedFiles, fileInfo],
            })); // Use the actual filename
        });

    }

    componentWillUnmount() {
        if (this.socket) {
            this.socket.close();
        }
    }

    // file upload
    fileInput = React.createRef();


    // Trigger file input click
    handleFileSelectAndUpload = () => {
        this.fileInput.current.click();
    };

    // Handle file selection
    handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            this.setState({ selectedFile: file }, () => {
                this.uploadFile();
            });
        }
    };

    // Upload file using WebSocket
    uploadFile = () => {
        const { selectedFile } = this.state;

        if (selectedFile) {
            this.socket.emit('update_api_key', { 'api_key': this.state.apiKey });

            //sending base URL for LLM
            this.socket.emit('update_LLM_base_url', { 'base_url': this.state.baseUrl });
            const reader = new FileReader();
            reader.onload = (event) => {
                // Send file data through WebSocket
                const base64String = btoa(
                    new Uint8Array(event.target.result)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                this.socket.emit('file-upload', {
                    data: base64String,
                    name: selectedFile.name,
                });
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };





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

    // model_type
    handleModelTypeChange = (e) => {
        const modelType = e.target.value;
        this.setState({ modelType: modelType });

        // update sessionStorage value
        sessionStorage.setItem('modelType', modelType);
    };

    // ----------GPT-----------
    // GPTModel Name inputbox: update the model name in the state
    handleGPTModelNameChange = (e) => {
        const GPTModelName = e.target.value;
        this.setState({ GPTmodelName: GPTModelName });

        // update sessionStorage value
        sessionStorage.setItem('GPTmodelName', GPTModelName);
    };

    // API key inputbox : update the API key in the state
    handleApiKeyChange = (e) => {
        const newApiKey = e.target.value;
        this.setState({apiKey : newApiKey});

        // update sessionStorage value
        sessionStorage.setItem('apiKey', newApiKey);
    };

    // ----------LLM-----------
    // LLMModel Name inputbox: update the model name in the state
    handleLLMModelNameChange = (e) => {
        const LLMModelName = e.target.value;
        this.setState({ LLMmodelName: LLMModelName });

        // update sessionStorage value
        sessionStorage.setItem('LLMmodelName', LLMModelName);
    };

    // LLM Base URL inputbox : update the base URL in the state
    handleBaseUrlChange = (e) => {
        const newBaseUrl = e.target.value;
        this.setState({baseUrl : newBaseUrl});

        // update sessionStorage value
        sessionStorage.setItem('baseUrl', newBaseUrl);
    };


    // ----------Connection-----------
    // Connection BUtton: send all information to the backend
    handleConnect = () => {
        // socket connection
        if (this.socket) {
            // sending model name
            this.socket.emit('update_model_type', { model_type: this.state.modelType });
            this.socket.emit('update_api_key', { api_key: this.state.apiKey });
            this.socket.emit('update_LLM_base_url', { base_url: this.state.baseUrl });
            this.socket.emit('update_GPTmodel_name', { GPTmodel_name: this.state.GPTmodelName });
            this.socket.emit('update_LLMmodel_name', { LLMmodel_name: this.state.LLMmodelName });
            console.log('Connection configuration updated');
            console.log('Connection configuration updated with model type:', this.state.modelType);
        }
    };

    // Send the message to the backend
    handleSend = () => {
        this.setState({ loading: true });
        //socket connection
        //const socket = io('http://127.0.0.1:5002');

        //let socket = io(this.state.url);
        console.log("sending", this.state.url, this.state.loading)
        
        //sending model name
        // this.socket.emit('update_model_name', { 'GPTmodel_name': this.state.GPTmodelName });
        // this.socket.emit('update_model_name', { 'LLMmodel_name': this.state.LLMmodelName });

        //sending API key
        // this.socket.emit('update_api_key', { 'api_key': this.state.apiKey });

        // //sending base URL for LLM
        // this.socket.emit('update_LLM_base_url', { 'base_url': this.state.baseUrl });

        if (this.state.msg !== '') {
            // Indicate loading state
            this.setState({ loading: true }); 

            // Send the message to the server
            this.socket.emit('message', { content: this.state.msg });


            // Utility function to add a message to the chat
            // Adding message bubble for the user's message immediately
            this.setState(prevState => {
                return {
                    chat: [...prevState.chat, { from: 'our', msg: prevState.msg }],
                    msg: ''
                };
            });
        }

    }

    // file download
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

        // recieved files
        const { receivedFiles } = this.state;

        // file download
        const handleDownload = (fileInfo) => {
            const blob = base64ToBlob(fileInfo.fileData, fileInfo.mimeType);
            downloadBlob(blob, fileInfo.fileName);
        };



        // render component for the code file
        return (
            <div id="fullscreen"  >
                <div id="leftSideBar">
                    <div className="information">
                        <div className="llm-selection">
                            <form>
                                {/* sidebar: Radio buttons for selecting the model type */}
                                <div className="radio-buttons">
                                    <input
                                        type="radio"
                                        id="gpt"
                                        name="modelType"
                                        value="GPT"
                                        checked={this.state.modelType === 'GPT'}
                                        onChange={this.handleModelTypeChange}
                                    />
                                    <label htmlFor="gpt">GPT</label>

                                    <input
                                        type="radio"
                                        id="llm"
                                        name="modelType"
                                        value="LLM"
                                        checked={this.state.modelType === 'LLM'}
                                        onChange={this.handleModelTypeChange}
                                    />
                                    <label htmlFor="llm">LLM</label>
                                </div>

                                
                                {//sidebar: GPT information, model name, url name and key name
                                this.state.modelType === 'GPT' && (
                                    <div className="inputs">
                                        <label htmlFor="GPTmodelName">Model Name</label>
                                        <input
                                            type="text"
                                            id="GPTmodelName"
                                            placeholder="gpt-4-1106-preview"
                                            value={this.state.GPTmodelName}
                                            // onChange={(e) => this.setState({ modelName: e.target.value })}
                                            onChange={this.handleGPTModelNameChange}
                                        />
                                        {/* <label htmlFor="urlName">Websocket URL</label>
                                        <input
                                            type="text"
                                            id="urlName"
                                            value={this.state.url}
                                            //onChange={this.handleUrlChange}
                                            // onChange={(e) => this.setState({ url: e.target.value })}
                                            onChange={handleURLChange} 

                                        /> */}
                                        <label htmlFor="keyName">API Key</label>
                                        <input
                                            type="text"
                                            id="keyName"
                                            placeholder="API_Key"

                                            //save the API key in the state.apiKey
                                            value={this.state.apiKey}

                                            // triger the function to update the API key
                                            // onChange={(e) => this.setState({ apiKey: e.target.value })}
                                            onChange={this.handleApiKeyChange} 
                                        />
                                    </div>
                                )}

                                
                                {// sidebar: LLM information, model name, url name and key name
                                this.state.modelType === 'LLM' && (
                                    <div className="inputs">
                                        <label htmlFor="LLMmodelName">Model Name</label>
                                        <input
                                            type="text"
                                            id="LLMmodelName"
                                            placeholder="mistral-7b"
                                            value={this.state.LLMmodelName}
                                            onChange={this.handleLLMModelNameChange}
                                        />
                                        {/* <label htmlFor="urlName">URL</label>
                                        <input
                                            type="text"
                                            id="urlName"
                                            value={this.state.url}
                                            //onChange={this.handleUrlChange}
                                            onChange={(e) => this.setState({ url: e.target.value })}

                                        /> */}

                                        <label htmlFor="keyName">Base URL</label>
                                        <input
                                            type="text"
                                            id="baseUrl"
                                            placeholder="LLM Base URL"
                                            value={this.state.baseUrl}
                                            onChange={this.handleBaseUrlChange}
                                        />
                                    </div>
                                )}

                                {/*connection button to save all infromation into sessionstate*/}
                                <button onClick={this.handleConnect}>Connect</button>
                            </form>
                        </div>
                    </div>

                    {/*sidebar: download codefile section*/}
                    <div className="code-file-section">
                        <div className="section-title">Code File</div>
                        <div className="fileBox">
                            {receivedFiles.map((file, index) => (
                                <button key={index} onClick={() => handleDownload(file)} className="download-btn">
                                    <span className="download-text"> {file.fileName.length > 20 ? `${file.fileName.substring(0, 17)}...` : file.fileName}</span>
                                    <img src={downloadImage} alt="Download" className="download-icon" />
                                </button>
                            ))}

                            {/* <div><ul className="file-list">
                                {this.state.files.map((file, index) => (
                                    <li key={index} className="file-item">
                                        <i className="file-icon"></i> {/Replace with actual icon}
                                        {file.name}
                                    </li>
                                ))}
                            </ul>
                            </div> */}

                        </div>
                        <div className="download-all" onClick={() => this.handleDownload()}>
                            <span className="download-text">Download All</span>
                            <img src={downloadImage} alt="Download" className="download-icon" />
                        </div>
                        {/* <div className="download-all" onClick={() => this.handleDownload()}>
                            <span className="download-text">Download All</span>
                            <img src={downloadImage} alt="Download" className="download-icon" />
                        </div> */}
                    </div>
                    <div className="created-by-section">
                        <img src={githubImage} alt="GitHub" className="creator-image" />
                        <span>Created by {this.state.creator}</span>
                    </div>

                </div>
                <div id="chatContainer">

                    <div id='chatt'>

                        {// main window: the chat bubbles
                        this.state.chat.map((msg, index) => {
                            let bubble = null;
                            // right side chat bubble for user 
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
                                // left side chat bubble for BOT
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
                        {/*add file button*/}
                        <div>
                            <input
                                type="file"
                                onChange={this.handleFileChange}
                                style={{ display: 'none' }}
                                ref={this.fileInput}
                            />
                            <button onClick={this.handleFileSelectAndUpload} class="btn btn-secondary  add-file-btn">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>

                        {/*the message input box*/}
                        <input type='text'
                            name='msg'
                            id="msgText"
                            placeholder="Type your message here..."
                            onChange={(e) => this.handleChange(e)}
                            onKeyDown={(e) => this.handleKeyPress(e)}
                            class="form-control"
                            value={this.state.msg} />

                        {/*send message button*/}
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