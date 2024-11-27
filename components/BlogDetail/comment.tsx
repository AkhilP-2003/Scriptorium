import React from 'react';

interface CommentProps {
  id: number;
  parentId?: number | null;
  author: {
    userName: string;
    avatar?: string;
  };
  content: string;
  upvote: number;
  downvote: number;
  createdAt: string;
  replies?: CommentProps[];
}

interface NestedCommentProps {
  comment: CommentProps;
  allComments: CommentProps[]; // Pass all comments to find replies
  handleCommentUpvote:(id:number, voteType: string) => void;
  handleCommentDownvote: (id:number, voteType: string) => void;
}

const NestedComment: React.FC<NestedCommentProps> = ({ comment, allComments, handleCommentDownvote, handleCommentUpvote }) => {
  const childComments = allComments.filter((c) => c.parentId === comment.id);

  return (
    <li className="border rounded-lg p-4 mb-3 bg-white shadow-sm hover:shadow-md" >
        <div className="flex justify-between items-center ">
        {/* Left side: Avatar and Username */}
        <div className="flex items-center">
        {comment.author?.avatar && (
            <img
            src={comment.author.avatar}
            alt="Author Avatar"
            className="w-6 h-6 rounded-full mr-2"
            />
        )}
        <span className="text-gray-700 font-semibold">{comment.author?.userName}</span>
        </div>

        {/* Right side: Date */}
        <span className="text-sm text-gray-500">
        {new Date(comment.createdAt).toLocaleString()}
        </span>
    </div>

      {/* Comment Content */}
      <p className="text-gray-800 mt-1">{comment.content}</p>

      {/* Upvotes/Downvotes */}
      <div className="mt-1 text-sm text-gray-500 flex items-center justify-end space-x-4">

      <button onClick={() => handleCommentUpvote(comment.id, "upvote")} className="!ml-1 text-sm font-semibold">
            👍<span className="!ml-1 mr-2 text-sm text-green-600 font-semibold">{comment.upvote}</span>
          </button>
          <button onClick={() => handleCommentDownvote(comment.id,"downvote")} className="!ml-1 text-sm font-semibold">
            👎<span className="!ml-1 text-sm text-red-600 font-semibold">{comment.downvote} </span>
          </button>

      </div>

      {/* Render Replies */}
      <ul className="mt-4 pl-6 border-l-2 border-gray-200 hover:shadow-md">
          {childComments.map((child) => (
            <NestedComment
              key={child.id}
              comment={child}
              allComments={allComments}
              handleCommentUpvote={handleCommentUpvote} // Pass the handler recursively
              handleCommentDownvote={handleCommentDownvote} // Pass the handler recursively
            />
          ))}
        </ul>
    </li>
  );
};

export default NestedComment;
