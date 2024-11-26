import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {jwtDecode} from 'jwt-decode';

// page should show the new template form
const NewTemplatePage: React.FC = () => {
  const [title, setTitle] = useState('')
  const [explanation, setExplanation] = useState('')
  const [tags, setTags] = useState('')
  const [language, setLanguage] = useState('')
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  // get the template data from the query params
  const {title: initialTitle, explanation: initialExplanation, tags: initialTags, code: initialCode, language: initialLanguage, parentTemplateId} = router.query

  // check if the user is authenticated
  useEffect(() => { 

    // check if the user is authenticated
    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
      // no access token, redirect to login page
      router.push('/login')
      return
    }

    try {

      // decode the token to check if expired
      const decodedToken: { exp: number } = jwtDecode(accessToken)
      const currentTime = Date.now() / 1000 // current time in seconds

      // dheck if the token is expired
      if (decodedToken.exp < currentTime) {
        // token is expired so redirect to login
        router.push('/login')
      }
    } catch (error) {
      console.error('Invalid token:', error)
      router.push('/login') // redirect to login if thers an error decoding the token
    }
  }, [])

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()

    // validate that the required fields are not empty
    if (!title.trim()) {
      setErrorMessage("Title is required.")
      return
    }

    if (!explanation.trim()) {
      setErrorMessage("Explanation is required.")
      return
    }

    if (!tags.trim()) {
      setErrorMessage("Tags are required.")
      return
    }

    if (!code.trim()) {
      setErrorMessage("Code is required.")
      return
    }

    if (!language.trim()) {
      setErrorMessage("Language is required.")
      return
    }    

    setErrorMessage(null); // Clear any previous error messages

    const templateData = { title, explanation, tags, code, language, parentTemplateId: parentTemplateId ? parseInt(parentTemplateId.toString()) : undefined }

    try {

      // check if the user is authenticated
      const accessToken = localStorage.getItem('accessToken')

      // create the template
      const response = await fetch('/api/template/create', {

        // send the template data
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` // include the access token for authentication
        },
        body: JSON.stringify(templateData)

      })

      // check if the response is not ok
      if (!response.ok) {

        // display the error message
        const errorData = await response.json()
        console.error('Error response from server:', errorData)
        alert(`Error creating template: ${errorData.error || "Unknown error"}`)
        return

      }

      // since the template was created w no issues we can redirect to templates list page
      alert('Template created successfully')
      router.push('/templates')

    } catch (error) {

      console.error('Error creating template:', error)
      alert('Error creating template')

    }
  };

  return (
    <div className="container mx-auto p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        Create a New Code Template
      </h1>
      <form onSubmit={handleCreateTemplate}>

        {/* display validation error message if its therr */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            {errorMessage}
          </div>
        )}

        {/* form title field */}
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

        {/* form explanation field */}
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

        {/* form tags field */}
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

        {/* form language field */}
        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Language</label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter language (e.g., JavaScript, Python)"
          />
        </div>

        {/* form code field */}
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

        {/* form submit and cancel buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all duration-300"
          >
            Create Template
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

export default NewTemplatePage
