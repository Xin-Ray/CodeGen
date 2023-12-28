import React from 'react';
import './Style.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeDisplay = ({ code }) => {
  const customStyle = {
    width: '800px',  // 设置固定宽度
    overflowX: 'auto',  // 超出部分显示水平滚动条  // 可以设置最大高度，超出部分显示垂直滚动条
  };
  return (
    <div style={customStyle}>
      <SyntaxHighlighter language="python"  style={atomDark}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeDisplay;