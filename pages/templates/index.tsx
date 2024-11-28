import React, { useState, useEffect, useMemo } from "react";
import NavigationBar from "../../components/NavigationBar";
import { useRouter } from "next/router";
import TemplateCard from "../../components/TemplateCard";
import {jwtDecode} from "jwt-decode";

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

type JwtPayload = {
  id: number;
  userName: string;
  email: string;
  role: string;
  exp?: number; // Optional expiration time
};


export default function Templates() {

  // default state of templates is just an empty list of templates
  const [templates, setTemplates] = useState<Template[]>([])

  // states for pagination
  const [currentPage, setCurrentPage] = useState(1) // current page number
  const [totalTemplatesCount, setTotalTemplatesCount] = useState(0) // total num of templates
  const pageSize = 8

  // state for search bar nav
  const [searchQuery, setSearchQuery] = useState(""); // search query for filtering templates

  // states for checking if auth user is viewing their owntemplates
  const [isViewingMyTemplates, setIsViewingMyTemplates] = useState(false)


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


  // fetch the list of templates from our api (we wanna do this on mount)
  const fetchTemplates = async (page: number, ownerId?: number, query?: string) => {
    try {

      // check if ownerId is provided
      const ownerQueryParam = ownerId ? `&ownerID=${ownerId}` : ""

      // check if query is provided
      const searchParam = query ? `&search=${query}` : "";


      // fetch the templates
      const response = await fetch(`/api/template?page=${page}&limit=${pageSize}${ownerQueryParam}${searchParam}`)

      // check if the http response is not ok
      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }

      // parse the json data from our response
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


  // we actually fetch the templates when the page loads/changes
  useEffect(() => {

    // check if we are viewing the users templates by checking the state and also check if ownerId is provided
    if (isViewingMyTemplates && router.query.ownerId) {

      // fetch the templates created by the user
      fetchTemplates(currentPage, parseInt(router.query.ownerId as string))
    } else {

      // if we are not viewing the users templates then fetch all the templates  
      fetchTemplates(currentPage)
    }
  }, [currentPage, isViewingMyTemplates])

  // set initial states based on query params in our url
  useEffect(() => {
    const { page, search, ownerId } = router.query

    // check if page is provided
    if (page) {

      // update the current page
      setCurrentPage(parseInt(page as string))

    } else {

      // if page is not provided then set it to 1
      setCurrentPage(1)
    }

    // check if search is provided
    if (search) {

      // update the search query
      setSearchQuery(search as string)
    }

    else {

      // if search is not provided then set it to an empty string
      setSearchQuery("")
    }

    // check if ownerId is provided
    if (ownerId) {

      // fetch the templates created by the user
      fetchTemplates(currentPage, parseInt(ownerId as string))

      // since we are viewing the users templates set the state to true
      setIsViewingMyTemplates(true)

    } else {

      // if ownerId is not provided then fetch all the templates
      fetchTemplates(currentPage)

      // since we are not viewing the users templates set the state to false
      setIsViewingMyTemplates(false)
    }

  }, [router.query])

  // update the query params when the filter changes
  useEffect(() => {
    updateQueryParams()
  }, [currentPage, searchQuery])


  // using the memo hook to compute the filtered templates based on the search query 
  const filteredTemplates = useMemo(() => {

    // we only filter when the search query changes
    return templates.filter((template) => {

      // check if we are viewing the users templates even though user si not logged in
      if (isViewingMyTemplates){

        // return the templates that match the search query
        return (

          template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||  // search by title
          template.tags.toLowerCase().includes(searchQuery.toLowerCase())  ||  // search by tags
          template.explanation.toLowerCase().includes(searchQuery.toLowerCase()) // search by explanation
  
        )
      } else { // if we are not viewing the users templates

        // return the templates that match the search query
        return (

          template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||  // search by title
          template.tags.toLowerCase().includes(searchQuery.toLowerCase())  ||  // search by tags
          template.explanation.toLowerCase().includes(searchQuery.toLowerCase()) // search by explanation
  
        )
      }

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


  // navigate to a detailed view of template when template is clicked
  const handleTemplateClick = (templateId: number) => {

    // navigate to the specific template page according to the id
    router.push(`/templates/${templateId}`)
    return
  }


  // navigate to the create template page
  const handleCreateTemplate = () => {

    const accessToken = localStorage.getItem('accessToken') // check if the user is logged in

    if (!accessToken) {

      // if no access token is found then we redirect to the login/signup page
      router.push('/login')
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

    } catch (error) {

      // if there is an error decoding the token then redirect to the login/signup page
      console.error("Error decoding token:", error)
      router.push("/login")
      return
    }

    // if logged in then we cud navigate to the "Create New Template" page
    router.push(`/templates/new`)
  }

// navigate to the my templates page
const handleMyTemplates = () => {

  // check if the user is logged in
  const accessToken = localStorage.getItem("accessToken")

  // ff the user is not logged in then redirect to the login/signup page
  if (!accessToken) {
    router.push("/login")
    return;
  }

  try {

    // decode the token and cast it to the JwtPayload type
    const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken)
    const currentTime = Math.floor(Date.now() / 1000) // current time in seconds

    // check if the token is expired
    if (decodedToken.exp && decodedToken.exp < currentTime) {

      // if the token is expired thenredirect to login
      console.warn("Token expired. Redirecting to login.")
      router.push("/login")
      return
    }

    // set the state to true since we are viewing the user's templates
    setIsViewingMyTemplates(true)

    // redirect to the templates page with the ownerId as a query parameter
    router.push({
      pathname: "/templates/myTemplates",
      query: {
        page: 1,
        ownerId: decodedToken.id
      }
    })

  } catch (error) {

    // if the token cannot be decoded then redirect to login
    console.error("Failed to decode token:", error)
    router.push("/login")
  }
}


  // navigate to the all templates page
  const handleAllTemplates = () => {

    // set the state to indicate we are no longer viewing just the user's templates
    setIsViewingMyTemplates(false)
    
    // redirect to the templates page without ownerId to view all templates
    router.push({
      pathname: router.pathname,
      query: {
        page: 1
      }
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    // update the search query to the new value
    const newSearchQuery = e.target.value
    setSearchQuery(newSearchQuery)
  
    // update the current view with the search query
    if (isViewingMyTemplates && router.query.ownerId) {

      // fetch templates created by the user
      fetchTemplates(currentPage, parseInt(router.query.ownerId as string), newSearchQuery)
    } else {
      // fetch all templates
      fetchTemplates(currentPage, undefined, newSearchQuery)
    }
  }
  
  


  return (
    <>
      <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center dark:text-white">Code Templates</h1>

        {/* create new template button */}
        <div className="flex justify-end mb-4 mt-4">
        <a
          onClick={handleCreateTemplate}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Create New Template
        </a>

        {/* <button
          onClick={handleAllTemplates}
          className={`ml-4 px-6 py-3 font-semibold rounded-lg transition-all cursor-pointer ${
            isViewingMyTemplates
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-yellow-700 text-white"
          }`}
        >
          All Templates
        </button> */}

        <button
          onClick={handleMyTemplates}
          className={`ml-4 px-6 py-3 font-semibold rounded-lg transition-all cursor-pointer ${
            isViewingMyTemplates
              ? "bg-green-700 text-white"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          My Templates
        </button>

      </div>


        

        {/* search bar */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title, tags, or explanation"
            className="border p-2 rounded w-1/2 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
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
    </>
  )
}
