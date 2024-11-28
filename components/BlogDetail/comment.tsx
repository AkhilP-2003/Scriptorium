import React, { useState } from 'react';

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
  handleCommentUpvote: (id: number, voteType: string) => void;
  handleCommentDownvote: (id: number, voteType: string) => void;
  handleCommentReport: (id: number) => void
  handleReplySubmit: (parentId: number, content: string) => void; // New handler for submitting a reply
}

const NestedComment: React.FC<NestedCommentProps> = ({
  comment,
  allComments,
  handleCommentUpvote,
  handleCommentDownvote,
  handleCommentReport,
  handleReplySubmit,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  // Filter out child comments for nested replies
  const childComments = allComments.filter((c) => c.parentId === comment.id);

  const handleReplyClick = () => {
    setIsReplying(!isReplying); // Toggle reply form visibility
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyContent(e.target.value); // Update reply content
  };

  const handleReplyFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      handleReplySubmit(comment.id, replyContent); // Pass reply to parent handler
      setReplyContent('');
      setIsReplying(false);
    }
  };

  return (
    <li className="border dark:border-gray-700 rounded-lg p-4 mb-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md">
      <div className="flex justify-between items-center">
        {/* Left side: Avatar and Username */}
        <div className="flex items-center">
          {comment.author?.avatar && (
            <img
              src={comment.author.avatar}
              alt="Author Avatar"
              className="w-6 h-6 rounded-full mr-2"
            />
          )}
          <span className="text-gray-700 dark:text-gray-200 font-semibold">{comment.author?.userName}</span>
          </div>

        {/* Right side: Date */}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Comment Content */}
      <p className="text-gray-800 dark:text-gray-200 mt-1">{comment.content}</p>

      {/* Upvotes/Downvotes */}
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end space-x-4">
        <button onClick={() => handleCommentUpvote(comment.id, 'upvote')} className="!ml-1 text-sm font-semibold">
          👍<span className="!ml-1 mr-2 text-sm text-green-600 font-semibold">{comment.upvote}</span>
        </button>
        <button onClick={() => handleCommentDownvote(comment.id, 'downvote')} className="!ml-1 text-sm font-semibold">
          👎<span className="!ml-1 text-sm text-red-600 font-semibold">{comment.downvote} </span>
        </button>
        <button
            className="text-red-500 hover:font-semibold focus:outline-none transition-colors"
            onClick={() => handleCommentReport(comment.id)} // Report action
            title="Report"
            >
            <div>🚩</div>
            </button>
      </div>

      {/* Reply Button */}
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
      <button onClick={handleReplyClick} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
      Reply
        </button>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <form onSubmit={handleReplyFormSubmit} className="mt-3">
          <textarea
            value={replyContent}
            onChange={handleReplyChange}
            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            placeholder="Write a reply..."
          />
          <button type="submit" className="bg-blue-500 text-white mt-2 px-4 py-2 rounded-md">
            Submit Reply
          </button>
        </form>
      )}

      {/* Render Replies (Recursive Nested Comments) */}
      <ul className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
        {childComments.map((child) => (
          <NestedComment
            key={child.id}
            comment={child}
            allComments={allComments} // Pass all comments here
            handleCommentUpvote={handleCommentUpvote}
            handleCommentDownvote={handleCommentDownvote}
            handleReplySubmit={handleReplySubmit}
            handleCommentReport={handleCommentReport}
          />
        ))}
      </ul>
    </li>
  );
};

export default NestedComment;