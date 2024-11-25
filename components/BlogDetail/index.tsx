import React from 'react';
import NestedComment from './comment';

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
    handleCommentDownvote

  }) => {

    const topLevelComments = comments.filter((comment) => !comment.parentId);
    

    return (
      <div className="p-6 bg-gray-100 shadow-xl rounded-lg max-w-4xl mx-auto">
        {/* Blog Header */}
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
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
          <button onClick={(e) => handleUpvote(e, id, "upvote")} className="text-green-600 hover:font-semibold focus:outline-none">
            👍<span>Upvote: {upvote}</span>
          </button>
          <button onClick={(e) => handleDownvote(e, id,"downvote")} className="text-red-600 hover:font-semibold focus:outline-none">
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

        <div className="mt-8">
        <h2 className="text-2xl font-semibold">Comments</h2>
        
        <div>
        <input placeholder="Add a comment..." className="mt-3 mb-3 rounded text-gray-800 p-3 border border-gray-1 w-full"></input>
        </div>

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