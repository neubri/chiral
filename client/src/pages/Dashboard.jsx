import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../lib/http";
import Swal from "sweetalert2";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentHighlights, setRecentHighlights] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [stats, setStats] = useState({
    totalHighlights: 0,
    totalNotes: 0,
    articlesRead: 0,
    thisWeekHighlights: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [userResponse, highlightsResponse, notesResponse] =
          await Promise.all([
            api.get("/auth/profile", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/highlights?limit=5", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/notes?limit=5", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setUser(userResponse.data.user);
        setRecentHighlights(highlightsResponse.data.highlights);
        setRecentNotes(notesResponse.data.notes);

        // Calculate stats
        const allHighlights = highlightsResponse.data.highlights;
        const uniqueArticles = new Set(allHighlights.map((h) => h.articleId))
          .size;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const thisWeekHighlights = allHighlights.filter(
          (h) => new Date(h.createdAt) > weekAgo
        ).length;

        setStats({
          totalHighlights: highlightsResponse.data.total || 0,
          totalNotes: notesResponse.data.total || 0,
          articlesRead: uniqueArticles,
          thisWeekHighlights,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load dashboard data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || "Learner"}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's your learning progress and recent activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Highlights
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalHighlights}
                </p>
              </div>
              <div className="text-4xl">🔖</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Learning Notes
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalNotes}
                </p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Articles Read
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.articlesRead}
                </p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.thisWeekHighlights}
                </p>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/articles"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mr-4">📖</div>
              <div>
                <h3 className="font-medium text-gray-900">Browse Articles</h3>
                <p className="text-sm text-gray-600">
                  Find new articles to read and learn
                </p>
              </div>
            </Link>

            <Link
              to="/highlights"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mr-4">🔖</div>
              <div>
                <h3 className="font-medium text-gray-900">My Highlights</h3>
                <p className="text-sm text-gray-600">
                  Review your saved highlights
                </p>
              </div>
            </Link>

            <Link
              to="/notes"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mr-4">📝</div>
              <div>
                <h3 className="font-medium text-gray-900">Learning Notes</h3>
                <p className="text-sm text-gray-600">Access all your notes</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Highlights */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Highlights
              </h2>
              <Link
                to="/highlights"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View all →
              </Link>
            </div>

            {recentHighlights.length > 0 ? (
              <div className="space-y-4">
                {recentHighlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <p className="text-sm text-gray-600 mb-1">
                      From: {highlight.articleTitle || "Untitled Article"}
                    </p>
                    <p className="text-gray-900 mb-2 line-clamp-2">
                      "{highlight.highlightedText}"
                    </p>
                    {highlight.explanation && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        💡 {highlight.explanation}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(highlight.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔖</div>
                <p className="text-gray-600">No highlights yet</p>
                <p className="text-sm text-gray-500">
                  Start reading articles to create highlights
                </p>
              </div>
            )}
          </div>

          {/* Recent Notes */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Notes
              </h2>
              <Link
                to="/notes"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View all →
              </Link>
            </div>

            {recentNotes.length > 0 ? (
              <div className="space-y-4">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border-l-4 border-green-500 pl-4"
                  >
                    <p className="text-gray-900 mb-2 line-clamp-2">
                      "{note.highlightedText}"
                    </p>
                    {note.explanation && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        💡 {note.explanation}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-gray-600">No notes yet</p>
                <p className="text-sm text-gray-500">
                  Create notes from your highlights
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Learning Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Learning Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
            <div>
              <p className="font-medium mb-1">🎯 Active Reading</p>
              <p className="text-sm">
                Highlight key concepts and terms you want to understand better
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🤖 AI Explanations</p>
              <p className="text-sm">
                Use AI to explain complex topics in simple terms
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">📚 Organize Notes</p>
              <p className="text-sm">
                Review and organize your highlights into learning notes
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🔄 Regular Review</p>
              <p className="text-sm">
                Revisit your notes regularly to reinforce learning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
