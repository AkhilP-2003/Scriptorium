import Image from "next/image";
import localFont from "next/font/local";
import {useRouter} from "next/router";
import { useState, useEffect } from "react";
import BlogDetail from "@/components/BlogDetail";
import { jwtDecode } from "jwt-decode";

interface Blog {
  id: number;
  description: string; // Define the expected structure of your blog data
  title: string;
  author: any;
  upvote: number;
  downvote:number;
  tags: string;
  hidden: boolean;
  templates: [];
  comments: [];
}
type JwtPayload = {
  id: number;
  userName: string;
  email: string;
  role: string;
  exp?: number; // Optional expiration time
};

const isTokenExpired = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token); // Decode token
    return Date.now() >= exp * 1000; // Check if current time is past expiry
  } catch (error) {
    return true; // If token can't be decoded, consider it expired
  }
};


export default function CurrentBlogPage() {

  const [blog, setBlog] = useState<Blog| null>(null)

  const router = useRouter();
  const {id} = router.query; // this is the current blog we are on.
  const [isAuthor, setIsAuthor] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  
  useEffect(() => {
    if (blog) {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken) as JwtPayload;
          const userId = decoded.id;
          const userRole = decoded.role;
          setAdmin(userRole === 'ADMIN');
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

    if (!accessToken) {
      router.push("/login");
    } else {
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
        }} catch(error) {
          console.log("something went wrong saving.")
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

const reportComment = async(commentId: number) => {

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('accessToken');

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
      query: {commentId: commentId},
     })
  } catch(error) {
      console.log("Error with reporting");
  }

}
  const commentVote = async(blogId:number, id: number, voteAction:string) => {
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
    
          // if the token is expired thenredirect to login
          console.warn("Token expired. Redirecting to login.")
          router.push("/login")
          return
        }} catch(error) {
          console.log("something went wrong saving.")
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
    if (isAuthor === false) {
      alert("You do not have permission to delete this blog");
      router.push('/blogs');
      return;
    }
    if (!accessToken) {
      router.push("/login");
    } else {
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
        }} catch(error) {
          console.log("something went wrong saving.")
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
    if (isAuthor === false || blog?.hidden) {
      alert("You do not have permission to edit this blog");
      router.push('/blogs');
      return;
    }
    router.push(`edit/${blogId}`);
    return;
  }

  const handleAdminHide = async (blogId: number) => {
    const accessToken = localStorage.getItem("accessToken");
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
    
          // if the token is expired thenredirect to login
          console.warn("Token expired. Redirecting to login.")
          router.push("/login")
          return
        }} catch(error) {
          console.log("something went wrong saving.")
        }
    }
  try {
    const response = await fetch(`/api/blogs/${blogId}/hide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      alert("Blog post hidden successfully.");
      router.push('/blogs');
      // Optionally, update your local state to reflect the hidden blog
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error("Error hiding blog post:", error);
    alert("Something went wrong. Please try again.");
  }
}


  if (blog && isAuthor ===false) {
    return (
      <div>
          <BlogDetail
          adminButton={isAdmin ? (
            <button onClick={() => handleAdminHide(blog.id)}>
              Hide
            </button>
          ) : null} 
            id={blog.id}
            title={blog.title}
            description={blog.description}
            upvote={blog.upvote}
            handleUpvote={(e) => vote(e, blog.id, 'upvote')}
            handleDownvote={(e) => vote(e, blog.id, 'downvote')}
            handleCommentUpvote={(commentId) => commentVote(blog.id, commentId, 'upvote')} // For comments
            handleCommentDownvote={(commentId) => commentVote(blog.id, commentId, 'downvote')} // For comments
            handleCommentReport={(commentId) => reportComment(commentId)}
            handleReport={(e) => report(e, blog.id)}
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
          adminButton={isAdmin ? (
            <button onClick={() => handleAdminHide(blog.id)}>
              Hide
            </button>
          ) : null} 
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
            handleReport={(e)=> report(e, blog.id)}
            handleCommentUpvote={(commentId) => commentVote(blog.id, commentId, 'upvote')} // For comments
            handleCommentDownvote={(commentId) => commentVote(blog.id, commentId, 'downvote')} // For comments
            handleCommentReport={(commentId) => reportComment(commentId)}
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
  
