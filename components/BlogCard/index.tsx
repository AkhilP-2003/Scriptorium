import React, {ChangeEvent} from "react";
import { ArrowUpIcon,ArrowDownIcon } from "@heroicons/react/16/solid";

interface InputProps {
    title: string;
    tags: string;
    templateTitles: string;
    username: string;
    onClick: (value: number) => void;
    id: number;
    className?: string;
    handleUpvote: (e: React.MouseEvent, id:number, voteType: string) => void;
    handleDownvote: (e: React.MouseEvent, id:number, voteType: string) => void;
    upvoteNum:number;
    downvoteNum:number;
    handleReport: (e: React.MouseEvent, id: number) => void;
}


const BlogCard:React.FC<InputProps> = ({id, onClick, handleUpvote, handleDownvote, handleReport, upvoteNum, downvoteNum, className, templateTitles, title, tags, username}) => {

    return (

    <div
        className={`m-3 p-4 bg-gray-50 dark:bg-gray-700 shadow-lg rounded-xl transition-all cursor-pointer lg:hover:bg-gray-100 md:hover:bg-gray-100 sm:hover:bg-gray-100 lg:hover:shadow-xl sm:hover:shadow-xl md:hover:shadow-xl ${className}`}
        onClick={() => onClick(id)}>
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{title}</h3>
        <div className="flex items-center mt-2 text-sm text-gray-700 dark:text-gray-400">
            <img
                src="https://img.icons8.com/ios-glyphs/30/gray/user--v1.png"
                alt="Author"
                className="w-4 h-4 mr-2"
            />
            {username}
        </div>
        <div className="mt-4 flex flex-col md:flex-row justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-300">Category: {tags}</span>
            <span className="text-sm text-gray-500 dark:text-gray-300">
            Related templates: {templateTitles}
            </span>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
            <button
                className="text-orange-500 hover:font-semibold focus:outline-none transition-colors"
                onClick={(e) => handleUpvote(e, id,"upvote")} title="upvote">
                {/* <ArrowUpIcon className="h-5 w-5" /> */}
                <div>👍 </div>
            </button>
            <span className="!ml-1 text-sm text-green-600 font-semibold">{upvoteNum}</span>
            <button
                className="text-orange-500 hover:font-semibold focus:outline-none transition-colors"
                onClick={(e) => handleDownvote(e, id, "upvote")} title="downvote">
                <div>👎</div>
            </button>
            <span className="!ml-1 text-sm text-red-600 font-semibold">{downvoteNum}</span>
            {/* Flag icon for reporting */}
            <button
            className="text-red-500 hover:font-semibold focus:outline-none transition-colors"
            onClick={(e) => handleReport(e, id)} // Report action
            title="Report"
            >
            <div>🚩</div>
            </button>
        </div>
    </div>


    )
}

export default BlogCard;
