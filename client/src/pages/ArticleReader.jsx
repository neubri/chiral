import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import api from "../lib/http";
import Swal from "sweetalert2";

export default function ArticleReader() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [showExplainPopup, setShowExplainPopup] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Fetch article content
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const [articleResponse, highlightsResponse] = await Promise.all([
          api.get(`/articles/${id}`),
          api
            .get(`/articles/${id}/highlights`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            })
            .catch(() => ({ data: { highlights: [] } })), // Handle if not logged in
        ]);

        setArticle(articleResponse.data.article);
        setHighlights(highlightsResponse.data.highlights || []);
      } catch (error) {
        console.error("Error fetching article:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load article",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]); // Handle text selection
  const handleTextSelection = useCallback(() => {
    // Add small delay to avoid conflicts with button clicks
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text && text.length > 0) {
        setSelectedText(text);

        // Get selection position for popup
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });

        setShowExplainPopup(true);
      } else if (!showExplainPopup) {
        // Only clear if popup is not showing
        setShowExplainPopup(false);
        setSelectedText("");
      }
    }, 100); // Small delay to avoid conflicts
  }, [showExplainPopup]);

  // Add selection listener
  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("keyup", handleTextSelection);

    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("keyup", handleTextSelection);
    };
  }, [handleTextSelection]);

  // Explain selected text
  const explainText = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to use AI explanation feature",
      });
      return;
    }

    try {
      setExplaining(true);

      const highlightResponse = await api.post(
        "/highlights",
        {
          articleId: article.id,
          articleTitle: article.title,
          articleUrl: article.url,
          highlightedText: selectedText,
          context: article.body_markdown?.substring(0, 1000), // Some context
          autoExplain: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newHighlight = highlightResponse.data.highlight;

      setHighlights((prev) => [...prev, newHighlight]);

      // Show explanation in modal
      Swal.fire({
        title: "🤖 AI Explanation",
        html: `
          <div class="text-left">
            <div class="bg-yellow-50 p-3 rounded mb-4">
              <strong>Highlighted Text:</strong><br>
              "${selectedText}"
            </div>
            <div class="bg-blue-50 p-3 rounded">
              <strong>Explanation:</strong><br>
              ${newHighlight.explanation || "Explanation is being generated..."}
            </div>
          </div>
        `,
        confirmButtonText: "Save to Notes",
        showCancelButton: true,
        cancelButtonText: "Close",
        width: "80%",
        heightAuto: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Optionally save as note or mark as bookmarked
          bookmarkHighlight(newHighlight.id);
        }
      });
    } catch (error) {
      console.error("❌ Error explaining text:", error);
      console.error("Error details:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate explanation",
      });
    } finally {
      setExplaining(false);
      setShowExplainPopup(false);
      window.getSelection().removeAllRanges();
    }
  };

  // Bookmark highlight
  const bookmarkHighlight = async (highlightId) => {
    try {
      const token = localStorage.getItem("access_token");
      await api.put(
        `/highlights/${highlightId}`,
        {
          isBookmarked: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHighlights((prev) =>
        prev.map((h) =>
          h.id === highlightId ? { ...h, isBookmarked: true } : h
        )
      );

      Swal.fire({
        icon: "success",
        title: "Bookmarked!",
        text: "Highlight saved to your learning notes",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error bookmarking:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Article not found
          </h2>
          <p className="text-gray-600 mb-4">
            The article you're looking for doesn't exist.
          </p>
          <Link to="/articles" className="text-blue-600 hover:text-blue-800">
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/articles"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to Articles
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {highlights.length} highlights
              </span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View on dev.to ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
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

          {/* Article Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tag_list?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <img
                  src={article.user.profile_image}
                  alt={article.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">{article.user.name}</span>
              </div>
              <span>•</span>
              <span>{formatDate(article.published_at)}</span>
              <span>•</span>
              <span>{article.reading_time_minutes} min read</span>
            </div>
          </div>

          {/* Article Body */}
          <div
            className="p-8 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.body_html }}
          />
        </article>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 How to Highlight & Learn
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>
              1. 🖱️ Select any text in the article that you want to learn about
            </p>
            <p>2. 🤖 Click "Explain" to get AI-powered explanation</p>
            <p>3. 📝 Save important highlights to your learning notes</p>
            <p>4. 🔖 Access your highlights anytime from your dashboard</p>
          </div>
        </div>
      </div>

      {/* Explanation Popup */}
      {showExplainPopup && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              explainText();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            disabled={explaining}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {explaining ? "Explaining..." : "🤖 Explain"}
          </button>
        </div>
      )}
    </div>
  );
}
