import Image from "next/image";
import localFont from "next/font/local";
import {useRouter} from "next/router";
import { useState, useEffect, SetStateAction } from "react";
import BlogDetail from "@/components/BlogDetail";
import { jwtDecode } from "jwt-decode";


type JwtPayload = {
  id: number;
  userName: string;
  email: string;
  role: string;
  exp?: number; // Optional expiration time
};

interface Template {
    id: number;
    title: string;
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
    const [sError, setError] = useState<{ message: string } | null>(null);
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

        if (!accessToken) {
            router.push("/login");
        } else {
          try {

            // decode the token and cast it to the JwtPayload type
            const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken)
            const currentTime = Math.floor(Date.now() / 1000) // current time in seconds
        
            // check if the token is expired
            if (decodedToken.exp && decodedToken.exp < currentTime) {
        
              // if the token is expired thenredirect to login
              console.warn("Token expired. Redirecting to login.")
              router.push("/login")
              return
            }} catch(error) {
              console.log("something went wrong saving.")
            }
        }

        try {

            const editData = await fetch(`/api/blogs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({title: formData.title, description:formData.description, tags:formData.tags, templateIds: selectedTemplates})
            });
            const res = await editData.json();
            if (editData.ok) {
                router.push(`../blog/${res.id}`); // Redirect to the blog details page
            }else {
              setError({ message: res.error });
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
        {sError && <p className="text-red-600 font-semibold bg-red-100 rounded-md mr-2 mt-2 mb-2 p-2">
          {sError.message}
        </p>}
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
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
    );
  };

  export default BlogEdit;