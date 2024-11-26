import Image from "next/image";
import localFont from "next/font/local";
import {useRouter} from "next/router";
import { useState, useEffect, SetStateAction } from "react";
import BlogDetail from "@/components/BlogDetail";
import { jwtDecode } from "jwt-decode";

function isTokenExpired(token: string) {
  try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Current time in seconds
      if (decoded.exp) {
        return decoded.exp < currentTime;
      } else {
        console.log("exp is null i think")
      }
  } catch (error) {
      console.error("Invalid token", error);
      return true; // Treat invalid tokens as expired
  }
}

interface Template {
    id: number;
    title: string;
}

interface JwtPayload {
    id: string;
  }

interface Blog {
    id: number;
    description: string; // Define the expected structure of your blog data
    title: string;
    author: any;
    upvote: number;
    downvote:number;
    tags: string;
    templates: [];
    comments: [];
}
  
const BlogEdit: React.FC = () => {
    
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
    const [removedTemplates, setRemovedTemplates] = useState<number[]>([]);
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      tags: "",
    });

    const getTemplates = async () => {
        try {
            const getTemplates = await fetch(`/api/template`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }});

            if (!getTemplates.ok) {
                throw new Error(`Error: ${getTemplates.status} ${getTemplates.statusText}`);
            }
            const data = await getTemplates.json();
            setTemplates(data.templates); 

        } catch(error) {
            console.log("error getting all templates");
        }
}
  
    useEffect(() => {
      getTemplates();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    const handleTemplateChange = (templateId: number, action: "add" | "remove") => {
      if (action === "add") {
        setSelectedTemplates((prev) => [...prev, templateId]);
        setRemovedTemplates((prev) => prev.filter((id) => id !== templateId));
      } else {
        setRemovedTemplates((prev) => [...prev, templateId]);
        setSelectedTemplates((prev) => prev.filter((id) => id !== templateId));
      }
    };
  
    const handleSubmit = async () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken || isTokenExpired(refreshToken)) {
            router.push('/login');
            return;
        }
        if (!accessToken || isTokenExpired(accessToken)) {
            // refresh it. 
            const update = await fetch('/api/users/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({refreshToken})
            });
            if (update.ok) {
                const { accessToken: newAccessToken } = await update.json();
                localStorage.setItem("accessToken", newAccessToken);
            } else {
                // If token refresh fails, redirect to login
                router.push('/login');
                return;
            }
        }

        try {

            const editData = await fetch(`/api/blogs/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({title: formData.title, description:formData.description, tags:formData.tags, templateIds: selectedTemplates})
            });
            if (editData.ok) {
                const res = await editData.json();
                router.push(`../blog/${res.id}`); // Redirect to the blog details page
            }
        } catch (error) {
            console.error("Failed to update the blog:", error);
        }
    };
    
    return (
      <div className="p-4 max-w-2xl mx-auto bg-gray-50 rounded shadow-xl">
        <h1 className="font-bold text-2xl mb-4">Edit Blog</h1>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold text-lg md:text-lg sm:text-md mb-2" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold text-lg md:text-lg sm:text-md mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2 text-lg md:text-lg sm:text-md" htmlFor="tags">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2 text-lg md:text-lg sm:text-md">Templates</label>
          <ul>
            {templates && templates.map((template: Template) => (
              <li key={template.id} className="flex items-center justify-between">
                <span>{template.title}</span>
                {selectedTemplates.includes(template.id) ? (
                  <button
                    className="bg-red-100 font-semibold text-red-600 p-2 m-1 rounded-md"
                    onClick={() => handleTemplateChange(template.id, "remove")}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    className="bg-green-100 font-semibold text-green-600 p-2 m-1 rounded-md"
                    onClick={() => handleTemplateChange(template.id, "add")}
                  >
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition"
          onClick={handleSubmit}
        >
          Save Changes
        </button>
      </div>
    );
  };

  export default BlogEdit;