import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

interface TemplateFormProps {
  onSubmit: (data: {
    title: string
    explanation: string
    tags: string
    code: string
  }) => void;
  initialData?: {
    title: string
    explanation: string
    tags: string
    code: string
  };
}

const TemplateForm: React.FC<TemplateFormProps> = ({ onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '')
  const [explanation, setExplanation] = useState(initialData?.explanation || '')
  const [tags, setTags] = useState(initialData?.tags || '')
  const [code, setCode] = useState(initialData?.code || '')
  const router = useRouter()

  useEffect(() => {
    // Check if the user is authenticated
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      // No access token, redirect to login page
      router.push('/login')
      return;
    }

    try {
      // decode the token to check if it's expired
      const decodedToken: { exp: number } = jwtDecode(accessToken)
      const currentTime = Date.now() / 1000 // Current time in seconds

      if (decodedToken.exp < currentTime) {
        // token is expired, redirect to login
        router.push('/login')
      }
    } catch (error) {
      console.error('Invalid token:', error)
      router.push('/login') // Redirect to login if there's an error decoding the token
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, explanation, tags, code })
  }

  return (
    <div className="container mx-auto p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        {initialData ? 'Edit Template' : 'Create New Template'}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter template title"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Explanation</label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            rows={5}
            placeholder="Enter a detailed explanation"
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter tags separated by commas"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-900 text-white font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            rows={15}
            placeholder="Enter your code here"
          ></textarea>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all duration-300"
          >
            {initialData ? 'Save Changes' : 'Create Template'}
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
  )
}

export default TemplateForm;
