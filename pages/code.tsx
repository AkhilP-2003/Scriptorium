// App.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Editor from '@monaco-editor/react'; // Import Monaco Editor component

export default function Code() {
  const [code, setCode] = useState(`function helloWorld() {
    console.log("Hello, World!");
  }`);

  // Handle editor change event
  const handleEditorChange = (value: string | undefined) => {
    setCode(value || ""); // Update state with new code
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '10px', backgroundColor: '#333', color: '#fff', textAlign: 'center' }}>
        <h1>Monaco Code Editor with React</h1>
      </header>
      <Editor
        height="90vh"
        language="javascript" // Set the language to JavaScript
        value={code} // Controlled editor, bind value to React state
        onChange={handleEditorChange} // Handle code changes
        theme="vs-dark" // Set dark theme
        options={{
          minimap: { enabled: false }, // Disable minimap
          fontSize: 14, // Set font size
          scrollBeyondLastLine: false, // Disable scroll beyond the last line
        }}
      />
    </div>
  )
}


