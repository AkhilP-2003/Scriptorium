import React, {ChangeEvent} from "react";

interface InputProps {
    title: string;
    tags: string;
    templateTitles: string;
}

const BlogCard:React.FC<InputProps> = ({templateTitles, title, tags}) => {

    return (

        <div className="p-4 bg-white shadow-md rounded-lg lg:hover:shadow-xl sm:hover:shadow-xl md:hover:shadow-xl">
            <h3 className="font-bold text-lg">{title}</h3>
            <div className="mt-4 flex justify-between">
                <span className="text-sm text-gray-500">Category: {tags}</span>
            </div>
            <div className="mt-4 flex justify-between">
                <span className="text-sm text-gray-500">Related templates: {templateTitles}</span>
                <button className="text-orange-500 hover:underline">
                    Read More
                </button>
            </div>
        </div>

    )
}

export default BlogCard;