// App.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Editor from '@monaco-editor/react'; // Import Monaco Editor component
import { useRouter } from "next/router";

export default function Code() {
  const [code, setCode] = useState(`function helloWorld() {
    console.log("Hello, World!");
  }`);

  const [output, setOutput] = useState('');
  const router = useRouter();

  // Handle editor change event
  const handleEditorChange = (value: string | undefined) => {
    setCode(value || ""); // Update state with new code
  };


  const handleRun = async() => {
      const button = document.querySelector('#run-button') as HTMLButtonElement;
      if (button){
        button.style.backgroundColor = 'orange';
      }
      
      const codeData = {
        'code': code,
        'language': 'javascript',
        'stdin': ''

    };
    try {
        const response = await fetch('/api/code/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(codeData),
        });
        // Check if the request was successful
        if (response.ok) {
            const result = await response.json();
            alert('Code Executed');
            console.log(output) //debugging
            setOutput(result.output);
            // redirect to login page
            //router.push("/login");

        } else {
            let error = await response.json();
            // Handle error (e.g., show an error message)
            //setError({ message: error.message}); 
        }

    } catch(error) {
        //setError({ message: 'Network error, please try again later.' });
        console.error(error);
    }
      
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '10px', backgroundColor: '#333', color: '#fff', textAlign: 'center' }}>
        <h1>Monaco Code Editor with React</h1>
      </header>
      <button 
      id = "run-button"
      onClick = {handleRun}
      style={{
        padding: '10px 20px', 
        backgroundColor: '#007bff', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer'
      }}
      >
        Run Code
      </button>
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
      <div
        style={{
          padding: '10px',
          marginTop: '10px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ccc',
          borderRadius: '5px',
          minHeight: '100px', // Ensure there is a minimum height for output area
          whiteSpace: 'pre-wrap', // Preserve formatting of code or output
          overflowY: 'auto', // Allow scrolling if content overflows
        }}
      >
        <strong>Output:</strong>
        <pre>{output}</pre> {/* Display output or errors here */}
      </div>
    </div>
  )
}


