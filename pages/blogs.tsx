import React from "react";
import FilterSection from "../components/FilterSection";
import { useState } from "react";

// this page should show the blogs.

export default function Blogs() {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [templateTitle, setTemplateTitle] = useState("");
    const [sort, setSort] = useState<string>("most-upvotes");

    const handleFilterChange = (field: string, value: string) => {
        switch (field) {
            case "title":
                setTitle(value);
                break;
            case "description":
                setDescription(value);
                break;
            case "tags":
                setTags(value);
                break;
            case "templateTitle":
                setTemplateTitle(value);
                break;
            default:
                break;
        };
    };

    const handleSortChange = (value: string) => {
        setSort(value);
    };
    
    return (
        <div className="flex flex-col lg:flex-row">
            {/* Left Side - Filter Section */}
            <div className="lg:w-1/5 w-full bg-orange-50 shadow-xl p-4 lg:h-screen">
                <FilterSection
                    title={title}
                    description={description}
                    tags={tags}
                    templateTitle={templateTitle}
                    handleFilterChange={handleFilterChange}
                    sort={sort}
                    handleSortChange={handleSortChange}
                />
            </div>

            {/* Main Content - Blogs List */}
            <div className="lg:w-4/5 w-full p-5 bg-white shadow-xl">
                <h1 className="text-3xl font-bold mb-4">Blogs</h1>
                <p>Here are the blog posts sorted by {sort}.</p>
                {/* Add blog posts here */}
                <div className="p-4 bg-white shadow-md rounded-lg">
                        <h3 className="font-bold text-lg">How to Learn React</h3>
                        <p className="text-gray-600 mt-2">
                            Learn the basics of React, including JSX, components, and hooks.
                        </p>
                        <div className="mt-4 flex justify-between">
                            <span className="text-sm text-gray-500">Category: React</span>
                            <button className="text-orange-500 hover:underline">
                                Read More
                            </button>
                        </div>
                    </div>

            </div>
        </div>
 
    );
    

}