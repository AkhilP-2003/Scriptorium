import Image from "next/image";
import localFont from "next/font/local";
import {useRouter} from "next/router";
import { useState, useEffect } from "react";
import BlogDetail from "@/components/BlogDetail";
import { jwtDecode } from "jwt-decode";

function isTokenExpired(token: string) {
  try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Current time in seconds
      if (decoded.exp) {
        return decoded.exp < currentTime;
      } else {
        console.log("exp is null i think")
      }
  } catch (error) {
      console.error("Invalid token", error);
      return true; // Treat invalid tokens as expired
  }
}


interface Blog {
  id: number;
  description: string; // Define the expected structure of your blog data
  title: string;
  author: any;
  upvote: number;
  downvote:number;
  tags: string;
  templates: [];
  comments: [];
}
interface JwtPayload {
  id: string;
}

export default function CurrentBlogPage() {

  const [blog, setBlog] = useState<Blog| null>(null)

  const router = useRouter();
  const {id} = router.query; // this is the current blog we are on.
  const [isAuthor, setIsAuthor] = useState(false);
  
  useEffect(() => {
    if (blog) {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken) as JwtPayload;
          const userId = decoded.id;
          setIsAuthor(userId === blog.author.id); // Compare user ID with blog author's ID
        } catch (error) {
          console.error("Error decoding token", error);
        }
      }
    }
  }, [blog]);
  
  
  const getBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }});

      if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const currBlog: Blog = await response.json();
      setBlog(currBlog); // Set the blog data
        
    } catch(error) {
      console.log(error)
    };
  }


  const vote = async(e: React.MouseEvent, id: number, voteType:string) => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken || isTokenExpired(refreshToken)) {
        router.push('/login');
        return;
    }
    if (!accessToken || isTokenExpired(accessToken)) {
        // refresh it. 
        const update = await fetch('/api/users/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({refreshToken})
        });
        if (update.ok) {
            const { accessToken: newAccessToken } = await update.json();
            localStorage.setItem("accessToken", newAccessToken);
        } else {
            // If token refresh fails, redirect to login
            router.push('/login');
            return;
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
                    getBlog();
                };
            
    } catch(error) {
        console.log("voting did not work");
    }
  }

  const commentVote = async(blogId:number, id: number, voteAction:string) => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken || isTokenExpired(refreshToken)) {
        router.push('/login');
    }
    if (!accessToken || isTokenExpired(accessToken)) {
        // refresh it. 
        const update = await fetch('/api/users/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({refreshToken})
        });
        if (update.ok) {
            const { accessToken: newAccessToken } = await update.json();
            localStorage.setItem("accessToken", newAccessToken);
        } else {
            // If token refresh fails, redirect to login
            router.push('/login');
            return;
        }
    }
    try {
        
        const response = await fetch(`/api/blogs/${blogId}/comments/${id}/rate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({voteAction})},);
            if (response.ok) {
                    //getOrderedComments;
                    getBlog(); // thisis torefresh the blog comments so they are updated and comments are updated.
    
                };
            
    } catch(error) {
        console.log("voting did not work");
    }
  }

  useEffect(() => {
    if (!id) return; // Wait until the `id` is available
    getBlog();
  }, [id]);

  const handleTemplateClick = (templateId: number) => {
    router.push(`/templates/${templateId}`);
    return;
  };

  const handleDelete = async (blogId: number) => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken || isTokenExpired(refreshToken)) {
        router.push('/login');
        return;
    }
    if (!accessToken || isTokenExpired(accessToken)) {
        // refresh it. 
        const update = await fetch('/api/users/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({refreshToken})
        });
        if (update.ok) {
            const { accessToken: newAccessToken } = await update.json();
            localStorage.setItem("accessToken", newAccessToken);
        } else {
            // If token refresh fails, redirect to login
            router.push('/login');
            return;
        }
    }

    try {
      const deleteResponse = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
      if (deleteResponse.ok) {
        router.push('/blogs');
        return;
      }
    } catch(error) {
      console.log("trouble deleting the blog")
    }
  }

  const handleEdit = (blogId: number) => {
    // handle edit features for author.
    router.push(`edit/${blogId}`);
    return;
  }

  if (blog && isAuthor ===false) {
    return (
      <div>
          <BlogDetail
            id={blog.id}
            title={blog.title}
            description={blog.description}
            upvote={blog.upvote}
            handleUpvote={(e) => vote(e, blog.id, 'upvote')}
            handleDownvote={(e) => vote(e, blog.id, 'downvote')}
            handleCommentUpvote={(commentId) => commentVote(blog.id, commentId, 'upvote')} // For comments
            handleCommentDownvote={(commentId) => commentVote(blog.id, commentId, 'downvote')} // For comments
            onTemplateClick={handleTemplateClick}
            downvote={blog.downvote}
            tags={blog.tags}
            templates={blog.templates}
            comments={blog.comments} 
            author={{
              userName: blog.author.userName,
              avatar: blog.author.avatar
            }}/>
        </div>
    );
          }
  if (blog && isAuthor === true) {
    return (
      <div>
          <BlogDetail
          editButton={
            <button
              onClick={() => handleEdit(blog.id)}
            >
              Edit
            </button>
          }
            deleteButton={
                <button
                  onClick={() => handleDelete(blog.id)}
                >
                  Delete
                </button>
              }
            id={blog.id}
            title={blog.title}
            description={blog.description}
            upvote={blog.upvote}
            handleUpvote={(e) => vote(e, blog.id, 'upvote')}
            handleDownvote={(e) => vote(e, blog.id, 'downvote')}
            handleCommentUpvote={(commentId) => commentVote(blog.id, commentId, 'upvote')} // For comments
            handleCommentDownvote={(commentId) => commentVote(blog.id, commentId, 'downvote')} // For comments
            onTemplateClick={handleTemplateClick}
            downvote={blog.downvote}
            tags={blog.tags}
            templates={blog.templates}
            comments={blog.comments} 
            author={{
              userName: blog.author.userName,
              avatar: blog.author.avatar
            }}/>
        </div>
    );
  }
  
  
} 
