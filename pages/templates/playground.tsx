import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function Playground() {
  const router = useRouter();
  const { id, title, code, language } = router.query;

  // State to manage the current code, output, and execution status
  const [currentCode, setCurrentCode] = useState<string>(code ? code.toString() : "");
  const [currentOutput, setCurrentOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize the code editor with the code from the template
  useEffect(() => {
    if (code) {
      setCurrentCode(code.toString());
    }
  }, [code]);

  // Handler for updating code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentCode(e.target.value);
  };

  // Handler to execute the code
  const handleRunCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/code/visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: currentCode,
          language: language,
        }),
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Playground - {title}</h1>

      {/* Code Editor Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Edit Code:</h3>
        <textarea
          value={currentCode}
          onChange={handleCodeChange}
          className="w-full p-4 border rounded bg-gray-100 font-mono text-sm"
          rows={15}
        ></textarea>
      </div>

      {/* Run Button */}
      <button
        onClick={handleRunCode}
        className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
        disabled={isLoading}
      >
        {isLoading ? 'Running...' : 'Run Code'}
      </button>

      {/* Output Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Output:</h3>
        <div className="w-full p-4 border rounded bg-gray-200 font-mono text-sm overflow-auto h-40">
          {currentOutput || 'No output yet.'}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
    </div>
  );
}
