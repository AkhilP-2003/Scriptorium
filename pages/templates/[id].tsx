import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { jwtDecode } from 'jwt-decode';
import { Editor } from '@monaco-editor/react';

// defining the type for the template
type Code = {
  id: number
  code: string
  language: string
  input?: string
  output?: string
  error?: string
}

type Template = {
  id: number
  title: string
  explanation: string
  tags: string
  owner: {
    id: number
    userName: string
  }
  code: Code | null
  parentTemplateId?: number | null
  parentOwnerName?: string | null
}

type JwtPayload = {
  id: number
  userName: string
  email: string
  role: string
  exp?: number
}

// define the props that will be passed to the templateDetails component
type TemplateDetailsProps = {
  template: Template | null;
}

export default function TemplateDetails({ template }: TemplateDetailsProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  if (!template) {
    return <div>Template not found</div>
  }

  const handleForkTemplate = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('No access token found');
      router.push('/login');
      return;
    }
  
    try {
      // decode the token
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
  
      // check if the token is expired
      if (decodedToken.exp && decodedToken.exp < currentTime) {

        // if the token is expired then redirect to login
        console.warn('Token expired. Redirecting to login.')
        router.push('/login')
        return
      }
  
      // check if the template has code
      if (template?.code) {

        // update the url correctly when forking
        router.push({
          pathname: '/templates/new',
          query: {
            title: `Forked from: ${template.title}`,
            explanation: template.explanation,
            tags: `Forked from ${template.owner.userName}`,
            code: template.code.code,
            language: template.code.language,
            parentTemplateId: template.id,
            ownerName: template.owner.userName
          }
        })

      } else {

        // if the template does not have code
        console.error('No code found for this template')
      }
    } catch (error) {

      // if there is an error decoding the token
      console.error('Error decoding token:', error)
      router.push('/login');
    }
  }
  

  const handleRunTemplate = () => {

    if (template?.code) {


      router.push({
        pathname: '/editor',
        query: {
          code: template.code.code,
          language: template.code.language
        }
      })

    } else {
      console.error('No code found for this template')
    }

  }
  
  

  return (
    <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-4">Currently Viewing Code Template: {template.title}</h1>
    <p className="text-gray-600 mb-4">Author: {template.owner.userName}</p>
    <div className="border p-4 rounded shadow mb-4">

      {/* status Display for forked/original */}
      {/* <p className="mb-2 text-lg font-semibold">
        Status:{" "}
        {template.parentTemplateId ? (
          <span className="text-yellow-600">
            Forked from <strong>{template.parentOwnerName}</strong>
          </span>
        ) : (
          <span className="text-green-600">Original</span>
        )}
      </p> */}

      {/* explanation and tags */}
      <p className="mb-2 text-lg">{template.explanation}</p>
      <p className="text-sm text-gray-600">Tags: {template.tags}</p>
    </div>

    {/* code - using react-syntax-highlighter library */}
    {template.code && (
      <div className="border p-6 rounded shadow mb-6 bg-gray-100">
        <h3 className="text-2xl font-semibold mb-4">Code:</h3>
        <SyntaxHighlighter language={template.code.language} style={oneDark}>
          {template.code.code}
        </SyntaxHighlighter>
        <p className="text-sm text-gray-600 mt-4">Language: {template.code.language}</p>
      </div>
    )}

    {/* buttons for back, run, fork */}
    <button
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={() => router.back()}
    >
      Back
    </button>

    <button
      className="mt-4 ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      onClick={handleRunTemplate}
    >
      Run
    </button>

    <button
      className="mt-4 ml-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      onClick={handleForkTemplate}
    >
      Fork & Modify
    </button>
  </div>
)
}

// fetch the data for the specific template using the id from our url
// rmbr that we are passing props from the parent component to the child component templateDetails
  export const getServerSideProps: GetServerSideProps = async (context) => {   // getServerSideProps is a next js function that allows us to fetch data before the page is rendered


    const { id } = context.params!
  
    try {
      const response = await fetch(`http://localhost:3000/api/template/${id}`)

      // check if response is not ok
      if (!response.ok) {
        throw new Error('Failed to fetch template')
      }
  
      const data = await response.json() // parse JSON res
      console.log('Template data:', data); // Log the template data for debugging

  
      return {

        // pass the template object to the page
        props: {
          template: data.template 
        }
      }
    } catch (error) {

      // if the fetch fails then return a null template
      console.error('Error fetching template details:', error)
      return {
        props: {
          template: null
        }
      }
    }
  }
  

