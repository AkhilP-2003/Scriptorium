import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { jwtDecode } from 'jwt-decode';
import { Editor } from '@monaco-editor/react';

// Define the types for the template and blog posts
type Code = {
  id: number;
  code: string;
  language: string;
  input?: string;
  output?: string;
  error?: string;
};

type BlogPost = {
  id: number;
  title: string;
  author: {
    userName: string;
  };
  tags: string;
};

type Template = {
  id: number;
  title: string;
  explanation: string;
  tags: string;
  owner: {
    id: number;
    userName: string;
  };
  code: Code | null;
  parentTemplateId?: number | null;
  parentOwnerName?: string | null;
  blogPosts: BlogPost[]; // Ensure this is an array
};

type JwtPayload = {
  id: number;
  userName: string;
  email: string;
  role: string;
  exp?: number;
};

type TemplateDetailsProps = {
  template: Template | null;
};

export default function TemplateDetails({ template }: TemplateDetailsProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!template) {
    return <div>Template not found</div>;
  }

  const handleForkTemplate = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('No access token found');
      router.push('/login');
      return;
    }

    try {
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.warn('Token expired. Redirecting to login.');
        router.push('/login');
        return;
      }

      if (template?.code) {
        router.push({
          pathname: '/templates/new',
          query: {
            title: `Forked from: ${template.title}`,
            explanation: template.explanation,
            tags: `Forked from ${template.owner.userName}`,
            code: template.code.code,
            language: template.code.language,
            parentTemplateId: template.id,
            ownerName: template.owner.userName,
          },
        });
      } else {
        console.error('No code found for this template');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      router.push('/login');
    }
  };

  const handleRunTemplate = () => {
    if (template?.code) {
      router.push({
        pathname: '/editor',
        query: {
          code: template.code.code,
          language: template.code.language,
        },
      });
    } else {
      console.error('No code found for this template');
    }
  };

  const handleBlogClick = (blogId: number) => {
    router.push(`/blog/${blogId}`);
  };

  return (
    <div className="container mx-auto p-4">
<h1 className="text-3xl font-bold mb-4 dark:text-white">Currently Viewing Code Template: {template.title}</h1>
<p className="text-gray-600 mb-4">Author: {template.owner.userName}</p>
      <div className="border p-4 rounded shadow mb-4">
        <p className="mb-2 text-lg">{template.explanation}</p>
        <p className="text-sm text-gray-600">Tags: {template.tags}</p>
      </div>

      {template.code && (
        <div className="border p-6 rounded shadow mb-6 bg-gray-100 dark:bg-gray-800">
          <h3 className="text-2xl font-semibold mb-4 dark:text-white">Code:</h3>
          <SyntaxHighlighter language={template.code.language} style={oneDark}>
            {template.code.code}
          </SyntaxHighlighter>
          <p className="text-sm text-gray-600 mt-4 dark:text-gray-400">Language: {template.code.language}</p>
        </div>
      )}

      {/* nav buttons*/}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => router.back()}
      >
        Back
      </button>

      <button
        className="mt-4 ml-4 mb-8 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={handleRunTemplate}
      >
        Run
      </button>

      <button
        className="mt-4 ml-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        onClick={handleForkTemplate}
      >
        Fork & Modify
      </button>

      {/* Related Blog Posts Section */}
      {template.blogPosts && Array.isArray(template.blogPosts) && template.blogPosts.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4">Related Blog Posts:</h3>
          <ul className="list-none m-0 p-0">
            {template.blogPosts.map((blog) => (
              <li key={blog.id} className="mb-4">
                {/* Wrapping each blog in a div with hover effects */}
                <div
                  className="border rounded-lg p-4 bg-white shadow-md cursor-pointer hover:shadow-xl hover:bg-slate-200 duration-150"
                  onClick={() => handleBlogClick(blog.id)}
                >
                  <h4 className="text-xl text-blue-500 font-bold">{blog.title}</h4>
                  <p className="text-sm text-gray-600">By: {blog.author.userName}</p>
                  <p className="text-sm text-gray-500">Category: {blog.tags}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No related blog posts available.</p>
      )}


    </div>
  );
}

// fetch the data for the specific template using the id from our url
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  try {
    const response = await fetch(`http://localhost:3000/api/template/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    const data = await response.json();
    console.log('Template Data:', data);  // Add this log to check the response


    return {
      props: {
        template: data.template,
      },
    };
  } catch (error) {
    console.error('Error fetching template details:', error);
    return {
      props: {
        template: null,
      },
    };
  }
};
