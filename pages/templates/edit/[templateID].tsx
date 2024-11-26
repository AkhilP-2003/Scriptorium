import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import Editor from '@monaco-editor/react';
type Language = 'javascript' | 'java' | 'c' | 'cpp' | 'python' | 'r' | 'go' | 'php' | 'ruby' | 'perl';


const EditTemplatePage: React.FC = () => {
  const [templateData, setTemplateData] = useState({
    title: '',
    explanation: '',
    tags: '',
    language: '',
    code: ''
  })
  
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { templateID } = router.query;

  // fetch the existing template details when the page loads
  useEffect(() => {

    // check if templateID exists
    if (!templateID) return

    // fetch the template
    const fetchTemplate = async () => {

      try { 

        // fetch the template via the endpoint
        const response = await fetch(`/api/template/${templateID}`)

        // check if the response is not ok
        if (!response.ok) {
          throw new Error('Failed to fetch template data')
        }

        // parse the json data
        const data = await response.json();

        // console.log('Template data:', data); 

        // set the template data by checking if the data exists and is not null
        if (data && data.template) {

          // set the template data
          setTemplateData({
            title: data.template.title,             // set the title
            explanation: data.template.explanation, // set the explanation
            tags: data.template.tags,               // set the tags   
            language: data.template.code?.language || '', // set the language
            code: data.template.code?.code || '' // set the code
          })

        }

        // set the loading state to false
        setIsLoading(false) // Data fetched, stop loading
        
      } catch (error) {
        console.error('Error fetching template:', error);

        // set the error message
        setErrorMessage('Failed to load template details. Please try again.')

        // stop loading
        setIsLoading(false)
      }
    }

    // console.log('Template ID:', templateID)

    // fetch the template
    fetchTemplate()

  }, [templateID]) // run the effect when the templateID changes

  // handle form submission to edit the template
  const handleEditTemplate = async (e: React.FormEvent) => {

    // prevent the form from submitting
    e.preventDefault()

    // get the form data
    const { title, explanation, tags, code, language } = templateData

    // check if all fields are filled/valid etc
    if (!title.trim() || !explanation.trim() || !tags.trim() || !code.trim() || !language.trim()) {

      // set the error message
      setErrorMessage('All fields are required.')
      return
    }

    // clear the error message
    setErrorMessage(null)

    // create the updated template data
    const updatedTemplateData = { title, explanation, tags, code, language }

    try {

      // check if the user is authenticated
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        router.push('/login')
        return
      }

      // send PUT request to update the template
      const response = await fetch(`/api/template/edit/${templateID}`, {

        // send the updated template data
        method: 'PUT',

        // add the authorization header
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
      
        body: JSON.stringify(updatedTemplateData) // turn the updated template data into a json string

      })

      // check if the response is not ok
      if (!response.ok) {

        // get the error data
        const errorData = await response.json()
        console.error('Error response from server:', errorData)
        alert(`Error updating template: ${errorData.error || 'Unknown error'}`)
        return

      }

      // redirect to the usres templates list after updating
      alert('Template updated successfully')
      router.push('/templates/myTemplates')
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Error updating template')
    }
  };

  // render loading message/form based on loading state
  if (isLoading) {
    return <div>Loading template details...</div>;
  }

  const handleEditorChange = (value: string | undefined) => {
    setTemplateData({ ...templateData, code: value || '' });
  };

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
          <select
            value={templateData.language}
            onChange={(e) => setTemplateData({ ...templateData, language: e.target.value as Language })}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
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

        {/* Code field */}
        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-gray-700">Code</label>
          <Editor
            height="40vh"
            language={templateData.language}
            value={templateData.code}
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
  )
}

export default EditTemplatePage
