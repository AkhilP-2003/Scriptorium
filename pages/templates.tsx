import React, { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";

// defining the type for the templates
type Template = {

  // these are the fields of the template
  id: number
  title: string
  explanation: string
  tags: string
}

export default function Templates() {

  // default state of tempaltes is just an empty list of templates
  const [templates, setTemplates] = useState<Template[]>([])

  // fetch the listt of templates from our api (we wanna do this on mount)
  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/template")

      // check if the http response is not ok
      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }

      // parse teh json data from our response
      const data = await response.json()

      // update our templates state to be whatever the data is that we fetched
      setTemplates(data.templates)

    } catch (error) {

      // log the error if smth is wrong
      console.error("Error fetching templates:", error)
    }
  }

  // we acc fetch the templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [])

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Code Templates</h1>

        <div id="templates-list" className="grid gap-6 mb-4">
          {templates.map((template) => (

            <div key={template.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{template.title}</h2>
              <p className="mb-2">{template.explanation}</p>
              <p className="text-sm text-gray-600">Tags: {template.tags}</p>
            </div>

          ))}
        </div>
      </div>
    </>
  )
}
