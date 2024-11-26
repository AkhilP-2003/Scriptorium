import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import TemplateCard from "../../components/TemplateCard";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

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

type JwtPayload = {
  id: number
  userName: string
  email: string
  role: string
  exp?: number
}

export default function MyTemplates() {

  // all the states
  const [templates, setTemplates] = useState<Template[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTemplatesCount, setTotalTemplatesCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const pageSize = 8
  const router = useRouter()
  const [userId, setUserId] = useState<number | null>(null)

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

      // update our total templates count
      setTotalTemplatesCount(data.totalTemplatesCount)

    } catch (error) {
      // log the error
      console.error("Error fetching user templates:", error)
    }
  }

  useEffect(() => {

    // check if the user is logged in
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {

      // if no access token is found then we redirect to the login/signup page
      router.push("/login")
      return
    }

    try {

      // decode the token
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken)

      // set the user id
      setUserId(decodedToken.id)

      // fetch the user templates
      fetchUserTemplates(currentPage, decodedToken.id)

    } catch (error) {

      // log the error
      console.error("Failed to decode token:", error)
      // redirect to the login page
      router.push("/login")
    }
  }, [currentPage])


  // handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    // update the search query
    setSearchQuery(e.target.value)
  }

  // handle next page button
  const handleNextPage = () => {

    // check if the current page is less than the total number of pages
    if (currentPage < Math.ceil(totalTemplatesCount / pageSize)) {

      // update the current page
      setCurrentPage((prevPage) => prevPage + 1)
    }

  }
// handle prev page
  const handlePrevPage = () => {

    // check if the current page we're on is not the first page
    if (currentPage > 1) {

      // update the current page since we're not on the first page
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  // handle template click
  const handleTemplateClick = (templateId: number) => {

    // navigate to the template page
    router.push(`/templates/${templateId}`)
  }

  // handle template editing
  const handleEditTemplate = (templateId: number) => {

    // check if the user is logged in
    const accessToken = localStorage.getItem("accessToken")

    // if the user is not logged in then redirect to the login/signup page
    if (!accessToken) {
      router.push("/login")
      return
    }

    try {

      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken)
      const currentTime = Math.floor(Date.now() / 1000) // current time in seconds

      // check if the token is expired
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        // if the token is expired thenredirect to login
        console.warn("Token expired. Redirecting to login.")
        router.push("/login")
        return
      }

      // navigate to the edit template page
      router.push(`/templates/edit/${templateId}`)

    } catch (error) {

      // if there is an error decoding the token then redirect to the login/signup page
      console.error("Error decoding token:", error)
      router.push("/login")
    }

  }

  // handle template deletion
  const handleDeleteTemplate = async (templateId: number) => {

    // confirm the deletion
    const confirmDelete = confirm("Are you sure you want to delete this template?")

    // if no then return
    if (!confirmDelete) {
      return 
    }
      

    try {

      // delete the template

      // check if the user is logged in
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {

        // if no access token is found then we redirect to the login/signup page
        router.push("/login")
        return
      }

      // decode the token
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken)

      // check if the token is expired
      const currentTime = Date.now() / 1000 // Current time in seconds
      if (decodedToken.exp && decodedToken.exp < currentTime) {

        // if the token is expired then we redirect to the login/signup page
        router.push("/login")
        return
      }

      // delete the template
      const response = await fetch(`/api/template/delete/${templateId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      })

      // check if the response is not ok
      if (!response.ok) {
        throw new Error("Failed to delete template")
      }

      // refetch the templates after deleted
      alert("Template deleted successfully")
      if (userId) {

        // fetch the user templates
        fetchUserTemplates(currentPage, userId)

      }
    } catch (error) {

      // log the error
      console.error("Error deleting template:", error)
      alert("Failed to delete template. Please try again.")
    }
  }

  // filter the templates and we use useMemo to memoize the filtered templates
  const filteredTemplates = useMemo(() => {

    // check if the search query is not empty
    return templates.filter(
      (template) =>

        // for every template, check if the search query is in the title, tags, or explanation
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.explanation.toLowerCase().includes(searchQuery.toLowerCase())

    )
  }, [templates, searchQuery])


  const handleViewAllTemplates = () => {

    // navigate to the templates page
    router.push("/templates")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">My Code Templates</h1>

      {/* view all templates button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleViewAllTemplates}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all cursor-pointer"
        >
          View All Templates
        </button>
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
          <div key={template.id} className="relative">
            <TemplateCard template={template} onClick={() => handleTemplateClick(template.id)} />
            {userId === template.owner.id && (
              <>
                <button
                  onClick={() => handleEditTemplate(template.id)}
                  className="absolute bottom-4 right-28 bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </>
            )}
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
  )
}
