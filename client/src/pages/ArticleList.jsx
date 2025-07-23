import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../lib/http";
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatReadingTime = (minutes) => {
    return `${minutes} min read`;
  };

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
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Cover Image */}
                {article.cover_image && (
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.tag_list?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.description}
                  </p>

                  {/* Author & Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <img
                        src={article.user.profile_image}
                        alt={article.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{article.user.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span>{formatDate(article.published_at)}</span>
                      <span>•</span>
                      <span>
                        {formatReadingTime(article.reading_time_minutes)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/article/${article.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      📖 Read & Highlight
                    </Link>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      title="Open in dev.to"
                    >
                      🔗
                    </a>
                  </div>
                </div>
              </article>
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
