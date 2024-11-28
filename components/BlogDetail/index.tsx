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
    id:number
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
    handleUpvote:(e: React.MouseEvent, id:number, voteType: string) => void;
    handleDownvote: (e: React.MouseEvent, id:number, voteType: string) => void;
    onTemplateClick: (value: number) => void;
    handleCommentUpvote:(id:number, voteType: string) => void;
    handleCommentDownvote: (id:number, voteType: string) => void;
    handleCommentReport: (id: number) => void;
    handleReport: (e: React.MouseEvent, id: number) => void;
    deleteButton?: React.ReactNode;
    editButton?: React.ReactNode;
    adminButton: React.ReactNode;
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
  handleReport,
  handleCommentReport,
  onTemplateClick,
  handleCommentUpvote,
  handleCommentDownvote,
  deleteButton,
  editButton,
  adminButton
}) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAddingComment, setIsAddingComment] = useState(false); // State for toggling comment input
  const [newComment, setNewComment] = useState(''); // State for holding the comment content
  const [commentsState, setCommentsState] = useState<Comment[]>(comments); // Track comments in state
  const router = useRouter();

  const handleAddComment = () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      router.push('/login');
      return;
    }
  
    try {
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
  
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.warn("Token expired. Redirecting to login.");
        router.push("/login");
        return;
      }
  
      setIsAddingComment((prev) => !prev);
  
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push('/login');
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          content: newComment,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const responseData = await response.json();

      setCommentsState((prevComments) => [
        ...prevComments,
        responseData.newComment, // Assuming the backend returns the newly created comment
      ]);

      setNewComment('');
      setIsAddingComment(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (parentId: number, content: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/login");
    } else {
      try {
        // decode the token and cast it to the JwtPayload type
        const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken);
        const currentTime = Math.floor(Date.now() / 1000); // current time in seconds

        // check if the token is expired
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          console.warn("Token expired. Redirecting to login.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.log("something went wrong saving.");
      }
    }
    
    try {
      const response = await fetch(`/api/blogs/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          content: content,
          parentId: parentId, // Send parentId to create a reply
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }
      
  
      const responseData = await response.json();

      const newCommentWithAuthor = {
        ...responseData.newComment,
        author: {
          userName: responseData.newComment.author?.userName || 'here is your comment/reply!', 
          avatar: responseData.newComment.author?.avatar
        }
      };

      setCommentsState((prevComments) => [
        ...prevComments,
        responseData.newComment, // Add the new comment (reply) to the state
      ]);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };
  

  const topLevelComments = commentsState.filter((comment) => !comment.parentId);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 shadow-xl rounded-lg max-w-4xl mx-auto">
      {/* Blog Header */}
      <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
      <div>
          {editButton && (
            <button className="bg-blue-100 dark:bg-blue-800 mr-3 mt-3 mb-3 font-semibold text-blue-700 dark:text-blue-200 p-3 rounded-lg hover:bg-blue-700 hover:text-blue-100 dark:hover:bg-blue-600">
              {editButton}
            </button>
          )}
          {deleteButton && (
            <button className="bg-red-100 dark:bg-red-800 mr-3 mt-3 mb-3 font-semibold text-red-700 dark:text-red-200 p-3 rounded-lg hover:bg-red-700 hover:text-red-100 dark:hover:bg-red-600">
              {deleteButton}
            </button>
          )}
          {adminButton && (
            <button className="bg-green-100 mr-3 mt-3 mb-3 font-semibold text-green-700 p-3 rounded-lg hover:bg-green-700 hover:text-green-100">
              {adminButton}
            </button>
          )}
        </div>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-700 dark:text-gray-300">
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
        <div className="mt-4 text-gray-600 dark:text-gray-300">
        <p>{description}</p>
        </div>
  
        {/* Tags */}
        <div className="mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tags: {tags}</span>
        </div>
  
        {/* Upvote/Downvote Section */}
        <div className="mt-4 flex items-center space-x-4">
          <button onClick={(e) => handleUpvote(e, id, "upvote")} className="text-green-600 hover:font-semibold focus:outline-none">
            👍<span>Upvote: {upvote}</span>
          </button>
          <button onClick={(e) => handleDownvote(e, id,"downvote")} className="text-red-600 hover:font-semibold focus:outline-none">
            👎<span> Downvote: {downvote} </span>
          </button>
          <button
            className="text-red-500 hover:font-semibold focus:outline-none transition-colors"
            onClick={(e) => handleReport(e, id)} // Report action
            title="Report"
            >
            <div>🚩</div>
            </button>
        </div>
  
        {/* Templates Section */}
        <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Related Templates</h2>
          <ul className="mt-4">
            {templates.map((template) => (
              <li
                key={template.id}
                className="border dark:border-gray-600 rounded-lg p-4 mb-4 bg-white dark:bg-gray-700 shadow-md cursor-pointer hover:shadow-xl hover:bg-slate-200 dark:hover:bg-gray-600 duration-50"
                onClick={() => onTemplateClick(template.id)}
              >
              <h3 className="font-bold text-gray-800 dark:text-gray-100">{template.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{template.explanation}</p>
              <span className="text-sm text-gray-500 dark:text-gray-400">Tags: {template.tags}</span>
              </li>
            ))}
          </ul>
        </div>

      {/* Comments Section */}
      <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Comments</h2>

        {/* Add Comment Button */}
        <div>
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Add Comment
          </button>
        </div>

        {/* Comment Input */}
        {isAddingComment && (
          <div>
            <textarea
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mt-3 mb-3 rounded text-gray-800 dark:text-gray-100 p-3 border border-gray-300 dark:border-gray-600 w-full bg-white dark:bg-gray-700"
            />
            <button
              onClick={handleCommentSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Submit Comment
            </button>
          </div>
        )}

        <ul className="mt-4 dark:text-gray-100">
          {topLevelComments.map((comment) => (
            <NestedComment
              key={comment.id}
              comment={comment}
              allComments={commentsState}
              handleCommentUpvote={handleCommentUpvote}
              handleCommentDownvote={handleCommentDownvote}
              handleCommentReport={handleCommentReport}
              handleReplySubmit={handleReplySubmit} // Pass handleReplySubmit here
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BlogDetail;
