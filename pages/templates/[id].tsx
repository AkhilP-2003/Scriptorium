import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';

// defining the type for the template
type Template = {
  id: number
  title: string
  explanation: string
  tags: string
  owner: {
    id: number
    userName: string
  }
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{template.title}</h1>
      <p className="text-gray-600 mb-4">Author: {template.owner.userName}</p>
      <div className="border p-4 rounded shadow">
        <p className="mb-2 text-lg">{template.explanation}</p>
        <p className="text-sm text-gray-600">Tags: {template.tags}</p>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => router.back()}
      >
        Back
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
  

