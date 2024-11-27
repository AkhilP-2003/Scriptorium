import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import NestedComment from './comment';

type JwtPayload = {
  id: number;
  userName: string;
  email: string;
  role: string;
  exp?: number;
};

interface Comment {
  parentId: any;
  id: number;
  author: {
    userName: string;
    avatar?: string;
  };
  content: string;
  upvote: number;
  downvote: number;
  createdAt: string;
  replies: Comment[];
}

interface Template {
  id: number;
  title: string;
  explanation: string;
  tags: string;
}

interface BlogDetailProps {
  id: number;
  title: string;
  author: {
    userName: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  description: string;
  upvote: number;
  downvote: number;
  tags: string;
  templates: Template[];
  comments: Comment[];
  handleUpvote: (e: React.MouseEvent, id: number, voteType: string) => void;
  handleDownvote: (e: React.MouseEvent, id: number, voteType: string) => void;
  onTemplateClick: (value: number) => void;
  handleCommentUpvote: (id: number, voteType: string) => void;
  handleCommentDownvote: (id: number, voteType: string) => void;
  deleteButton?: React.ReactNode;
  editButton?: React.ReactNode;
}

const BlogDetail: React.FC<BlogDetailProps> = ({
  id,
  title,
  author,
  description,
  upvote,
  downvote,
  tags,
  templates,
  comments,
  handleUpvote,
  handleDownvote,
  onTemplateClick,
  handleCommentUpvote,
  handleCommentDownvote,
  deleteButton,
  editButton,
}) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAddingComment, setIsAddingComment] = useState(false); // State for toggling comment input
  const [newComment, setNewComment] = useState(''); // State for holding the comment content
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated by verifying the access token
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }

    try {
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      setUserId(decodedToken.id);
      setIsUserAuthenticated(true);
    } catch (error) {
      console.error('Error decoding token:', error);
      router.push('/login');
    }
  }, [router]);

  const handleAddComment = () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
  
    try {
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
  
      // Check if the token is expired
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.warn("Token expired. Redirecting to login.");
        router.push("/login");
        return;
      }
  
      // If the token is valid, toggle the comment input visibility
      setIsAddingComment((prev) => !prev);
  
    } catch (error) {
      console.error("Error decoding token:", error);
      // If there's an error decoding the token, redirect to login
      router.push('/login');
    }
  };
  

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      return; // Don't submit if the comment is empty
    }

    try {
      // Send the new comment to the backend using fetch
      const response = await fetch(`/api/blogs/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Pass the token in the Authorization header
        },
        body: JSON.stringify({
          content: newComment,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Handle the successful comment submission, for example, updating the comments list
      const responseData = await response.json();
      console.log('Comment added successfully:', responseData);

      // Clear the input and hide the comment form
      setNewComment('');
      setIsAddingComment(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const topLevelComments = comments.filter((comment) => !comment.parentId);

  return (
    <div className="p-6 bg-gray-100 shadow-xl rounded-lg max-w-4xl mx-auto">
      {/* Blog Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <div>
          {editButton && (
            <button className="bg-blue-100 mr-3 mt-3 mb-3 font-semibold text-blue-700 p-3 rounded-lg hover:bg-blue-700 hover:text-blue-100">
              {editButton}
            </button>
          )}
          {deleteButton && (
            <button className="bg-red-100 mr-3 mt-3 mb-3 font-semibold text-red-700 p-3 rounded-lg hover:bg-red-700 hover:text-red-100">
              {deleteButton}
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center mt-2 text-sm text-gray-700">
        {author.avatar && (
          <img
            src={author.avatar}
            alt="Author Avatar"
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        <span className="font-semibold">
          Author: {author.firstName} {author.lastName || author.userName}
        </span>
      </div>
      <div className="mt-4 text-gray-600">
        <p>{description}</p>
      </div>

      {/* Tags */}
      <div className="mt-4">
        <span className="text-sm text-gray-500 font-medium">Tags: {tags}</span>
      </div>

      {/* Upvote/Downvote Section */}
      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={(e) => handleUpvote(e, id, 'upvote')}
          className="text-green-600 hover:font-semibold focus:outline-none"
        >
          👍<span>Upvote: {upvote}</span>
        </button>
        <button
          onClick={(e) => handleDownvote(e, id, 'downvote')}
          className="text-red-600 hover:font-semibold focus:outline-none"
        >
          👎<span> Downvote: {downvote} </span>
        </button>
      </div>

      {/* Templates Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Related Templates</h2>
        <ul className="mt-4">
          {templates.map((template) => (
            <li
              key={template.id}
              className="border rounded-lg p-4 mb-4 bg-white shadow-md cursor-pointer hover:shadow-xl hover:bg-slate-200 duration-50"
              onClick={() => onTemplateClick(template.id)}
            >
              <h3 className="font-bold">{template.title}</h3>
              <p className="text-gray-600">{template.explanation}</p>
              <span className="text-sm text-gray-500">Tags: {template.tags}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Comments</h2>

        {/* Add Comment Button */}
        <div>
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Add Comment
          </button>
        </div>

        {/* Comment Input (appears when isAddingComment is true) */}
        {isAddingComment && (
          <div>
            <textarea
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mt-3 mb-3 rounded text-gray-800 p-3 border border-gray-1 w-full"
            />
            <button
              onClick={handleCommentSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Submit Comment
            </button>
          </div>
        )}

        <ul className="mt-4">
          {topLevelComments.map((comment) => (
            <NestedComment
              key={comment.id}
              comment={comment}
              allComments={comments} // Pass all comments here
              handleCommentUpvote={handleCommentUpvote} // Correctly pass the handler
              handleCommentDownvote={handleCommentDownvote} // Correctly pass the handler
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BlogDetail;
