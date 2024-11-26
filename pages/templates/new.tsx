import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

// Define state types
type Language = 'javascript' | 'java' | 'c' | 'cpp' | 'python' | 'r' | 'go' | 'php' | 'ruby' | 'perl';

const NewTemplate: React.FC = () => {
  const router = useRouter();
  const { title, explanation, tags, code, language, parentTemplateId, ownerName } = router.query;

  // Initialize state with query parameters if available
  const [templateTitle, setTemplateTitle] = useState<string>((title as string) || '');
  const [templateExplanation, setTemplateExplanation] = useState<string>((explanation as string) || '');
  const [templateTags, setTemplateTags] = useState<string>((tags as string) || '');
  const [templateCode, setTemplateCode] = useState<string>((code as string) || '');
  const [templateLanguage, setTemplateLanguage] = useState<Language>((language as Language) || 'javascript');

  // Effect to set values from the query after navigation completes
  useEffect(() => {
    if (title) setTemplateTitle(title as string);
    if (explanation) setTemplateExplanation(explanation as string);
    if (tags) setTemplateTags(tags as string);
    if (code) setTemplateCode(code as string);
    if (language) setTemplateLanguage(language as Language);
  }, [title, explanation, tags, code, language]);

  const handleSaveTemplate = async () => {
    const newTemplate = {
      title: templateTitle,
      explanation: templateExplanation,
      tags: templateTags,
      code: templateCode,
      language: templateLanguage,
      parentTemplateId: parentTemplateId ? parseInt(parentTemplateId as string) : null,
    };

    try {
      const response = await fetch('/api/template/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(newTemplate),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      alert('Template saved successfully');
      router.push('/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const handleEditorChange = (value: string | undefined): void => {
    setTemplateCode(value || '');
  };

  return (
    <div className="container mx-auto p-4 md:p-12" style={{ maxWidth: '1200px' }}>
      <div
        className="bg-gray-100 p-8 rounded-lg shadow-lg mb-8 text-center"
        style={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '15px' }}
      >
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: '#333', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          Create New Template
        </h1>
        {parentTemplateId && (
          <p
            className="text-lg italic text-gray-700 mb-4"
            style={{ fontSize: '18px', color: '#666', fontStyle: 'italic' }}
          >
            Forked from a template by <span className="font-semibold text-gray-800">{ownerName}</span>
          </p>
        )}
      </div>

      <div
        className="bg-white p-8 md:p-12 rounded-lg shadow-md mb-8"
        style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
      >
        <div className="mb-8">
          <label
            className="block text-lg md:text-xl font-semibold mb-2"
            style={{ color: '#333', fontWeight: 'bold' }}
          >
            Title
          </label>
          <input
            type="text"
            value={templateTitle}
            onChange={(e) => setTemplateTitle(e.target.value)}
            className="border rounded w-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base md:text-lg"
            style={{ border: '1px solid #ccc', borderRadius: '10px' }}
          />
        </div>

        <div className="mb-8">
          <label
            className="block text-lg md:text-xl font-semibold mb-2"
            style={{ color: '#333', fontWeight: 'bold' }}
          >
            Explanation
          </label>
          <textarea
            value={templateExplanation}
            onChange={(e) => setTemplateExplanation(e.target.value)}
            className="border rounded w-full p-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base md:text-lg"
            style={{ border: '1px solid #ccc', borderRadius: '10px' }}
          />
        </div>

        <div className="mb-8">
          <label
            className="block text-lg md:text-xl font-semibold mb-2"
            style={{ color: '#333', fontWeight: 'bold' }}
          >
            Tags
          </label>
          <input
            type="text"
            value={templateTags}
            onChange={(e) => setTemplateTags(e.target.value)}
            className="border rounded w-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base md:text-lg"
            style={{ border: '1px solid #ccc', borderRadius: '10px' }}
          />
        </div>

        <div className="mb-8">
          <label
            className="block text-lg md:text-xl font-semibold mb-2"
            style={{ color: '#333', fontWeight: 'bold' }}
          >
            Code
          </label>
          <Editor
            height="40vh"
            language={templateLanguage}
            value={templateCode}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              scrollBeyondLastLine: false,
              readOnly: false,
            }}
          />
        </div>

        <div className="mb-8">
          <label
            className="block text-lg md:text-xl font-semibold mb-2"
            style={{ color: '#333', fontWeight: 'bold' }}
          >
            Language
          </label>
          <select
            value={templateLanguage}
            onChange={(e) => setTemplateLanguage(e.target.value as Language)}
            className="border rounded w-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base md:text-lg"
            style={{ border: '1px solid #ccc', borderRadius: '10px' }}
          >
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="r">R</option>
            <option value="go">Go</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="perl">Perl</option>
          </select>
        </div>

        <button
          onClick={handleSaveTemplate}
          className="w-full mt-4 px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
        >
          Save Template
        </button>
      </div>
    </div>
  )
}

export default NewTemplate;
