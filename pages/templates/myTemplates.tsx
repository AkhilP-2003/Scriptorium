import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import TemplateCard from "../../components/TemplateCard";
import {jwtDecode} from "jwt-decode";
import Link from "next/link";

// Define the type for the templates
type Template = {
  id: number;
  title: string;
  explanation: string;
  tags: string;
  owner: {
    id: number;
    userName: string;
  };
};

type JwtPayload = {
  id: number;
  userName: string;
  email: string;
  role: string;
  exp?: number; // Optional expiration time
};

export default function MyTemplates() {
  // Default state of templates is just an empty list of templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [totalTemplatesCount, setTotalTemplatesCount] = useState(0); // Total number of templates
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering templates
  const pageSize = 8;
  const router = useRouter();

  // Fetch templates created by the logged-in user
  const fetchUserTemplates = async (page: number, userId: number) => {
    try {
      const response = await fetch(`/api/template?page=${page}&limit=${pageSize}&ownerID=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user templates");
      }

      const data = await response.json();
      setTemplates(data.templates);
      setTotalTemplatesCount(data.totalTemplatesCount);
    } catch (error) {
      console.error("Error fetching user templates:", error);
    }
  };

  // Get the logged-in user's ID and fetch their templates on mount or when `currentPage` changes
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/login");
      return;
    }

    try {
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      fetchUserTemplates(currentPage, decodedToken.id);
    } catch (error) {
      console.error("Failed to decode token:", error);
      router.push("/login");
    }
  }, [currentPage]);

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle next and previous page buttons
  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalTemplatesCount / pageSize)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Navigate to a detailed view of template when template is clicked
  const handleTemplateClick = (templateId: number) => {
    router.push(`/templates/${templateId}`);
  };

  // Use `useMemo` to filter templates based on the search query
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.explanation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">My Code Templates</h1>

      {/* View All Templates Button */}
      <div className="flex justify-end mb-4">
        <Link href="/templates" passHref>
          <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all cursor-pointer">
            View All Templates
          </button>
        </Link>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by title, tags, or explanation"
          className="border p-2 rounded w-1/2"
        />
      </div>

      {/* List of templates */}
      <div id="templates-list" className="grid gap-6 mb-4">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => handleTemplateClick(template.id)}
          />
        ))}
      </div>

      {/* Pagination buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= Math.ceil(totalTemplatesCount / pageSize)}
          className={`px-4 py-2 rounded ${
            currentPage >= Math.ceil(totalTemplatesCount / pageSize)
              ? "bg-gray-300"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
