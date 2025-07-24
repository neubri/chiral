import { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Calendar,
  FileText,
  Star,
  Eye,
  Edit,
} from "lucide-react";
import Markdown from "react-markdown";
import { useNotes } from "../store/hooks";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  setFilters,
} from "../store/slices/notesSlice";
import Swal from "sweetalert2";

function Notes() {
  const {
    notes,
    filters,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    error,
    dispatch,
  } = useNotes();

  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isFavorite: false,
  });

  useEffect(() => {
    // Fetch notes when component mounts
    dispatch(fetchNotes());
  }, [dispatch]);

  // Show error notification when there's an error
  useEffect(() => {
    if (error) {
      Swal.fire("Error", error, "error");
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      Swal.fire("Error", "Please fill in all fields", "error");
      return;
    }

    try {
      if (editingNote) {
        await dispatch(
          updateNote({
            id: editingNote.id,
            data: formData,
          })
        ).unwrap();
        Swal.fire("Success", "Note updated successfully!", "success");
      } else {
        await dispatch(createNote(formData)).unwrap();
        Swal.fire("Success", "Note created successfully!", "success");
      }

      setFormData({ title: "", content: "", isFavorite: false });
      setIsCreating(false);
      setEditingNote(null);
      setPreviewMode(false); // Reset preview mode after saving
    } catch (error) {
      console.error("Error saving note:", error);
      Swal.fire("Error", "Failed to save note", "error");
    }
  };

  const handleDeleteNote = async (id) => {
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
        await dispatch(deleteNote(id)).unwrap();
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
      await dispatch(
        updateNote({
          id: note.id,
          data: updatedNote,
        })
      ).unwrap();
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
    setPreviewMode(false); // Reset to write mode when editing
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
    setFormData({ title: "", content: "", isFavorite: false });
    setPreviewMode(false); // Reset preview mode when canceling
  };

  const handleSearchChange = (searchTerm) => {
    dispatch(setFilters({ searchTerm }));
  };

  const handleSortChange = (sortBy) => {
    dispatch(setFilters({ sortBy }));
  };

  const handleFilterChange = (filterBy) => {
    dispatch(setFilters({ filterBy }));
  };

  const filteredAndSortedNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(filters.searchTerm.toLowerCase());

      if (filters.filterBy === "all") return matchesSearch;
      if (filters.filterBy === "favorites")
        return matchesSearch && note.isFavorite;
      if (filters.filterBy === "recent") {
        const noteDate = new Date(note.updatedAt || note.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return matchesSearch && noteDate > weekAgo;
      }

      return matchesSearch;
    })
    .sort((a, b) => {
      if (filters.sortBy === "newest")
        return (
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
        );
      if (filters.sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (filters.sortBy === "title") return a.title.localeCompare(b.title);
      if (filters.sortBy === "favorites")
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
            onClick={() => {
              setIsCreating(true);
              setPreviewMode(false);
            }}
            disabled={createLoading}
            className="inline-flex items-center px-6 py-3 gradient-secondary text-white rounded-xl hover:shadow-lg hover:scale-105 smooth-transition font-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            {createLoading ? "Creating..." : "New Note"}
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
                  disabled={createLoading || updateLoading}
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-light text-gray-700">
                    Content (Markdown supported)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className={`px-3 py-1 text-xs rounded-lg smooth-transition ${
                        !previewMode
                          ? "bg-orange-500 text-white"
                          : "glass-button text-gray-600 hover:bg-orange-100"
                      }`}
                      disabled={createLoading || updateLoading}
                    >
                      <Edit className="w-3 h-3 mr-1 inline" />
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className={`px-3 py-1 text-xs rounded-lg smooth-transition ${
                        previewMode
                          ? "bg-orange-500 text-white"
                          : "glass-button text-gray-600 hover:bg-orange-100"
                      }`}
                      disabled={createLoading || updateLoading}
                    >
                      <Eye className="w-3 h-3 mr-1 inline" />
                      Preview
                    </button>
                  </div>
                </div>

                {!previewMode ? (
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={8}
                    className="w-full px-4 py-3 glass-card rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition font-mono text-sm"
                    placeholder="Write your note content here using Markdown...

**Examples:**
# Heading 1
## Heading 2
**Bold text**
*Italic text*
- List item
1. Numbered list
[Link](url)
`code`
```
code block
```"
                    required
                    disabled={createLoading || updateLoading}
                  />
                ) : (
                  <div className="w-full min-h-[200px] px-4 py-3 glass-card rounded-xl text-gray-800 overflow-auto">
                    {formData.content ? (
                      <Markdown className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-orange-600 prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-1 prose-code:rounded">
                        {formData.content}
                      </Markdown>
                    ) : (
                      <p className="text-gray-500 italic">
                        Nothing to preview yet. Start writing in the Write tab.
                      </p>
                    )}
                  </div>
                )}
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
                    disabled={createLoading || updateLoading}
                  />
                  <span className="text-sm text-gray-700 font-light">
                    Mark as favorite ⭐
                  </span>
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={createLoading || updateLoading}
                  className="px-6 py-3 gradient-secondary text-white rounded-xl hover:shadow-lg hover:scale-105 smooth-transition font-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingNote
                    ? updateLoading
                      ? "Updating..."
                      : "Update Note"
                    : createLoading
                    ? "Creating..."
                    : "Create Note"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={createLoading || updateLoading}
                  className="px-6 py-3 glass-button text-gray-700 rounded-xl hover:scale-105 smooth-transition font-light disabled:opacity-50 disabled:cursor-not-allowed"
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
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass-button rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
              />
            </div>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-3 glass-button rounded-xl text-gray-700 font-light focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
              <option value="favorites">Favorites First</option>
            </select>

            {/* Filter */}
            <select
              value={filters.filterBy}
              onChange={(e) => handleFilterChange(e.target.value)}
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
              {filters.searchTerm ? "No matching notes found" : "No notes yet"}
            </h3>
            <p className="text-gray-600 mb-6 font-light">
              {filters.searchTerm
                ? "Try adjusting your search or filters"
                : "Create your first note to get started!"}
            </p>
            {!filters.searchTerm && (
              <button
                onClick={() => {
                  setIsCreating(true);
                  setPreviewMode(false);
                }}
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
                      disabled={updateLoading}
                      className={`glass-button p-2 rounded-xl smooth-transition disabled:opacity-50 disabled:cursor-not-allowed ${
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
                      disabled={updateLoading || deleteLoading}
                      className="glass-button p-2 rounded-xl text-gray-400 hover:text-blue-600 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit Note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deleteLoading}
                      className="glass-button p-2 rounded-xl text-gray-400 hover:text-red-600 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-gray-600 text-sm mb-4 line-clamp-3 font-light overflow-hidden">
                  <Markdown className="prose prose-sm max-w-none prose-headings:text-gray-700 prose-p:text-gray-600 prose-a:text-orange-600 prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-1 prose-code:rounded prose-p:mb-1 prose-headings:mb-1 prose-headings:mt-1">
                    {note.content.length > 150
                      ? `${note.content.substring(0, 150)}...`
                      : note.content}
                  </Markdown>
                </div>

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
