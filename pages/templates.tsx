import React, { useState, useEffect, useMemo } from "react";
import NavigationBar from "../components/NavigationBar";
import { useRouter } from "next/router";
import { title } from "process";

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
  const pageSize = 8

  // state for search bar nav
  const [searchQuery, setSearchQuery] = useState(""); // search query for filtering templates

  // states for filters
  //const [titleFilter, setTitleFilter] = useState("")
  //const [tagFilter, setTagFilter] = useState("")

  const router = useRouter() // use the router for updating the query params in our url

  const updateQueryParams = () => {

    // update the query params
    router.push(
      {
        pathname: router.pathname,
        query: {
          page: currentPage,
          search: searchQuery
        }
      },
      undefined,
      { shallow: true } // this is to prevent the page from being reloaded
    )
  }


  // fetch the listt of templates from our api (we wanna do this on mount)
  const fetchTemplates = async (page: number) => {
    try {
      const response = await fetch(`/api/template?page=${page}&limit=${pageSize}`)

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


  // we acc fetch the templates when the page loads/changes
  useEffect(() => {
    fetchTemplates(currentPage)
  }, [currentPage])

  // set intial states based on query params in our url
  useEffect(() => {
    const { page, search } = router.query

    if (page) {
      setCurrentPage(parseInt(page as string))
    } else {
      setCurrentPage(1)
    }

    if (search) {
      setSearchQuery(search as string)}
    else {
      setSearchQuery("")
    }

  }, [router.query])

  // update the query params when the filter changes
  useEffect(() => {
    updateQueryParams()
  }, [currentPage, searchQuery])


  // using the memo hook to compute the filtered templates based on the search query 
  const filteredTemplates = useMemo(() => {

    // we only filter wwhent eh search query changes
    return templates.filter((template) => {

      return (

        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||  // search by title
        template.tags.toLowerCase().includes(searchQuery.toLowerCase())  ||  // search by tags
        template.explanation.toLowerCase().includes(searchQuery.toLowerCase()) // search by explanation

      )

    })

  }, [templates, searchQuery])

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalTemplatesCount / pageSize)) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Code Templates</h1>

        {/* search bar */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, tags, or explanation"
            className="border p-2 rounded w-1/2"
          />
        </div>


        {/* list of templates */}
        <div id="templates-list" className="grid gap-6 mb-4">

          {filteredTemplates.map((template) => (

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
