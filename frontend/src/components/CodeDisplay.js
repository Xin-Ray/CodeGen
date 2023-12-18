import React from 'react';
import './Style.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeDisplay = ({ code }) => {
  return (
    <SyntaxHighlighter language="python"  style={atomDark}>
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeDisplay;