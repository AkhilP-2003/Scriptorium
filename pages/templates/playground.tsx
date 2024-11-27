import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function Playground() {
  const router = useRouter();
  const { id, title, code, language } = router.query;

  // state to manage the current code, output, and execution status
  const [currentCode, setCurrentCode] = useState<string>(code ? code.toString() : "");
  const [currentOutput, setCurrentOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // initialize the code editor with the code from the template
  useEffect(() => {
    if (code) {
      setCurrentCode(code.toString());
    }
  }, [code]);

  // handler for updating code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentCode(e.target.value);
  };

  // Handler to execute the code
  const handleRunCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: currentCode,
          language: language
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        setCurrentOutput(result.output);
      } else {
        setCurrentOutput(`Error: ${result.output}`);
      }
    } catch (error) {
      setCurrentOutput('An error occurred while trying to execute the code.');
      console.error('Error executing code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Playground Mode - Editing: {title}</h1>

      {/* Code Editor Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">Edit Your Code Below:</h3>
        <textarea
          value={currentCode}
          onChange={handleCodeChange}
          className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          rows={15}
        ></textarea>
      </div>

      {/* Run Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleRunCode}
          className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {/* Output Section */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">Output:</h3>
        <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 font-mono text-sm text-gray-800 overflow-auto h-48 shadow-inner">
          {currentOutput || 'No output yet.'}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
    </div>
  );
}
