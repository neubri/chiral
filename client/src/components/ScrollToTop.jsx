import { useEffect } from "react";
import { useLocation } from "react-router";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly when route changes
    // This is especially important for article reading where users expect
    // to start from the beginning of the content
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
