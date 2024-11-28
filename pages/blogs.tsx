import React, { useEffect } from "react";
import FilterSection from "../components/FilterSection";
import { useState } from "react";
import BlogCard from "@/components/BlogCard";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import { constants } from "buffer";

type JwtPayload = {
    id: number;
    userName: string;
    email: string;
    role: string;
    exp?: number; // Optional expiration time
  };



interface Blog {
    title: string;
    description: string;
    tags: string;
    templateTitles: string;
    username: string;
    id: number;
    onClick: (value: string) => void;
    upvote: number;
    downvote:number;
    isUserBlog: boolean;
}
  

export default function Blogs() {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [templateTitle, setTemplateTitle] = useState("");
    const [sort, setSort] = useState<string>("most-upvotes");
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(false); // To disable "Next" on the last page
    const pageSize = 10; // Define the number of blogs per page
    const [showMyBlogs, setShowMyBlogs] = useState(false);
    const router = useRouter();


    const navigateToBlog = (id: number) => {
        router.push(`/blog/${id}`);
        return;
    };

    const getBlogs = async (page:number) => {
        try {
            const response = await fetch(`/api/blogs?title=${title}&tags=${tags}&description=${description}&templateTitle=${templateTitle}&page=${page}&limit=${pageSize}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }});
    
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const blogs = await response.json();
            // Process and update state with blogs
            const processedBlogs = blogs.map((blog: { upvote: any, downvote: any, id: any; title: any; author: any; description: any; tags: any; templates: any[]; username: any}) => ({
                id: blog.id,
                title: blog.title,
                description: blog.description,
                tags: blog.tags,
                templateTitles: blog.templates.map(template => template.title).join(", "), // Join template titles into a string
                username: blog.author.userName,
                upvote: blog.upvote,
                downvote: blog.downvote
            }));
    
            setBlogs(processedBlogs); // Update state with the processed blogs
            setCurrentPage(page);
            setIsLastPage(processedBlogs.length < pageSize);

        } catch(error) {
            console.error("Failed to fetch blogs:", error);
        }
        
    }

    const getMyBlogs = async (page: number) => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.warn("User not authenticated. Redirecting to login.");
            setShowMyBlogs(false);
            router.push("/login");
            return;
          }
        
            // Decode token and retrieve user ID
            const decodedToken = jwtDecode<JwtPayload>(accessToken);
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        
            // Check if token is expired
            if (decodedToken.exp && decodedToken.exp < currentTime) {
                console.warn("Token expired. Redirecting to login.");
                setShowMyBlogs(false);
                router.push("/login");
                return;
            }
        
            const userId = decodedToken.id;
        
        try {
            const response = await fetch(`/api/blogs?title=${title}&tags=${tags}&description=${description}&templateTitle=${templateTitle}&page=${page}&limit=${pageSize}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }});
    
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const blogs = await response.json();
            // Process and update state with blogs
            const processedBlogs = blogs.map((blog: { upvote: any, downvote: any, id: any; title: any; author: any; description: any; tags: any; templates: any[]; username: any; }) => ({
                id: blog.id,
                title: blog.title,
                description: blog.description,
                tags: blog.tags,
                templateTitles: blog.templates.map(template => template.title).join(", "), // Join template titles into a string
                username: blog.author.userName,
                isUserBlog: blog.author.id === userId,
                upvote: blog.upvote,
                downvote: blog.downvote
            }));

            const myBlogs = processedBlogs.filter((blog: Blog) => blog.isUserBlog);
            setBlogs(myBlogs);
            setCurrentPage(page);
            setIsLastPage(myBlogs.length < pageSize);

        } catch(error) {
            console.error("Failed to fetch blogs:", error);
        }
    }

    const vote = async(e: React.MouseEvent, id: number, voteType:string) => {
        e.stopPropagation();
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            router.push("/login");
        } else {
          try {

            // decode the token and cast it to the JwtPayload type
            const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken)
            const currentTime = Math.floor(Date.now() / 1000) // current time in seconds
        
            // check if the token is expired
            if (decodedToken.exp && decodedToken.exp < currentTime) {
        
              // if the token is expired thenredirect to login;
              console.warn("Token expired. Redirecting to login.")
              router.push("/login");
              return
            }} catch(error) {
              console.log("something went wrong saving.");
            }
        }
        try {
            const response = await fetch(`/api/blogs/${id}/rate`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({voteType})},);
                if (response.ok) {
                        getBlogs(currentPage);
                    };
                
        } catch(error) {
            console.log("voting did not work");
        }
    }

    const report = async(e: React.MouseEvent, id: number) => {
        e.stopPropagation();

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            router.push("/login");
        } else {
          try {

            // decode the token and cast it to the JwtPayload type
            const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken)
            const currentTime = Math.floor(Date.now() / 1000) // current time in seconds
        
            // check if the token is expired
            if (decodedToken.exp && decodedToken.exp < currentTime) {
        
              // if the token is expired thenredirect to login;
              console.warn("Token expired. Redirecting to login.")
              router.push("/login");
              return
            }} catch(error) {
              console.log("something went wrong saving.");
            }
        }
        try {
           router.push({
            pathname: '/report',
            query: {blogId: id},
           })
        } catch(error) {
            console.log("Error with reporting");
        }

    }

    const handleFilterChange = (field: string, value: string) => {
        switch (field) {
            case "title":
                setTitle(value);
                break;
            case "description":
                setDescription(value);
                break;
            case "tags":
                setTags(value);
                break;
            case "templateTitle":
                setTemplateTitle(value);
                break;
            default:
                break;
        };
    };

    const handleSortChange = (value: string) => {
        setSort(value);
    };

    // Dynamically sort blogs before rendering
    const getSortedBlogs = (): Blog[] => {
        if (sort === "most-upvotes") {
            return [...blogs].sort((a, b) => b.upvote - a.upvote);
        } else if (sort === "most-downvotes") {
            return [...blogs].sort((a, b) => b.downvote - a.downvote);
        } else {
            return [...blogs].sort((a, b) => b.upvote + b.downvote - (a.upvote + a.downvote));
        }
    };

    const handleRegularNextPage = () => {
        if (!isLastPage) {
          getBlogs(currentPage + 1);
        }
      };
      
      const handleRegularPreviousPage = () => {
        if (currentPage > 1) {
            getBlogs(currentPage - 1);
        }
      };

      const handleMyNextPage = () => {
        if (!isLastPage) {
          handleMyBlogs(currentPage + 1);
        }
      };
      
      const handleMyPreviousPage = () => {
        if (currentPage > 1) {
          handleMyBlogs(currentPage - 1);
        }
      };
      
    

    useEffect(()=>  {
        if (showMyBlogs === false) {
            getBlogs(1);
        } else {
          handleMyBlogs(1);
        }
    }, [title, description, tags, templateTitle]);
    
    useEffect(()=>  {
      if (showMyBlogs === false) {
        getBlogs(1);
    } else {
        handleMyBlogs(1);
    }
  }, []);
      
    
    useEffect(() => {
        // Sort blogs whenever the sort order or blogs change
        setBlogs(prevBlogs => getSortedBlogs());
    }, [sort]);
    
    const handleCreateButton = () => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            router.push("/login");
            return;
        } else {
          try {

            // decode the token and cast it to the JwtPayload type
            const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken)
            const currentTime = Math.floor(Date.now() / 1000) // current time in seconds
        
            // check if the token is expired
            if (decodedToken.exp && decodedToken.exp < currentTime) {
        
              // if the token is expired thenredirect to login;
              console.warn("Token expired. Redirecting to login.")
              router.push("/login");
              return
            }} catch(error) {
              console.log("something went wrong creating button.");
            }
        }
        router.push(`/blog/create`);
        return;
    }

    const handleMyBlogs = async (page:number) => {
        const accessToken = localStorage.getItem("accessToken");
      
        if (!accessToken) {
          console.warn("User not authenticated. Redirecting to login.");
          setShowMyBlogs(false);
          router.push("/login");
          return;
        }
      
        try {
          // Decode token and retrieve user ID
          const decodedToken = jwtDecode<JwtPayload>(accessToken);
          const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      
          // Check if token is expired
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            console.warn("Token expired. Redirecting to login.");
            setShowMyBlogs(false);
            router.push("/login");
            return;
          }
      
          const userId = decodedToken.id;
      
          // Fetch blogs created by the user
          const response = await fetch(`/api/blogs?title=${title}&tags=${tags}&description=${description}&templateTitle=${templateTitle}&page=${page}&limit=${pageSize}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const hidden = await fetch(`/api/blogs/view-hidden`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${accessToken}`,
            },
          });
      
          if (!hidden.ok || !response.ok) {
            throw new Error(`Failed to fetch blogs: ${response.statusText}, ${hidden.statusText}`);
          }
      
          const userBlogs = await response.json();
          const userHiddenBlogs = await hidden.json();
          var processedHiddenBlogs: Blog[] = [];

          if (userHiddenBlogs.length > 0) {
            processedHiddenBlogs = userHiddenBlogs.map((blog: { id: number; title: string; description: string; tags: string; templates: any[]; author: any; upvote: number; downvote: number }) => ({
                id: blog.id,
                title: blog.title,
                description: blog.description,
                tags: blog.tags,
                templateTitles: blog.templates.map((template) => template.title).join(", "),
                username: blog.author.userName,
                isUserBlog: blog.author.id === userId,
                upvote: blog.upvote,
                downvote: blog.downvote,
              }));
          }

          const processedBlogs = userBlogs.map((blog: { id: number; title: string; description: string; tags: string; templates: any[]; author: any; upvote: number; downvote: number }) => ({
            id: blog.id,
            title: blog.title,
            description: blog.description,
            tags: blog.tags,
            templateTitles: blog.templates.map((template) => template.title).join(", "),
            username: blog.author.userName,
            isUserBlog: blog.author.id === userId,
            upvote: blog.upvote,
            downvote: blog.downvote,
          }));

          setCurrentPage(page);
          setIsLastPage(processedBlogs.length + processedHiddenBlogs.length < pageSize);
          setShowMyBlogs(true);
          setBlogs(
            [...processedBlogs, ...processedHiddenBlogs].filter(
              (blog: Blog) => blog.isUserBlog
            )
          );
          

        } catch (error) {
          console.error("Error fetching user's blogs:", error);
          setShowMyBlogs(false);
        //   setBlogs([]); // Clear blogs if an error occurs
        }
      };

      const handleShowAllBlogs = async () => {
        getBlogs(1);
        setShowMyBlogs(false);
      }
      const handleMyBlogs2 = async () => {
        handleMyBlogs(1);
      }

    return (
      <div className="flex flex-col lg:flex-row">
          {/* Left Side - Filter Section */}
          <div className="lg:w-1/5 w-full bg-white dark:bg-gray-800 shadow-xl p-4 lg:h-screen">
          <FilterSection
                  className="w-full p-2 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  title={title}
                  description={description}
                  tags={tags}
                  templateTitle={templateTitle}
                  handleFilterChange={handleFilterChange}
                  sort={sort}
                  handleSortChange={handleSortChange}
              />
          </div>
          <div className="lg:w-4/5 w-full p-5 bg-white dark:bg-gray-900 shadow-xl">
              <div className="ml-4 mr-4 mt-4 flex items-center justify-between mb-4">
                  {/* Blog Title */}
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Blogs</h1>
                  <div>
                      {/* Create Blog Button */}
                      <button onClick={() => handleCreateButton()} className="ml-4 px-6 bg-blue-500 text-white py-3 hover:bg-blue-700 font-semibold rounded-lg transition-all cursor-pointer">
                          Create Blog
                      </button>
                      <button
                          onClick={() => handleMyBlogs2()}
                          className={`ml-4 px-6 bg-green-500 text-white py-3 hover:bg-green-700 font-semibold rounded-lg transition-all cursor-pointer`}
                      >My Blogs</button>
                      {/* Show All Blogs Button */}
                      {showMyBlogs && (
                          <button
                          onClick={() => handleShowAllBlogs()}
                          className="ml-4 px-6 bg-gray-500 text-white py-3 hover:bg-gray-700 font-semibold rounded-lg transition-all cursor-pointer"
                          >
                          All Blogs
                          </button>)}
                  </div>
              </div>
              <p className="ml-4 text-gray-700 dark:text-gray-300">Here are the blog posts sorted by {sort}.</p>
              
              {/* Map through blogs */}
              {blogs.length > 0 ? (
                  blogs.map((blog) => (
                      <BlogCard
                          onClick={() => navigateToBlog(blog.id)}
                          className="m-4 p-6 rounded-lg shadow-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200"
                          id={blog.id}
                          key={blog.id}
                          title={blog.title}
                          handleUpvote={(e) => vote(e, blog.id, 'upvote')}
                          handleDownvote={(e) => vote(e, blog.id, 'downvote')}
                          upvoteNum={blog.upvote}
                          downvoteNum={blog.downvote}
                          username={blog.username}
                          tags={blog.tags}
                          handleReport={(e) => report(e, blog.id)}
                          templateTitles={blog.templateTitles}/>
                  ))
              ) : (
                  <p className="mt-4 text-red-600 font-semibold ml-4">No blogs found. Try adjusting the filters.</p>
              )}

              {/* Pagination */}
              {!showMyBlogs && <div className="pagination flex flex-row items-center justify-center">
                  <button className="bg-red-500 p-3 m-3 rounded-md font-semibold text-white hover:bg-red-700"onClick={handleRegularPreviousPage} disabled={currentPage === 1}>
                      Previous
                  </button>
                  <span>Page {currentPage}</span>
                  <button className="bg-red-500 p-3 m-3 rounded-md font-semibold text-white hover:bg-red-700" onClick={handleRegularNextPage} disabled={isLastPage}>
                      Next
                  </button>
              </div>}

              {showMyBlogs && <div className="pagination flex flex-row items-center justify-center">
                  <button className="bg-red-500 p-3 m-3 rounded-md font-semibold text-white hover:bg-red-700" onClick={handleMyPreviousPage} disabled={currentPage === 1}>
                      Previous
                  </button>
                  <span>Page {currentPage}</span>
                  <button className="bg-red-500 p-3 m-3 rounded-md font-semibold text-white hover:bg-red-700" onClick={handleMyNextPage} disabled={isLastPage}>
                      Next
                  </button>
              </div>}
          </div>
      </div>
    );
}


