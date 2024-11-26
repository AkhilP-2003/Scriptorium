import React, { useState } from 'react';
import Editor from '@monaco-editor/react'; // Monaco editor for code editing
import { useRouter } from 'next/router';

// Define the possible languages for the select dropdown
type Language = 'javascript' | 'java' | 'c' | 'cpp' | 'python';

interface CodeData {
  code: string;
  language: Language;
  stdin: string;
}

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>('console.log("Hello, World!");');
  const [output, setOutput] = useState<string>('');
  const [stdin, setStdin] = useState<string>(''); // Stdin input
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<Language>('javascript');
  const router = useRouter();

  const handleEditorChange = (value: string | undefined): void => {
    setCode(value || '');
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setLanguage(event.target.value as Language);
  };

  const handleRun = async (): Promise<void> => {
    const button = document.querySelector('#run-button') as HTMLElement;
    if (button) {
      button.style.backgroundColor = 'orange';
    }

    const codeData: CodeData = {
      code,
      language,
      stdin,
    };

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(codeData),
      });

      if (response.ok) {
        const result = await response.json();
        setOutput(result.output);
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.message || 'An error occurred.');
      }
    } catch (err) {
      setError('Network error, please try again later.');
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Code Editor</h1>
      </header>
      <div style={styles.controls}>
        <button id="run-button" onClick={handleRun} style={styles.runButton}>
          Run Code
        </button>
        <select
          value={language}
          onChange={handleLanguageChange}
          style={styles.languageSelect}
        >
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="r">R</option>
        </select>
      </div>

      <Editor
        height="50vh"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
        }}
      />

      <textarea
        placeholder="Enter input for stdin..."
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
        style={styles.stdinInput}
      />

      <div style={styles.outputBox}>
        <strong>Output:</strong>
        <div>{output}</div>
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

// Inline styling objects for improved UI
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: '10px',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  runButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  runButtonHover: {
    backgroundColor: '#0056b3',
  },
  languageSelect: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  stdinInput: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    minHeight: '80px',
    fontFamily: 'monospace',
    fontSize: '14px',
    resize: 'vertical',
  },
  outputBox: {
    padding: '10px',
    marginTop: '20px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '5px',
    minHeight: '100px',
    whiteSpace: 'pre-wrap',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '14px',
    transition: 'opacity 0.5s ease-in-out',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default CodeEditor;
