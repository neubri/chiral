import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Trash2,
  Eye,
  Search,
  Calendar,
  BookOpen,
  Bookmark,
  Bot,
} from "lucide-react";
import http from "../lib/http";
import Swal from "sweetalert2";

function Highlights() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const response = await http.get("/highlights");
      setHighlights(response.data.highlights || []);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      Swal.fire("Error", "Failed to fetch highlights", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteHighlight = async (id) => {
    const result = await Swal.fire({
      title: "Delete Highlight?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await http.delete(`/highlights/${id}`);
        setHighlights(highlights.filter((h) => h.id !== id));
        Swal.fire("Deleted!", "Highlight has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting highlight:", error);
        Swal.fire("Error", "Failed to delete highlight", "error");
      }
    }
  };

  const filteredAndSortedHighlights = highlights
    .filter((highlight) => {
      const matchesSearch =
        highlight.highlightedText
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        highlight.explanation
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        highlight.articleTitle
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      if (filterBy === "all") return matchesSearch;
      if (filterBy === "with-explanation")
        return matchesSearch && highlight.explanation;
      if (filterBy === "without-explanation")
        return matchesSearch && !highlight.explanation;

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "article")
        return (a.articleTitle || "").localeCompare(b.articleTitle || "");
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen gradient-calm flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600 font-light">Loading your highlights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-calm pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card mb-4">
            <Bookmark className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-2">
            My Highlights
          </h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Manage and review your saved highlights with AI explanations
          </p>
        </div>

        {/* Controls */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search highlights, explanations, or articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass-button rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 glass-button rounded-xl text-gray-700 font-light focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="article">By Article</option>
            </select>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-3 glass-button rounded-xl text-gray-700 font-light focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
            >
              <option value="all">All Highlights</option>
              <option value="with-explanation">With AI Explanation</option>
              <option value="without-explanation">Without Explanation</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 hover:scale-105 smooth-transition">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-light text-gray-600">
                  Total Highlights
                </p>
                <p className="text-2xl font-light text-gray-800">
                  {highlights.length}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 hover:scale-105 smooth-transition">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-light text-gray-600">
                  With AI Explanation
                </p>
                <p className="text-2xl font-light text-gray-800">
                  {highlights.filter((h) => h.explanation).length}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 hover:scale-105 smooth-transition">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-light text-gray-600">This Month</p>
                <p className="text-2xl font-light text-gray-800">
                  {
                    highlights.filter((h) => {
                      const highlightDate = new Date(h.createdAt);
                      const now = new Date();
                      return (
                        highlightDate.getMonth() === now.getMonth() &&
                        highlightDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights List */}
        {filteredAndSortedHighlights.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-button mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-light text-gray-800 mb-2">
              {searchTerm
                ? "No matching highlights found"
                : "No highlights yet"}
            </h3>
            <p className="text-gray-600 mb-6 font-light">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Start reading articles and highlighting interesting passages!"}
            </p>
            {!searchTerm && (
              <Link
                to="/articles"
                className="inline-flex items-center px-6 py-3 gradient-secondary text-white rounded-xl hover:shadow-lg hover:scale-105 smooth-transition font-light"
              >
                Browse Articles
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedHighlights.map((highlight) => (
              <div
                key={highlight.id}
                className="glass-card rounded-2xl p-6 hover:scale-[1.01] smooth-transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {highlight.articleTitle && (
                      <Link
                        to={`/article/${highlight.articleId}`}
                        className="text-sm font-light text-orange-600 hover:text-orange-700 mb-2 block smooth-transition"
                      >
                        📄 {highlight.articleTitle}
                      </Link>
                    )}
                    <div className="glass-button border-l-4 border-orange-400 p-4 mb-4 rounded-xl">
                      <p className="text-gray-800 italic font-light">
                        "{highlight.highlightedText}"
                      </p>
                    </div>
                    {highlight.explanation && (
                      <div className="glass-button border-l-4 border-blue-400 p-4 rounded-xl">
                        <h4 className="text-sm font-medium text-blue-700 mb-2">
                          <Bot className="w-4 h-4 mr-1 inline" /> AI
                          Explanation:
                        </h4>
                        <p className="text-gray-700 font-light">
                          {highlight.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {highlight.articleId && (
                      <Link
                        to={`/article/${highlight.articleId}`}
                        className="glass-button p-2 rounded-xl text-gray-500 hover:text-orange-600 smooth-transition"
                        title="View Article"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    )}
                    <button
                      onClick={() => deleteHighlight(highlight.id)}
                      className="glass-button p-2 rounded-xl text-gray-500 hover:text-red-600 smooth-transition"
                      title="Delete Highlight"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="font-light">
                    {new Date(highlight.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {highlight.explanation && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-light glass-button text-blue-700">
                      AI Explained
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Highlights;
