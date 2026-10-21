import { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Clock,
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  Search,
  Share2,
  Copy,
  Check,
  Tag,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Bot,
  Code2,
  Megaphone,
  Palette
} from 'lucide-react';
import {
  CATEGORIES_DATA,
  CategoryItem,
  SubcategoryItem,
  PostItem,
  getAllCategories,
  getCategoryBySlug,
  getSubcategoryBySlug,
  getPostBySlug,
  getAllPosts,
  getPostsByCategory,
  getPostsBySubcategory
} from '../data/categoriesData';

interface CategoriesPageProps {
  categorySlug?: string;
  subcategorySlug?: string;
  postSlug?: string;
  onNavigate: (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => void;
  onOpenProjectModal: () => void;
}

export function CategoriesPage({
  categorySlug,
  subcategorySlug,
  postSlug,
  onNavigate,
  onOpenProjectModal
}: CategoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Lookups based on route parameters
  const currentCategory: CategoryItem | undefined = categorySlug
    ? getCategoryBySlug(categorySlug)
    : undefined;

  const currentSubcategory: SubcategoryItem | undefined =
    categorySlug && subcategorySlug
      ? getSubcategoryBySlug(categorySlug, subcategorySlug)
      : undefined;

  // Check if postSlug was passed, or if subcategorySlug was actually a post slug
  let currentPost: PostItem | undefined = undefined;
  if (postSlug) {
    currentPost = getPostBySlug(postSlug, categorySlug);
  } else if (categorySlug && subcategorySlug) {
    // Might be /categories/:categorySlug/:postSlug
    const potentialPost = getPostBySlug(subcategorySlug, categorySlug);
    if (potentialPost) {
      currentPost = potentialPost;
    }
  }

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot':
        return <Bot className="w-5 h-5 text-purple-400" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'Megaphone':
        return <Megaphone className="w-5 h-5 text-pink-400" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-amber-400" />;
      default:
        return <FolderOpen className="w-5 h-5 text-purple-400" />;
    }
  };

  // 1. DETAIL VIEW: SINGLE POST READING VIEW (/categories/:category/:post-title)
  if (currentPost) {
    const post = currentPost;
    const cat = getCategoryBySlug(post.categorySlug);
    const relatedPosts = (post.relatedPostSlugs || [])
      .map((slug) => getPostBySlug(slug))
      .filter((p): p is PostItem => Boolean(p));

    const permanentUrl = `${window.location.origin}/categories/${post.categorySlug}/${post.slug}`;

    return (
      <div className="pt-24 pb-24 bg-[#070314] text-neutral-100 min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb Navigation with Permalinks */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center flex-wrap gap-2 text-xs text-neutral-400 pt-4"
          >
            <button
              onClick={() => onNavigate('home', undefined, undefined, '/')}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-neutral-600" />
            <button
              onClick={() => onNavigate('categories', undefined, undefined, '/categories')}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Categories
            </button>
            <ChevronRight className="w-3 h-3 text-neutral-600" />
            <button
              onClick={() =>
                onNavigate(
                  'categories',
                  undefined,
                  undefined,
                  `/categories/${post.categorySlug}`
                )
              }
              className="hover:text-purple-300 transition-colors cursor-pointer text-purple-400"
            >
              {post.categoryName}
            </button>
            <ChevronRight className="w-3 h-3 text-neutral-600" />
            <button
              onClick={() =>
                onNavigate(
                  'categories',
                  undefined,
                  undefined,
                  `/categories/${post.categorySlug}/${post.subcategorySlug}`
                )
              }
              className="hover:text-purple-300 transition-colors cursor-pointer text-neutral-300"
            >
              {post.subcategoryName}
            </button>
          </nav>

          {/* Article Header & Permalinks Bar */}
          <div className="space-y-4 border-b border-purple-900/30 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <Tag className="w-3 h-3" />
                <span>{post.categoryName}</span> • <span>{post.subcategoryName}</span>
              </span>

              {/* Permanent URL Action Pill */}
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-purple-500 transition-all cursor-pointer shadow-xs"
                title="Copy Permanent Link to this Article"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Permanent Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-purple-400" />
                    <span>Copy Permanent URL</span>
                  </>
                )}
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author, Date & Read Time */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-400 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <span className="text-white font-medium">{post.author}</span>
                  <span className="text-xs text-neutral-500 block">{post.authorRole}</span>
                </div>
              </div>
              <span className="hidden sm:inline text-neutral-600">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>{post.date}</span>
              </div>
              <span className="hidden sm:inline text-neutral-600">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Permanent Link display banner */}
            <div className="mt-4 p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between gap-3 text-xs font-mono text-purple-300">
              <div className="truncate">
                <span className="text-neutral-500">Permalink: </span>
                <span className="select-all">/categories/{post.categorySlug}/{post.slug}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-900/40 shrink-0">
                Permanent URL
              </span>
            </div>
          </div>

          {/* Key Takeaways Box */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="p-6 rounded-3xl bg-neutral-900/90 border border-purple-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Executive Architectural Takeaways</span>
              </div>
              <ul className="space-y-2.5">
                {post.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-neutral-200">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Article Content */}
          <div className="space-y-6 text-neutral-200 text-base leading-relaxed">
            {post.content.map((paragraph, idx) => (
              <p key={idx} className="leading-8 text-neutral-300">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-purple-900/30 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Topic Tags & Technologies
            </span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-mono bg-neutral-900 text-purple-300 border border-neutral-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Bio Box */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-lg shrink-0">
              {post.author.charAt(0)}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">{post.author}</h4>
              <p className="text-xs text-purple-300 font-mono">{post.authorRole} at Vixora Labs</p>
              <p className="text-xs text-neutral-400">
                Engineering high-throughput software architectures, resilient AI agent pipelines, and enterprise systems.
              </p>
            </div>
            <button
              onClick={onOpenProjectModal}
              className="sm:ml-auto px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shrink-0 cursor-pointer shadow-md"
            >
              Consult with Author
            </button>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="pt-10 space-y-6">
              <h3 className="text-xl font-bold text-white">Related Technical Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() =>
                      onNavigate(
                        'categories',
                        undefined,
                        undefined,
                        `/categories/${rel.categorySlug}/${rel.slug}`
                      )
                    }
                    className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                        {rel.categoryName}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mt-2">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500 font-mono pt-2 border-t border-neutral-800/50">
                      <span>{rel.readTime}</span>
                      <span className="text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-sans font-semibold">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Navigation CTAs */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-purple-900/30">
            <button
              onClick={() =>
                onNavigate(
                  'categories',
                  undefined,
                  undefined,
                  `/categories/${post.categorySlug}`
                )
              }
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {post.categoryName}</span>
            </button>

            <button
              onClick={() => onNavigate('categories', undefined, undefined, '/categories')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </div>
    );
  }

  // 2. CATEGORY ARCHIVE VIEW: /categories/:categorySlug or /categories/:categorySlug/:subcategorySlug
  if (currentCategory) {
    const cat = currentCategory;
    const isSubcategoryActive = Boolean(currentSubcategory);

    const postsToDisplay = isSubcategoryActive
      ? getPostsBySubcategory(cat.slug, currentSubcategory!.slug)
      : cat.posts;

    const filteredPosts = postsToDisplay.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subcategoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="pt-24 pb-24 bg-[#070314] text-neutral-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center flex-wrap gap-2 text-xs text-neutral-400"
          >
            <button
              onClick={() => onNavigate('home', undefined, undefined, '/')}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-neutral-600" />
            <button
              onClick={() => onNavigate('categories', undefined, undefined, '/categories')}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Categories
            </button>
            <ChevronRight className="w-3 h-3 text-neutral-600" />
            <button
              onClick={() =>
                onNavigate(
                  'categories',
                  undefined,
                  undefined,
                  `/categories/${cat.slug}`
                )
              }
              className={`hover:text-purple-300 transition-colors cursor-pointer ${
                !isSubcategoryActive ? 'text-purple-400 font-semibold' : 'text-neutral-300'
              }`}
            >
              {cat.name}
            </button>
            {isSubcategoryActive && (
              <>
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span className="text-purple-400 font-semibold">
                  {currentSubcategory!.name}
                </span>
              </>
            )}
          </nav>

          {/* Category Header */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-950/70 via-neutral-900 to-indigo-950/60 border border-purple-500/30 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {getCategoryIcon(cat.iconName)}
                <span>{cat.badge}</span>
              </div>

              {/* Permanent URL badge */}
              <div className="px-3 py-1 rounded-xl bg-neutral-900/90 text-neutral-400 text-xs font-mono border border-neutral-800">
                <span className="text-neutral-500">Permalink: </span>
                <span className="text-purple-300">
                  /categories/{cat.slug}
                  {isSubcategoryActive ? `/${currentSubcategory!.slug}` : ''}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {isSubcategoryActive ? currentSubcategory!.name : cat.name}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
              {isSubcategoryActive ? currentSubcategory!.description : cat.description}
            </p>

            {/* Subcategories Filter Pills */}
            <div className="pt-4 border-t border-purple-900/30 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400">
                Subcategories ({cat.subcategories.length})
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() =>
                    onNavigate('categories', undefined, undefined, `/categories/${cat.slug}`)
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    !isSubcategoryActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  All Posts ({cat.posts.length})
                </button>
                {cat.subcategories.map((sub) => {
                  const isActive = isSubcategoryActive && currentSubcategory!.slug === sub.slug;
                  return (
                    <button
                      key={sub.id}
                      onClick={() =>
                        onNavigate(
                          'categories',
                          undefined,
                          undefined,
                          `/categories/${cat.slug}/${sub.slug}`
                        )
                      }
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-800 hover:border-purple-500/40'
                      }`}
                    >
                      <span>{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search bar inside Category */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter articles by title, topic..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Showing {filteredPosts.length} publication{filteredPosts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() =>
                  onNavigate(
                    'categories',
                    undefined,
                    undefined,
                    `/categories/${post.categorySlug}/${post.slug}`
                  )
                }
                className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-xl hover:-translate-y-1 duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                      {post.subcategoryName}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-neutral-500">
                    By {post.author}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Back to All Categories button */}
          <div className="pt-6 border-t border-purple-900/30 flex items-center justify-between">
            <button
              onClick={() => onNavigate('categories', undefined, undefined, '/categories')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Categories</span>
            </button>
            <button
              onClick={onOpenProjectModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
            >
              Book Technical Consultation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. DIRECTORY VIEW: ALL CATEGORIES & SUBCATEGORIES (/categories)
  const allCategories = getAllCategories();
  const allPosts = getAllPosts();

  const filteredAllPosts = allPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-24 bg-[#070314] text-neutral-100 min-h-screen">
      {/* Hero Banner */}
      <section className="relative py-16 sm:py-20 overflow-hidden border-b border-purple-900/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/15 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono uppercase tracking-widest text-[11px]">
              Taxonomy & Knowledge Directory
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Browse Knowledge by Category
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Explore curated architectural frameworks, engineering breakdowns, and growth playbooks organized across dedicated category and subcategory permalinks.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto pt-4">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all categories, subcategories, and titles..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-900/90 border border-purple-900/40 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Directory Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Category Cards Grid with Subcategories */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                Core Domains
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Featured Knowledge Categories
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {allCategories.length} Categories • {allPosts.length} Publications
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-8 rounded-3xl bg-neutral-900/70 border border-neutral-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-6 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30">
                        {getCategoryIcon(cat.iconName)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                        <span className="text-[11px] font-mono text-purple-300">
                          /categories/{cat.slug}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                      {cat.posts.length} Posts
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Subcategories Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      Subcategories:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() =>
                            onNavigate(
                              'categories',
                              undefined,
                              undefined,
                              `/categories/${cat.slug}/${sub.slug}`
                            )
                          }
                          className="px-3 py-1.5 rounded-xl text-xs font-mono bg-neutral-800/80 hover:bg-purple-600 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{sub.name}</span>
                          <span className="text-[10px] text-neutral-500 group-hover:text-white">
                            ({sub.postCount})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <button
                    onClick={() =>
                      onNavigate(
                        'categories',
                        undefined,
                        undefined,
                        `/categories/${cat.slug}`
                      )
                    }
                    className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    <span>View Category Archive</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] font-mono text-neutral-500">
                    Permanent Link Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Recent Publications Stream */}
        <div className="space-y-6 pt-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
              Complete Publication Index
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              All Articles & Architectural Guides
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllPosts.map((post) => (
              <article
                key={post.id}
                onClick={() =>
                  onNavigate(
                    'categories',
                    undefined,
                    undefined,
                    `/categories/${post.categorySlug}/${post.slug}`
                  )
                }
                className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                      {post.categoryName}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-neutral-500">
                    By {post.author}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
