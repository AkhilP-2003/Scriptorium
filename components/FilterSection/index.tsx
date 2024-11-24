import React, { useState } from "react";

interface Filters {
    title: string;
    description: string;
    tags: string;
    templateTitle: string;
    handleFilterChange: (field: string, value: string) => void;
    sort: string;
    handleSortChange: (value: string) => void;
    className?: string;
}

const FilterSection: React.FC<Filters> = ({ title, description, tags, templateTitle, handleFilterChange, sort, handleSortChange, className }) => {
    return (
            <div className="flex flex-col gap-4 w-full">
                {/* Filter by Title */}
                <input
                    type="text"
                    placeholder="Filter by Blogs"
                    value={title || ""}
                    onChange={(e) => handleFilterChange("title", e.target.value)}
                    className={`p-2 border border-gray-300 rounded-lg ${className}`}
                />
                {/* Filter by Description */}
                <input
                    type="text"
                    placeholder="Filter by Description"
                    value={description || ""}
                    onChange={(e) => handleFilterChange("description", e.target.value)}
                    className={`p-2 border border-gray-300 rounded-lg ${className}`}
                />
                {/* Filter by Tags */}
                <input
                    type="text"
                    placeholder="Filter by Tags"
                    value={tags || ""}
                    onChange={(e) => handleFilterChange("tags", e.target.value)}
                    className={`p-2 border border-gray-300 rounded-lg ${className}`}
                />
                {/* Filter by Templates */}
                <input
                    type="text"
                    placeholder="Filter by Templates"
                    value={templateTitle || ""}
                    onChange={(e) => handleFilterChange("templateTitle", e.target.value)}
                    className={`p-2 border border-gray-300 rounded-lg ${className}`}
                />
                {/* Sort Dropdown */}
            <select
                value={sort || ""}
                onChange={(e) => handleSortChange(e.target.value)}
                className={`p-3 border border-gray-300 rounded-lg w-full lg:w-auto ${className}`}
            >
                <option value="most-upvotes">Sort by: Most Upvotes</option>
                <option value="most-downvotes">Sort by: Most Downvotes</option>
                <option value="recent">Sort by: Most Controversial</option>
            </select>
            </div>
    );
};

export default FilterSection;
