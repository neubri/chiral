import { Link } from "react-router";
import { LinkButton } from "./Button";

export default function ArticleCard({ article }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatReadingTime = (bodyMarkdown) => {
    const wordsPerMinute = 200;
    const words = bodyMarkdown?.split(" ").length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <div className="glass-card rounded-2xl hover:scale-[1.02] smooth-transition overflow-hidden border border-white/20 shadow-lg hover:shadow-xl">
      {/* Article Image */}
      {article.social_image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.social_image}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 smooth-transition"
          />
        </div>
      )}

      <div className="p-6">
        {/* Author & Date */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex items-center space-x-2">
            <img
              src={article.user?.profile_image_90 || "/default-avatar.png"}
              alt={article.user?.name || "Author"}
              className="w-8 h-8 rounded-full border border-white/20"
            />
            <span className="text-sm text-gray-600 font-light">
              {article.user?.name || "Anonymous"}
            </span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-500 font-light">
            {formatDate(article.published_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-light text-gray-800 mb-3 line-clamp-2 hover:text-orange-600 smooth-transition">
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3 font-light">
          {article.description}
        </p>

        {/* Tags */}
        {article.tag_list && article.tag_list.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tag_list.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-orange-600 text-xs rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
            {article.tag_list.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full font-medium">
                +{article.tag_list.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
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
              <span className="font-light">
                {formatReadingTime(article.body_markdown)}
              </span>
            </span>
            <span className="flex items-center space-x-1">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="font-light">
                {article.public_reactions_count || 0}
              </span>
            </span>
            <span className="flex items-center space-x-1">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="font-light">{article.comments_count || 0}</span>
            </span>
          </div>

          <LinkButton
            to={`/article/${article.id}`}
            variant="outline"
            size="sm"
            className="rounded-xl"
          >
            Read More
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
