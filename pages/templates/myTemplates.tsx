import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import TemplateCard from "../../components/TemplateCard";
import {jwtDecode} from "jwt-decode";
import Link from "next/link";

// define the type for the templates
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

// define the type for the JWT payload
type JwtPayload = {
  id: number
  userName: string
  email: string
  role: string
  exp?: number
};

export default function MyTemplates() {

  // default state of templates is just an empty list of templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // current page number
  const [totalTemplatesCount, setTotalTemplatesCount] = useState(0); // total num of templates
  const [searchQuery, setSearchQuery] = useState("") // search query for filtering templates
  const pageSize = 8
  const router = useRouter()

  // fetch templates created by the logged-in user
  const fetchUserTemplates = async (page: number, userId: number) => {
    try {

      // fetch the templates
      const response = await fetch(`/api/template?page=${page}&limit=${pageSize}&ownerID=${userId}`)

      // check if the http response is not ok
      if (!response.ok) {
        throw new Error("Failed to fetch user templates")
      }

      // parse the json data from our response
      const data = await response.json()

      // update our templates state to be whatever the data is that we fetched
      setTemplates(data.templates)

      // set the total number of pages
      setTotalTemplatesCount(data.totalTemplatesCount)

    } catch (error) {

      // if the fetch fails then throw an error
      console.error("Error fetching user templates:", error)
    }
  }

  // get the logged-in userID and fetch their templates on mount or when currentPage changes
  useEffect(() => {

    // check if the user is logged in
    const accessToken = localStorage.getItem("accessToken")

    // if not logged in then redirect to the login page
    if (!accessToken) {
      router.push("/login")
      return
    }

    try {

      // decode the token
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken)

      // fetch the templates
      fetchUserTemplates(currentPage, decodedToken.id)
    } catch (error) {

      // if the decode fails then redirect to the login page
      console.error("Failed to decode token:", error)
      router.push("/login")
    }
  }, [currentPage])

  // handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    // update the search query
    setSearchQuery(e.target.value)
  }

  // handle next and previous page buttons
  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalTemplatesCount / pageSize)) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1)
    }
  };

  // navigate to a detailed view of template when template is clicked
  const handleTemplateClick = (templateId: number) => {
    router.push(`/templates/${templateId}`)
  };

  // using useMemo to filter templates based on the search query
  const filteredTemplates = useMemo(() => {

    // we only filter when the search query changes
    return templates.filter((template) => 

      // check if the template title, tags, or explanation matches w the search query
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.explanation.toLowerCase().includes(searchQuery.toLowerCase())

    )
  }, [templates, searchQuery])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">My Code Templates</h1>

      {/* view all templates button */}
      <div className="flex justify-end mb-4">
        <Link href="/templates" passHref>
          <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all cursor-pointer">
            View All Templates
          </button>
        </Link>
      </div>

      {/* search bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by title, tags, or explanation"
          className="border p-2 rounded w-1/2"
        />
      </div>

      {/* list of templates */}
      <div id="templates-list" className="grid gap-6 mb-4">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => handleTemplateClick(template.id)}
          />
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
  )
}
