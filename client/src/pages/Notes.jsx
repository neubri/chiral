import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Calendar,
  FileText,
  Star,
} from "lucide-react";
import http from "../lib/http";
import Swal from "sweetalert2";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isFavorite: false,
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await http.get("/notes");
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      Swal.fire("Error", "Failed to fetch notes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      Swal.fire("Error", "Please fill in all fields", "error");
      return;
    }

    try {
      if (editingNote) {
        const response = await http.put(`/notes/${editingNote.id}`, formData);
        setNotes(
          notes.map((note) =>
            note.id === editingNote.id ? response.data.note : note
          )
        );
        Swal.fire("Success", "Note updated successfully!", "success");
      } else {
        const response = await http.post("/notes", formData);
        setNotes([response.data.note, ...notes]);
        Swal.fire("Success", "Note created successfully!", "success");
      }

      setFormData({ title: "", content: "", isFavorite: false });
      setIsCreating(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
      Swal.fire("Error", "Failed to save note", "error");
    }
  };

  const deleteNote = async (id) => {
    const result = await Swal.fire({
      title: "Delete Note?",
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
        await http.delete(`/notes/${id}`);
        setNotes(notes.filter((note) => note.id !== id));
        Swal.fire("Deleted!", "Note has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting note:", error);
        Swal.fire("Error", "Failed to delete note", "error");
      }
    }
  };

  const toggleFavorite = async (note) => {
    try {
      const updatedNote = { ...note, isFavorite: !note.isFavorite };
      const response = await http.put(`/notes/${note.id}`, updatedNote);
      setNotes(notes.map((n) => (n.id === note.id ? response.data.note : n)));
    } catch (error) {
      console.error("Error updating favorite:", error);
      Swal.fire("Error", "Failed to update favorite", "error");
    }
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      isFavorite: note.isFavorite || false,
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
    setFormData({ title: "", content: "", isFavorite: false });
  };

  const filteredAndSortedNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterBy === "all") return matchesSearch;
      if (filterBy === "favorites") return matchesSearch && note.isFavorite;
      if (filterBy === "recent") {
        const noteDate = new Date(note.updatedAt || note.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return matchesSearch && noteDate > weekAgo;
      }

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
        );
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "favorites")
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen gradient-calm flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600 font-light">Loading your notes...</p>
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
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-2">My Notes</h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Create, organize and manage your personal notes
          </p>
        </div>

        {/* Create Note Button */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-6 py-3 gradient-secondary text-white rounded-xl hover:shadow-lg hover:scale-105 smooth-transition font-light"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Note
          </button>
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-light text-gray-800 mb-4">
              {editingNote ? "Edit Note" : "Create New Note"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
                  placeholder="Enter note title..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
                  placeholder="Write your note content here..."
                  required
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center glass-button p-3 rounded-xl">
                  <input
                    type="checkbox"
                    checked={formData.isFavorite}
                    onChange={(e) =>
                      setFormData({ ...formData, isFavorite: e.target.checked })
                    }
                    className="mr-3 accent-orange-500"
                  />
                  <span className="text-sm text-gray-700 font-light">
                    Mark as favorite ⭐
                  </span>
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-6 py-3 gradient-secondary text-white rounded-xl hover:shadow-lg hover:scale-105 smooth-transition font-light"
                >
                  {editingNote ? "Update Note" : "Create Note"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 glass-button text-gray-700 rounded-xl hover:scale-105 smooth-transition font-light"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Controls */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes by title or content..."
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
              <option value="title">By Title</option>
              <option value="favorites">Favorites First</option>
            </select>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-3 glass-button rounded-xl text-gray-700 font-light focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
            >
              <option value="all">All Notes</option>
              <option value="favorites">Favorites Only</option>
              <option value="recent">Recent (Last 7 Days)</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 hover:scale-105 smooth-transition">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-light text-gray-600">Total Notes</p>
                <p className="text-2xl font-light text-gray-800">
                  {notes.length}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 hover:scale-105 smooth-transition">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-light text-gray-600">Favorites</p>
                <p className="text-2xl font-light text-gray-800">
                  {notes.filter((note) => note.isFavorite).length}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 hover:scale-105 smooth-transition">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-light text-gray-600">This Week</p>
                <p className="text-2xl font-light text-gray-800">
                  {
                    notes.filter((note) => {
                      const noteDate = new Date(note.createdAt);
                      const weekAgo = new Date(
                        Date.now() - 7 * 24 * 60 * 60 * 1000
                      );
                      return noteDate > weekAgo;
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes List */}
        {filteredAndSortedNotes.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-button mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-light text-gray-800 mb-2">
              {searchTerm ? "No matching notes found" : "No notes yet"}
            </h3>
            <p className="text-gray-600 mb-6 font-light">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Create your first note to get started!"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-6 py-3 gradient-secondary text-white rounded-xl hover:shadow-lg hover:scale-105 smooth-transition font-light"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedNotes.map((note) => (
              <div
                key={note.id}
                className="glass-card rounded-2xl p-6 hover:scale-[1.02] smooth-transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-light text-gray-800 truncate flex-1">
                    {note.title}
                  </h3>
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      onClick={() => toggleFavorite(note)}
                      className={`glass-button p-2 rounded-xl smooth-transition ${
                        note.isFavorite
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-400 hover:text-yellow-500"
                      }`}
                      title={
                        note.isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Star
                        className={`w-4 h-4 ${
                          note.isFavorite ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => startEdit(note)}
                      className="glass-button p-2 rounded-xl text-gray-400 hover:text-blue-600 smooth-transition"
                      title="Edit Note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="glass-button p-2 rounded-xl text-gray-400 hover:text-red-600 smooth-transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 font-light">
                  {note.content.length > 150
                    ? `${note.content.substring(0, 150)}...`
                    : note.content}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="font-light">
                    {new Date(
                      note.updatedAt || note.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {note.isFavorite && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-light glass-button text-yellow-700">
                      ⭐ Favorite
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

export default Notes;
