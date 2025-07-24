import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import api from "../lib/http";
import Swal from "sweetalert2";
import Markdown from "react-markdown";
import { Lightbulb, Bot, BookOpen, RotateCcw, Target } from "lucide-react";

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

      // Show explanation in enhanced modal with calm, minimalist design
      Swal.fire({
        title: "",
        html: `
          <div class="space-y-4">
            <!-- Header with clean design -->
            <div class="text-center mb-6">
              <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-light text-gray-800 mb-1">AI Explanation</h3>
              <p class="text-sm text-gray-500 font-light">Generated for your selected text</p>
            </div>

            <!-- Selected Text Card -->
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div class="flex items-center mb-2">
                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Selected Text</span>
              </div>
              <p class="text-gray-800 font-light leading-relaxed">"${selectedText}"</p>
            </div>

            <!-- AI Explanation Card -->
            <div class="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <div class="flex items-center mb-2">
                <svg class="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span class="text-xs font-medium text-orange-600 uppercase tracking-wide">AI Explanation</span>
              </div>
              <div class="text-gray-800 font-light leading-relaxed">
                ${
                  newHighlight.explanation ||
                  "Generating detailed explanation..."
                }
              </div>
            </div>
          </div>
        `,
        confirmButtonText: "Save to Notes",
        showCancelButton: true,
        cancelButtonText: "Close",
        width: "90%",
        maxWidth: "600px",
        background: "#ffffff",
        backdrop: "rgba(0, 0, 0, 0.3)",
        customClass: {
          popup: "rounded-2xl shadow-xl border-0",
          confirmButton:
            "bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-xl px-6 py-2 font-light smooth-transition",
          cancelButton:
            "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl px-6 py-2 font-light smooth-transition mr-3",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          bookmarkHighlight(newHighlight.id);
        }
      });
    } catch (error) {
      console.error("Error explaining text:", error);
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

      // Clean success message with minimalist design
      Swal.fire({
        title: "",
        html: `
          <div class="text-center space-y-4">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-light text-gray-800 mb-1">Saved Successfully!</h3>
              <p class="text-sm text-gray-500 font-light">Your highlight has been bookmarked and saved to your learning notes.</p>
            </div>
          </div>
        `,
        timer: 3000,
        showConfirmButton: false,
        background: "#ffffff",
        backdrop: "rgba(0, 0, 0, 0.3)",
        customClass: {
          popup: "rounded-2xl shadow-lg border-0",
        },
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
      <div className="min-h-screen gradient-calm flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-orange-400 animate-pulse mx-auto"></div>
          </div>
          <h2 className="text-xl font-light text-gray-800 mb-2">
            Loading Article
          </h2>
          <p className="text-gray-600 font-light">
            Please wait while we fetch the content...
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-gray-800 mb-3">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed font-light">
            We couldn't find the article you're looking for. It might have been
            removed or the link might be incorrect.
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center px-6 py-3 gradient-secondary text-white font-light rounded-xl hover:shadow-lg hover:scale-105 smooth-transition"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-calm">
      {/* Enhanced Header */}
      <div className="glass border-0 border-b border-white/20 sticky top-0 z-40 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link
              to="/articles"
              className="inline-flex items-center px-4 py-2 text-sm font-light text-orange-600 hover:text-orange-800 glass-button rounded-xl smooth-transition"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Articles
            </Link>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center px-4 py-2 glass-card rounded-full">
                  <svg
                    className="w-4 h-4 text-orange-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                  <span className="text-sm font-light text-orange-700">
                    {highlights.length} highlights
                  </span>
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 text-sm font-light text-gray-600 hover:text-orange-600 glass-button rounded-xl smooth-transition"
                >
                  View Original
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

              {/* Mobile menu button */}
              <button className="sm:hidden glass-button p-3 text-gray-600 hover:text-gray-900 rounded-xl smooth-transition">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Article Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <article
            className="glass-card rounded-3xl overflow-hidden shadow-xl"
            style={{
              backdropFilter: "blur(20px)",
              background: "rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Enhanced Cover Image - PROPERLY CENTERED */}
            {article.cover_image && (
              <div className="relative aspect-video bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden flex items-center justify-center">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 bg-opacity-20"></div>
              </div>
            )}

            {/* Enhanced Article Header */}
            <div className="p-6 sm:p-8 lg:p-10 border-b border-white/20">
              {/* Tags */}
              <div className="flex flex-wrap gap-3 mb-6">
                {article.tag_list?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-4 py-2 glass-button gradient-secondary text-white text-sm font-light rounded-xl smooth-transition hover:scale-105"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-800 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={article.user.profile_image}
                      alt={article.user.name}
                      className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg"
                    />
                    <div>
                      <p className="font-light text-gray-800 text-lg">
                        {article.user.name}
                      </p>
                      <p className="text-gray-600 text-sm font-light">Author</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-gray-600 font-light">
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      {formatDate(article.published_at)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      {article.reading_time_minutes} min read
                    </span>
                  </div>
                </div>

                {/* Mobile stats */}
                <div className="sm:hidden mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <span>{highlights.length} highlights</span>
                  <span>•</span>
                  <span>{article.reading_time_minutes} min</span>
                </div>

                {/* Mobile actions */}
                <div className="sm:hidden mt-4 flex space-x-2">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    View Original
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Enhanced Article Body */}
            <div className="p-6 sm:p-8 lg:p-10 prose max-w-none">
              <Markdown
                components={{
                  img: ({ alt, src, title, ...props }) => (
                    <img
                      src={src}
                      alt={alt}
                      title={title}
                      className="rounded-lg max-w-full h-auto mx-auto block my-4"
                      {...props}
                    />
                  ),
                }}
              >
                {article.body_markdown}
              </Markdown>
            </div>
          </article>

          {/* Enhanced Instructions */}
          {/* Learning Tips */}
          <div className="mt-8 glass-card rounded-2xl p-6 border-l-4 border-orange-500">
            <h3 className="text-lg font-light text-gray-800 mb-4">
              <Lightbulb className="w-4 h-4 mr-1 inline" /> Learning Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div className="glass-button p-4 rounded-xl">
                <p className="font-medium mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Active Reading
                </p>
                <p className="text-sm font-light">
                  Highlight key concepts and terms you want to understand better
                </p>
              </div>
              <div className="glass-button p-4 rounded-xl">
                <p className="font-medium mb-1 flex items-center gap-2">
                  <Bot className="w-4 h-4" /> AI Explanations
                </p>
                <p className="text-sm font-light">
                  Use AI to explain complex topics in simple terms
                </p>
              </div>
              <div className="glass-button p-4 rounded-xl">
                <p className="font-medium mb-1 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Organize Notes
                </p>
                <p className="text-sm font-light">
                  Review and organize your highlights into learning notes
                </p>
              </div>
              <div className="glass-button p-4 rounded-xl">
                <p className="font-medium mb-1 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Regular Review
                </p>
                <p className="text-sm font-light">
                  Revisit your notes regularly to reinforce learning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Explanation Popup */}
      {showExplainPopup && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 backdrop-blur-sm"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="flex items-center space-x-2">
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
              className="inline-flex items-center px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-light smooth-transition"
            >
              {explaining ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Explaining...
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 mr-1" /> Explain
                </>
              )}
            </button>

            <button
              onClick={() => {
                setShowExplainPopup(false);
                window.getSelection().removeAllRanges();
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
