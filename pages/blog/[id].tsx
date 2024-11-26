import Image from "next/image";
import localFont from "next/font/local";
import {useRouter} from "next/router";
import { useState, useEffect } from "react";
import BlogDetail from "@/components/BlogDetail";
import { ArrowDownCircleIcon } from "@heroicons/react/20/solid";

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

export default function CurrentBlogPage() {

  const [blog, setBlog] = useState<Blog[]>([]) // Use `null` initially

  const router = useRouter();
  const {id} = router.query; // this is the current blog we are on.

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
      setBlog([currBlog]); // Set the blog data
        
    } catch(error) {
      console.log(error)
    };
  }


  const vote = async(e: React.MouseEvent, id: number, voteType:string) => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken && !accessToken) {
        router.push('/login');
        return;
    }
    if (!accessToken && refreshToken) {
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

    if (!refreshToken && !accessToken) {
        router.push('/login');
        return;
    }
    if (!accessToken && refreshToken) {
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

  return (
    <div>
    {blog.length > 0 ? (
      blog.map((blog) => (
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
      ))
      ) : (
      <p>No blogs found. Try adjusting the filters.</p>
      )}
      </div>
  );
} 
