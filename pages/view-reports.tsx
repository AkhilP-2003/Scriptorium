import React, { useState, useEffect } from "react";
import Link from "next/link";

const AbuseReportsPage: React.FC = () => {
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAbuseReports = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/report/view_admin?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch abuse reports");
      }

      const data = await response.json();
      setBlogs(data.blogs);
      setComments(data.comments);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbuseReports(page);
  }, [page]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePreviousPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Abuse Reports</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          {/* Blogs with Abuse Reports */}
          <h2 className="text-xl font-bold mt-4">Blogs</h2>
          <ul className="list-disc list-inside">
            {blogs.map((blog: any) => (
              <li key={blog.id} className="mb-2">
                <Link href={`/blog/${blog.id}`} className="text-blue-500 hover:underline">
                  <strong>{blog.title}</strong>
                </Link>
                <p>Abuse Reports: {blog.abuseReports.length}</p>
              </li>
            ))}
          </ul>

          {/* Comments with Abuse Reports */}
          <h2 className="text-xl font-bold mt-4">Comments</h2>
          <ul className="list-disc list-inside">
            {comments.map((comment: any) => (
              <li key={comment.id} className="mb-2">
                <Link
                  href={`/blog/${comment.blogId}#comment-${comment.id}`}
                  className="text-blue-500 hover:underline"
                >
                  <p>{comment.content}</p>
                </Link>
                <p>Abuse Reports: {comment.abuseReports.length}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          className="px-4 py-2 bg-gray-300 rounded"
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={handleNextPage}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AbuseReportsPage;
