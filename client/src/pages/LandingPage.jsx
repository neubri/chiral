import { Link } from "react-router";
import { LinkButton } from "../components/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📚</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Chiral</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <LinkButton to="/register" variant="primary" size="lg">
                Get Started
              </LinkButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Learn Smarter with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              AI-Powered
            </span>{" "}
            Reading
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your reading experience. Highlight important concepts, get
            instant AI explanations, and build your personal knowledge base from
            dev.to articles.
          </p>
          <div className="flex items-center justify-center space-x-4 mb-12">
            <LinkButton
              to="/register"
              variant="primary"
              size="xl"
              className="shadow-lg hover:shadow-xl"
            >
              Start Learning Free
            </LinkButton>
            <LinkButton to="/articles" variant="outline" size="xl">
              Browse Articles
            </LinkButton>
          </div>
        </div>

        {/* Demo Screenshot/Preview */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border">
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="ml-4 bg-white rounded px-3 py-1 text-sm text-gray-600">
                  chiral-app.com/article/123
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The Future of Web Development
                </h3>
                <p className="text-gray-600 mb-4">
                  React is a JavaScript library for building user interfaces.
                  <span className="bg-yellow-200 px-1 rounded relative">
                    It lets you compose complex UIs from small and isolated
                    pieces of code
                    <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                      🤖 Explain
                    </span>
                  </span>
                  called "components".
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="text-blue-800 text-sm font-medium">
                    💡 AI Explanation: Components are reusable pieces of code
                    that return JSX elements...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to learn effectively
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes reading and learning from technical
              articles more engaging and productive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Smart Highlighting
              </h3>
              <p className="text-gray-600">
                Select any text in articles and get instant AI-powered
                explanations. Perfect for learning complex technical concepts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Personal Notes
              </h3>
              <p className="text-gray-600">
                Save your highlights and explanations as personal notes. Build
                your own knowledge base from your reading journey.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Dev.to Integration
              </h3>
              <p className="text-gray-600">
                Access thousands of quality technical articles from dev.to. Stay
                updated with the latest in technology and programming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Start learning in just 3 simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Browse Articles
                </h3>
                <p className="text-gray-600">
                  Explore curated technical articles from dev.to on topics
                  you're interested in.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Highlight & Learn
                </h3>
                <p className="text-gray-600">
                  Select text you want to understand better and get instant AI
                  explanations.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Save & Review
                </h3>
                <p className="text-gray-600">
                  Save important highlights as notes and review them anytime
                  from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to supercharge your learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are learning more effectively with
            AI-powered reading assistance.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Free Today
            </Link>
            <Link
              to="/login"
              className="bg-transparent text-white px-8 py-4 rounded-xl hover:bg-white/10 font-semibold text-lg border-2 border-white transition-all duration-200"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
