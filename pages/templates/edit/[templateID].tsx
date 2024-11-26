import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

const EditTemplatePage: React.FC = () => {
  const [templateData, setTemplateData] = useState({
    title: '',
    explanation: '',
    tags: '',
    language: '',
    code: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { templateID } = router.query;

  // Fetch the existing template details when the page loads
  useEffect(() => {
    if (!templateID) return;

    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/template/${templateID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch template data');
        }
        const data = await response.json();

        console.log('Template data:', data); // Log template data to confirm the structure

        // Assuming the response contains a `template` object like { template: {...} }
        if (data && data.template) {
          setTemplateData({
            title: data.template.title,
            explanation: data.template.explanation,
            tags: data.template.tags,
            language: data.template.code?.language || '', // Extract nested code language if available
            code: data.template.code?.code || '', // Extract nested code if available
          });
        }
        setIsLoading(false); // Data fetched, stop loading
      } catch (error) {
        console.error('Error fetching template:', error);
        setErrorMessage('Failed to load template details. Please try again.');
        setIsLoading(false); // Stop loading in case of an error too
      }
    };

    console.log('Template ID:', templateID);
    fetchTemplate();
  }, [templateID]);

  // Handle form submission to edit the template
  const handleEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { title, explanation, tags, code, language } = templateData;

    // Validate fields
    if (!title.trim() || !explanation.trim() || !tags.trim() || !code.trim() || !language.trim()) {
      setErrorMessage('All fields are required.');
      return;
    }

    setErrorMessage(null); // Clear any previous error messages

    const updatedTemplateData = { title, explanation, tags, code, language };

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      // Send PUT request to update the template
      const response = await fetch(`/api/template/edit/${templateID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedTemplateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        alert(`Error updating template: ${errorData.error || 'Unknown error'}`);
        return;
      }

      // Redirect to the templates list after successful update
      alert('Template updated successfully');
      router.push('/templates');
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Error updating template');
    }
  };

  // Render loading message or the form based on loading state
  if (isLoading) {
    return <div>Loading template details...</div>;
  }

  return (
    <div className="container mx-auto p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Edit Code Template</h1>
      <form onSubmit={handleEditTemplate}>
        {/* Display validation error message if there is one */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            {errorMessage}
          </div>
        )}

        {/* Title field */}
        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Title</label>
          <input
            type="text"
            value={templateData.title}
            onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter template title"
          />
        </div>

        {/* Explanation field */}
        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Explanation</label>
          <textarea
            value={templateData.explanation}
            onChange={(e) => setTemplateData({ ...templateData, explanation: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            rows={5}
            placeholder="Enter a detailed explanation"
          ></textarea>
        </div>

        {/* Tags field */}
        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Tags</label>
          <input
            type="text"
            value={templateData.tags}
            onChange={(e) => setTemplateData({ ...templateData, tags: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter tags separated by commas"
          />
        </div>

        {/* Language field */}
        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Language</label>
          <input
            type="text"
            value={templateData.language}
            onChange={(e) => setTemplateData({ ...templateData, language: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter language (e.g., JavaScript, Python)"
          />
        </div>

        {/* Code field */}
        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Code</label>
          <textarea
            value={templateData.code}
            onChange={(e) => setTemplateData({ ...templateData, code: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-900 text-white font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            rows={15}
            placeholder="Enter your code here"
          ></textarea>
        </div>

        {/* Submit and cancel buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all duration-300"
          >
            Save Changes
          </button>
          <button
            type="button"
            className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTemplatePage;
