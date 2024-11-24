import React, { useEffect } from "react";
import FilterSection from "../components/FilterSection";
import { useState } from "react";
import BlogCard from "@/components/BlogCard";
import { useRouter } from "next/router";

// this page should show the blogs.

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
}
  

export default function Blogs() {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [templateTitle, setTemplateTitle] = useState("");
    const [sort, setSort] = useState<string>("most-upvotes");
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const router = useRouter();

    const navigateToBlog = (id: number) => {
        router.push(`/blog/${id}`);
      };

    const getBlogs = async () => {
        try {
            const response = await fetch(`/api/blogs?title=${title}&tags=${tags}&description=${description}&templateTitle=${templateTitle}`, {
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

        } catch(error) {
            console.error("Failed to fetch blogs:", error);
        }
        
    }

    const vote = async(e: React.MouseEvent, id: number, voteType:string) => {
        e.stopPropagation();
        const query = new URLSearchParams({ id: id.toString() }).toString(); // add id as query paramet
        try {
            
            const response = await fetch(`/api/blogs/${id}/rate`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({voteType})},);
                if (response.ok) {
                    setBlogs(prevBlogs => {
                        return prevBlogs.map(blog => {
                            if (blog.id === id) {
                                // Update upvote or downvote based on voteType
                                if (voteType === 'upvote') {
                                    return { ...blog, upvote: blog.upvote + 1 };
                                } else if (voteType === 'downvote') {
                                    return { ...blog, downvote: blog.downvote + 1 };
                                }
                            }
                            return blog;
                        });
                    });
                }
        } catch(error) {
            console.log("voting did not work");
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

    // Function to sort blogs based on the current `sort` state
    const sortBlogs = (blogs: Blog[]): Blog[] => {
        if (sort === "most-upvotes") {
            return blogs.sort((a, b) => b.upvote - a.upvote);
        } else if (sort === "most-downvotes") {
            return blogs.sort((a, b) => b.downvote - a.downvote);
        } else {
            return blogs.sort((a, b) => (b.upvote + b.downvote) - (a.upvote + a.downvote));
        }
        return blogs;
    };

    useEffect(()=>  {
        getBlogs();
    }, [title, description, tags, templateTitle]);
    useEffect(() => {
        // Sort blogs whenever the sort order or blogs change
        setBlogs(prevBlogs => sortBlogs([...prevBlogs]));
    }, [sort, blogs]);
    

    
    return (
        <div className="flex flex-col lg:flex-row">
            {/* Left Side - Filter Section */}
            <div className="lg:w-1/5 w-full bg-gray-100 shadow-xl p-4 lg:h-screen">
                <FilterSection
                    title={title}
                    description={description}
                    tags={tags}
                    templateTitle={templateTitle}
                    handleFilterChange={handleFilterChange}
                    sort={sort}
                    handleSortChange={handleSortChange}
                    
                />
            </div>
            <div className="lg:w-4/5 w-full p-5 bg-white shadow-xl">
                <h1 className="text-3xl font-bold mb-4">Blogs</h1>
                <p>Here are the blog posts sorted by {sort}.</p>
                
                {blogs.length > 0 ? (
                blogs.map((blog) => (
                    <BlogCard
                        onClick={() => navigateToBlog(blog.id)}
                        className=""
                        id={blog.id}
                        key={blog.id}
                        title={blog.title}
                        handleUpvote={(e) => vote(e, blog.id, 'upvote')}
                        handleDownvote={(e) => vote(e, blog.id, 'downvote')}
                        upvoteNum={blog.upvote}
                        downvoteNum={blog.downvote}
                        username={blog.username}
                        tags={blog.tags}
                        templateTitles={blog.templateTitles}/>
                ))
                ) : (
                <p>No blogs found. Try adjusting the filters.</p>
                )}
            </div>
        </div>
 
    );
    

}


