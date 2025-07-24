import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../lib/http";
import Swal from "sweetalert2";
import {
  Bookmark,
  FileText,
  BookOpen,
  TrendingUp,
  Brain,
  Plus,
  Lightbulb,
  Bot,
} from "lucide-react";

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
        const token = localStorage.getItem("access_token");
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
      <div className="min-h-screen gradient-calm flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600 font-light">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-calm">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl md:text-4xl font-light text-gray-800">
              Learning Dashboard
            </h1>
          </div>
          <p className="text-gray-600 font-light">
            Track your learning progress and manage your highlights and notes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl hover:scale-105 smooth-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 mb-1">
                  Total Highlights
                </p>
                <p className="text-3xl font-light text-gray-800">
                  {stats.totalHighlights}
                </p>
              </div>
              <div className="opacity-70">
                <Bookmark className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:scale-105 smooth-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 mb-1">
                  Learning Notes
                </p>
                <p className="text-3xl font-light text-gray-800">
                  {stats.totalNotes}
                </p>
              </div>
              <div className="opacity-70">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:scale-105 smooth-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 mb-1">
                  Articles Read
                </p>
                <p className="text-3xl font-light text-gray-800">
                  {stats.articlesRead}
                </p>
              </div>
              <div className="opacity-70">
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:scale-105 smooth-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 mb-1">
                  This Week
                </p>
                <p className="text-3xl font-light text-gray-800">
                  {stats.thisWeekHighlights}
                </p>
              </div>
              <div className="opacity-70">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Highlights */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-gray-800">
                Recent Highlights
              </h2>
              <Link
                to="/highlights"
                className="text-orange-600 hover:text-orange-700 text-sm font-light smooth-transition"
              >
                View all →
              </Link>
            </div>

            {recentHighlights.length > 0 ? (
              <div className="space-y-4">
                {recentHighlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="glass-button p-4 rounded-xl border-l-4 border-orange-500"
                  >
                    <p className="text-sm text-gray-600 mb-1 font-light">
                      From: {highlight.articleTitle || "Untitled Article"}
                    </p>
                    <p className="text-gray-800 mb-2 line-clamp-2 font-light">
                      "{highlight.highlightedText}"
                    </p>
                    {highlight.explanation && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2 font-light">
                        <Lightbulb className="w-4 h-4 mr-1 inline" />{" "}
                        {highlight.explanation}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-light">
                      {formatDate(highlight.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-button mb-4">
                  <Bookmark className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-gray-600 font-light mb-1">
                  No highlights yet
                </p>
                <p className="text-sm text-gray-500 font-light">
                  Start reading articles to create highlights
                </p>
              </div>
            )}
          </div>

          {/* Recent Notes */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-gray-800">Recent Notes</h2>
              <Link
                to="/notes"
                className="text-orange-600 hover:text-orange-700 text-sm font-light smooth-transition"
              >
                View all →
              </Link>
            </div>

            {recentNotes.length > 0 ? (
              <div className="space-y-4">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="glass-button p-4 rounded-xl border-l-4 border-green-500"
                  >
                    <p className="text-gray-800 mb-2 line-clamp-2 font-light">
                      "{note.highlightedText}"
                    </p>
                    {note.explanation && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2 font-light">
                        <Lightbulb className="w-4 h-4 mr-1 inline" />{" "}
                        {note.explanation}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-light">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-button mb-4">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-gray-600 font-light mb-1">No notes yet</p>
                <p className="text-sm text-gray-500 font-light">
                  Create notes from your highlights
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Learning Tips */}
        <div className="mt-8 glass-card rounded-2xl p-6 border-l-4 border-orange-500">
          <h3 className="text-lg font-light text-gray-800 mb-4">
            <Lightbulb className="w-4 h-4 mr-1 inline" /> Learning Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div className="glass-button p-4 rounded-xl">
              <p className="font-medium mb-1">🎯 Active Reading</p>
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
              <p className="font-medium mb-1">🔄 Regular Review</p>
              <p className="text-sm font-light">
                Revisit your notes regularly to reinforce learning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
