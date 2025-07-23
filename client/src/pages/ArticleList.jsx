import { useState, useEffect } from "react";
import api from "../lib/http";
import ArticleCard from "../components/ArticleCard";
import { Button } from "../components/Button";
import Swal from "sweetalert2";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTag, setSearchTag] = useState("programming");
  const [perPage, setPerPage] = useState(10);

  const popularTags = [
    "programming",
    "javascript",
    "react",
    "python",
    "web-development",
    "tutorial",
    "beginners",
    "node",
    "css",
    "html",
    "typescript",
    "vue",
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/articles?tag=${searchTag}&per_page=${perPage}`
        );
        setArticles(response.data.articles);
      } catch (error) {
        console.error("Error fetching articles:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch articles",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchTag, perPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Discover Articles
          </h1>
          <p className="text-lg text-gray-600">
            Find interesting articles to read and highlight for learning
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tag Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Browse by Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      searchTag === tag
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Results per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Articles per page
              </label>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600">Try searching for a different topic</p>
          </div>
        )}
      </div>
    </div>
  );
}
