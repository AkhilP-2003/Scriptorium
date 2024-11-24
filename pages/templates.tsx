import React, { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";

// defining the type for the templates
type Template = {

  // these are the fields of the template
  id: number
  title: string
  explanation: string
  tags: string
  owner: {
    id: number
    userName: string
  }
}

export default function Templates() {

  // default state of tempaltes is just an empty list of templates
  const [templates, setTemplates] = useState<Template[]>([])

  // states for pagination
  const [currentPage, setCurrentPage] = useState(1) // current page number
  const [totalTemplatesCount, setTotalTemplatesCount] = useState(0) // total num of templates
  const pageSize = 10

  // fetch the listt of templates from our api (we wanna do this on mount)
  const fetchTemplates = async (page: number) => {
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

      // set the total number of pages
      setTotalTemplatesCount(data.totalTemplatesCount)


    } catch (error) {

      // log the error if smth is wrong
      console.error("Error fetching templates:", error)
    }
  }

  // we acc fetch the templates on mount
  useEffect(() => {
    fetchTemplates(currentPage)
  }, [currentPage])

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalTemplatesCount / pageSize)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Code Templates</h1>


        {/* list of templates */}
        <div id="templates-list" className="grid gap-6 mb-4">
          {templates.map((template) => (

            // in our list of templates we render a div for each template
            <div key={template.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2 flex justify-between items-center">
                {template.title}
                <span className="text-sm font-normal text-gray-500">Author: {template.owner.userName}</span>
              </h2>
              <p className="mb-2">{template.explanation}</p>
              <p className="text-sm text-gray-600">Tags: {template.tags}</p>
            </div>


          ))}
        </div>


        {/* pagination buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(totalTemplatesCount / pageSize)}
            className={`px-4 py-2 rounded ${
              currentPage >= Math.ceil(totalTemplatesCount / pageSize)
                ? "bg-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next
          </button>
        </div>


      </div>
    </>
  )
}
