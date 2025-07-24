import { Link } from "react-router";
import { LinkButton } from "../components/Button";
import Footer from "../components/Footer";
import {
  Brain,
  Sparkles,
  Lightbulb,
  BookOpen,
  Rocket,
  Bot,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-calm">
      {/* Navigation */}
      <nav className="glass border-b border-white/20 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-2xl font-light text-gray-800">Chiral</h1>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-gray-600 hover:text-orange-600 font-light smooth-transition"
              >
                Sign in
              </Link>
              <LinkButton
                to="/register"
                variant="primary"
                size="lg"
                className="gradient-secondary text-white border-0 rounded-xl"
              >
                Get Started
              </LinkButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass-card mb-8 backdrop-blur-lg">
            <Sparkles className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-800 mb-6 leading-tight">
            Learn smarter with{" "}
            <span className="text-orange-600 font-normal">AI-powered</span>{" "}
            reading
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed font-light max-w-3xl mx-auto">
            Transform technical articles into interactive learning experiences.
            Highlight, understand, and retain knowledge with AI assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <LinkButton
              to="/register"
              variant="primary"
              size="xl"
              className="gradient-secondary text-white border-0 rounded-xl hover:scale-105 smooth-transition shadow-lg backdrop-blur-sm"
            >
              Start learning free
            </LinkButton>
            <LinkButton
              to="/articles"
              variant="outline"
              size="xl"
              className="glass-button border-white/30 rounded-xl hover:scale-105 smooth-transition text-gray-700"
            >
              Browse articles
            </LinkButton>
          </div>

          {/* Product Preview */}
          <div className="max-w-6xl mx-auto">
            <div className="glass-card rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-lg">
              <div className="glass rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 bg-red-400/70 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400/70 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400/70 rounded-full"></div>
                  <div className="ml-6 glass-card rounded-lg px-4 py-2 text-sm text-gray-600 font-light backdrop-blur-sm">
                    chiral.dev/article/react-components
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-8 shadow-sm backdrop-blur-sm">
                  <h3 className="text-2xl font-light text-gray-800 mb-4">
                    Understanding React Components
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6 font-light">
                    React components are the building blocks of any React
                    application.{" "}
                    <span className="bg-orange-200/60 px-2 py-1 rounded-lg relative backdrop-blur-sm">
                      Components let you split the UI into independent, reusable
                      pieces
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 gradient-secondary text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg flex items-center gap-1">
                        <Bot className="w-3 h-3" /> AI Explain
                      </span>
                    </span>
                    , and think about each piece in isolation.
                  </p>
                  <div className="glass border-l-4 border-orange-500 p-6 rounded-r-xl backdrop-blur-sm">
                    <p className="text-gray-800 font-light">
                      <strong className="text-orange-600 flex items-center gap-1">
                        <Lightbulb className="w-4 h-4" /> AI Explanation:
                      </strong>{" "}
                      Think of components like custom HTML elements. Each
                      component encapsulates its own logic and styling, making
                      code more organized and reusable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="gradient-primary py-20">
        <div className="glass backdrop-blur-lg">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
                Everything you need to learn effectively
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                Intelligent features designed to enhance your technical reading
                and comprehension with the power of AI assistance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="glass-card p-8 rounded-2xl border border-white/20 hover:border-orange-300/50 hover:shadow-xl smooth-transition backdrop-blur-lg">
                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-800 mb-4 text-center">
                  Smart Highlighting
                </h3>
                <p className="text-gray-600 font-light leading-relaxed text-center">
                  Select any text and get instant AI explanations. Perfect for
                  understanding complex technical concepts and terminology with
                  contextual insights.
                </p>
              </div>

              <div className="glass-card p-8 rounded-2xl border border-white/20 hover:border-orange-300/50 hover:shadow-xl smooth-transition backdrop-blur-lg">
                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-800 mb-4 text-center">
                  Personal Knowledge Base
                </h3>
                <p className="text-gray-600 font-light leading-relaxed text-center">
                  Save highlights and explanations as personal notes. Build your
                  own searchable library of programming knowledge and insights.
                </p>
              </div>

              <div className="glass-card p-8 rounded-2xl border border-white/20 hover:border-orange-300/50 hover:shadow-xl smooth-transition backdrop-blur-lg">
                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-800 mb-4 text-center">
                  Dev.to Integration
                </h3>
                <p className="text-gray-600 font-light leading-relaxed text-center">
                  Access thousands of quality technical articles. Stay current
                  with the latest in web development and programming trends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
              How it works
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Start learning more effectively in three simple steps
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/3 text-center lg:text-left">
                <div className="w-16 h-16 gradient-secondary text-white rounded-2xl flex items-center justify-center text-2xl font-light mb-6 mx-auto lg:mx-0 shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-light text-gray-800 mb-4">
                  Choose an Article
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Browse our curated collection of technical articles from
                  dev.to, covering topics from React to machine learning and
                  beyond.
                </p>
              </div>
              <div className="lg:w-2/3">
                <div className="glass-card rounded-2xl p-8 border border-white/20 backdrop-blur-lg">
                  <div className="space-y-4">
                    <div className="glass p-4 rounded-xl border border-white/20 hover:border-orange-300/50 smooth-transition cursor-pointer backdrop-blur-sm">
                      <div className="font-light text-gray-800 text-lg">
                        Getting Started with React Hooks
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        8 min read • JavaScript • React
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl border-2 border-orange-400/60 cursor-pointer backdrop-blur-sm shadow-lg">
                      <div className="font-light text-gray-800 text-lg">
                        Understanding TypeScript Generics
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        12 min read • TypeScript • Advanced
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl border border-white/20 hover:border-orange-300/50 smooth-transition cursor-pointer backdrop-blur-sm">
                      <div className="font-light text-gray-800 text-lg">
                        Modern CSS Grid Techniques
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        15 min read • CSS • Layout
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="lg:w-1/3 text-center lg:text-left">
                <div className="w-16 h-16 gradient-secondary text-white rounded-2xl flex items-center justify-center text-2xl font-light mb-6 mx-auto lg:mx-0 shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-light text-gray-800 mb-4">
                  Highlight & Learn
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Select any text you find confusing or interesting. Our AI
                  provides instant, context-aware explanations tailored to your
                  learning level.
                </p>
              </div>
              <div className="lg:w-2/3">
                <div className="glass-card rounded-2xl p-8 border border-white/20 backdrop-blur-lg">
                  <p className="text-gray-700 font-light leading-relaxed mb-6">
                    TypeScript uses{" "}
                    <span className="bg-orange-200/60 px-2 py-1 rounded-lg backdrop-blur-sm border border-orange-300/50">
                      generic constraints
                    </span>{" "}
                    to limit the types that can be used with generics, providing
                    better type safety...
                  </p>
                  <div className="glass border-l-4 border-orange-500 p-6 rounded-r-xl backdrop-blur-sm">
                    <p className="text-gray-800 font-light">
                      <strong className="text-orange-600 flex items-center gap-1">
                        <Bot className="w-4 h-4" /> AI Explanation:
                      </strong>{" "}
                      Generic constraints let you specify that a generic type
                      must extend a certain type, giving you type safety while
                      maintaining flexibility in your code structure.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/3 text-center lg:text-left">
                <div className="w-16 h-16 gradient-secondary text-white rounded-2xl flex items-center justify-center text-2xl font-light mb-6 mx-auto lg:mx-0 shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-light text-gray-800 mb-4">
                  Save & Review
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Important insights are automatically saved to your personal
                  dashboard. Review, search, and build upon your knowledge
                  anytime.
                </p>
              </div>
              <div className="lg:w-2/3">
                <div className="glass-card rounded-2xl p-8 border border-white/20 backdrop-blur-lg">
                  <div className="space-y-4">
                    <div className="glass p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                      <div className="text-sm font-light text-orange-600 mb-1">
                        React Hooks
                      </div>
                      <div className="text-gray-700 font-light">
                        useState manages component state in functional
                        components...
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                      <div className="text-sm font-light text-orange-600 mb-1">
                        TypeScript Generics
                      </div>
                      <div className="text-gray-700 font-light">
                        Constraints provide type safety while maintaining
                        flexibility...
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                      <div className="text-sm font-light text-orange-600 mb-1">
                        CSS Grid
                      </div>
                      <div className="text-gray-700 font-light">
                        Modern grid techniques for responsive layouts...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-warm py-20">
        <div className="glass backdrop-blur-lg">
          <div className="container mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
              Ready to accelerate your learning?
            </h2>
            <p className="text-lg text-gray-700 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
              Join developers who are building deeper understanding of technical
              concepts with AI-powered reading assistance and smart note-taking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <LinkButton
                to="/register"
                variant="primary"
                size="xl"
                className="gradient-secondary text-white border-0 rounded-xl hover:scale-105 smooth-transition shadow-xl backdrop-blur-sm"
              >
                Start learning free
              </LinkButton>
              <LinkButton
                to="/login"
                variant="outline"
                size="xl"
                className="glass-button border-white/30 rounded-xl hover:scale-105 smooth-transition text-gray-700"
              >
                Sign in to your account
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
