import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import api from "../lib/http";
import Swal from "sweetalert2";
import Markdown from "react-markdown";

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

      // Show explanation in enhanced modal
      Swal.fire({
        title: "🤖 AI-Powered Explanation",
        html: `
          <div class="text-left space-y-4">
            <div class="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-4 rounded-lg">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                </svg>
                <strong class="text-yellow-800">Selected Text:</strong>
              </div>
              <p class="text-yellow-700 italic leading-relaxed">"${selectedText}"</p>
            </div>
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <strong class="text-blue-800">AI Explanation:</strong>
              </div>
              <div class="text-blue-700 leading-relaxed">
                ${
                  newHighlight.explanation ||
                  "🔄 Generating detailed explanation..."
                }
              </div>
            </div>
          </div>
        `,
        confirmButtonText: "💾 Save to Notes",
        showCancelButton: true,
        cancelButtonText: "Close",
        width: "90%",
        maxWidth: "600px",
        heightAuto: false,
        customClass: {
          popup: "rounded-2xl",
          title: "text-xl font-bold text-gray-800",
          confirmButton:
            "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 rounded-lg px-6 py-2 font-medium",
          cancelButton:
            "bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-lg px-6 py-2 font-medium",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
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
        title: "📚 Bookmarked Successfully!",
        html: `
          <div class="text-center">
            <p class="text-gray-600 mb-4">Your highlight has been saved to your learning notes.</p>
            <div class="bg-green-50 border border-green-200 rounded-lg p-3">
              <p class="text-green-700 text-sm">💡 <strong>Tip:</strong> Access all your highlights from the dashboard</p>
            </div>
          </div>
        `,
        timer: 3000,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-2xl",
          title: "text-lg font-bold text-green-800",
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-pulse mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Article
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the content...
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We couldn't find the article you're looking for. It might have been
            removed or the link might be incorrect.
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link
              to="/articles"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
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
                <div className="flex items-center px-3 py-1 bg-blue-50 rounded-full">
                  <svg
                    className="w-4 h-4 text-blue-500 mr-1"
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
                  <span className="text-sm font-medium text-blue-700">
                    {highlights.length} highlights
                  </span>
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
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

              {/* Mobile menu button */}
              <button className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
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
          <article className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Enhanced Cover Image */}
            <div className="flex justify-content-center">
              {article.cover_image && (
                <div className="relative aspect-video bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden">
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-full object-cover "
                  />
                  <div className="absolute inset-0  bg-opacity-20"></div>
                </div>
              )}
            </div>

            {/* Enhanced Article Header */}
            <div className="p-6 sm:p-8 lg:p-10 border-b border-gray-100">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tag_list?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-medium rounded-full hover:from-blue-200 hover:to-indigo-200 transition-all duration-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={article.user.profile_image}
                      alt={article.user.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {article.user.name}
                      </p>
                      <p className="text-gray-600 text-sm">Author</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-gray-600">
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
            <div className="p-6 sm:p-8 lg:p-10 prose">
              <Markdown>{article.body_markdown}</Markdown>
              {/* <div
                className="prose prose-lg prose-blue max-w-none
                         prose-headings:text-gray-900 prose-headings:font-bold
                         prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg
                         prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-gray-900 prose-strong:font-semibold
                         prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                         prose-pre:bg-gray-900 prose-pre:text-gray-100
                         prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-4 prose-blockquote:italic
                         prose-ul:text-gray-700 prose-ol:text-gray-700
                         prose-li:text-gray-700 prose-li:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.body_html }}
              /> */}
            </div>
          </article>

          {/* Enhanced Instructions */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 lg:p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900">
                💡 Interactive Learning Guide
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🖱️</span>
                  <span className="font-semibold">Select Text</span>
                </div>
                <p className="text-sm">
                  Highlight any text in the article that interests you
                </p>
              </div>

              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🤖</span>
                  <span className="font-semibold">Get AI Explanation</span>
                </div>
                <p className="text-sm">
                  Click "Explain" for instant AI-powered insights
                </p>
              </div>

              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">📝</span>
                  <span className="font-semibold">Save Notes</span>
                </div>
                <p className="text-sm">
                  Bookmark important highlights for future reference
                </p>
              </div>

              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🔖</span>
                  <span className="font-semibold">Track Progress</span>
                </div>
                <p className="text-sm">
                  Access your learning journey from the dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Explanation Popup */}
      {showExplainPopup && (
        <div
          className="fixed z-50 bg-white border border-blue-200 rounded-xl shadow-2xl p-4 backdrop-blur-sm bg-white/95"
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
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md"
            >
              {explaining ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                <>🤖 Explain</>
              )}
            </button>

            <button
              onClick={() => {
                setShowExplainPopup(false);
                window.getSelection().removeAllRanges();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
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
