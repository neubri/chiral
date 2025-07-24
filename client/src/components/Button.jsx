import { Link } from "react-router";

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-light rounded-xl smooth-transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "gradient-secondary text-white hover:shadow-lg hover:scale-[1.02]",
    secondary:
      "glass-card text-gray-800 hover:glass-button border border-white/20",
    outline:
      "glass-button border-2 border-orange-500/30 text-orange-600 hover:border-orange-500 hover:bg-orange-500/10",
    ghost: "text-gray-600 hover:text-gray-800 hover:glass-button",
    danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  to,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-light rounded-xl smooth-transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500/50";

  const variants = {
    primary: "gradient-secondary text-white hover:shadow-lg hover:scale-[1.02]",
    secondary:
      "glass-card text-gray-800 hover:glass-button border border-white/20",
    outline:
      "glass-button border-2 border-orange-500/30 text-orange-600 hover:border-orange-500 hover:bg-orange-500/10",
    ghost: "text-gray-600 hover:text-gray-800 hover:glass-button",
    danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  );
}
