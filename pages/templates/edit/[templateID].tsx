import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Template = {
  id: number;
  title: string;
  explanation: string;
  tags: string;
  code?: {
    id: number;
    code: string;
    language: string;
    input: string;
    output: string;
    error: string;
  };
};

export default function EditTemplate() {
  const router = useRouter();
  const { templateId } = router.query;

  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UseEffect to wait for router and templateId
  useEffect(() => {
    if (!router.isReady) {
      console.log("Router is not ready yet.");
      return;
    }
    if (!templateId) {
      console.log("TemplateId is still undefined.");
      return;
    }

    console.log("Router is ready and Template ID found:", templateId);
    fetchTemplateData(templateId as string);
  }, [router.isReady, templateId]);

  const fetchTemplateData = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      const response = await fetch(`/api/template/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch template data");
      }

      const data = await response.json();
      console.log("Fetched template data:", data);
      setTemplate(data.template); // Use the correct key from the API response

    } catch (error: any) {
      console.error("Error fetching template:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate((prevTemplate) => (prevTemplate ? { ...prevTemplate, [name]: value } : prevTemplate));
  };

  const handleSave = async () => {
    if (!template) {
      console.error("No template data available for saving.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/template/edit/${template.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error("Failed to save the template");
      }

      console.log("Template successfully updated");
      router.push("/templates/myTemplates");

    } catch (error: any) {
      console.error("Error saving template:", error);
      setError("Failed to save the template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render states for Loading, Error, or Form.
  if (isLoading) {
    return <div>Loading template details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!template) {
    return <div>No template data available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Edit Template</h1>

      <form className="max-w-xl mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={template.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Explanation</label>
          <textarea
            name="explanation"
            value={template.explanation}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Tags</label>
          <input
            type="text"
            name="tags"
            value={template.tags}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        {/* Add other fields such as code if applicable */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className={`px-6 py-2 rounded-lg ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
