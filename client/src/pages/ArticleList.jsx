import { useEffect } from "react";
import { useArticles } from "../store/hooks";
import {
  fetchPublicArticles,
  setPublicFilter,
} from "../store/slices/articlesSlice";
import ArticleCard from "../components/ArticleCard";
import { Button } from "../components/Button";
import Swal from "sweetalert2";
import { BookOpen } from "lucide-react";

export default function ArticleList() {
  const {
    publicArticles,
    publicTag,
    publicPerPage,
    publicLoading,
    publicError,
    dispatch,
  } = useArticles();

  const popularTags = [
    "programming",
    "javascript",
    "react",
    "python",
    "webdev",
    "tutorial",
    "beginners",
    "carrer",
    "css",
    "html",
    "typescript",
    "vue",
    "redux",
  ];

  useEffect(() => {
    // Fetch articles when component mounts or when filters change
    dispatch(
      fetchPublicArticles({
        tag: publicTag,
        per_page: publicPerPage,
      })
    );
  }, [dispatch, publicTag, publicPerPage]);

  // Show error notification when there's an error
  useEffect(() => {
    if (publicError) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch articles",
      });
    }
  }, [publicError]);

  const handleTagChange = (tag) => {
    dispatch(setPublicFilter({ tag }));
  };

  const handlePerPageChange = (per_page) => {
    dispatch(setPublicFilter({ per_page: parseInt(per_page) }));
  };

  return (
    <div className="min-h-screen gradient-calm">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card mb-4">
            <BookOpen className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-light text-gray-800 mb-4">
            Discover Articles
          </h1>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Find interesting articles to read and highlight for learning
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tag Filter */}
            <div className="flex-1">
              <label className="block text-sm font-light text-gray-700 mb-3">
                Browse by Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagChange(tag)}
                    className={`px-4 py-2 rounded-xl text-sm font-light smooth-transition ${
                      publicTag === tag
                        ? "gradient-secondary text-white"
                        : "glass-button text-gray-700 hover:text-orange-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Results per page */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
                Articles per page
              </label>
              <select
                value={publicPerPage}
                onChange={(e) => handlePerPageChange(e.target.value)}
                className="glass-card px-3 py-2 rounded-xl text-gray-700 font-light focus:outline-none focus:ring-2 focus:ring-orange-500/50"
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
        {publicLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="glass-card p-8 rounded-3xl flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600 font-light">Loading articles...</p>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!publicLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!publicLoading && publicArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-card mb-4">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-xl font-light text-gray-800 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 font-light">
              Try searching for a different topic
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
