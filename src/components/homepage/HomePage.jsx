import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Menu,
  X,
  ChevronDown,
  Camera,
  FileText,
  Puzzle,
  Scroll,
  Folder,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Plus,
  Minus,
  Calendar,
  Gift,
  Share2,
  BookOpen,
  Sparkles,
  Star,
  Zap,
  Heart,
  Rocket,
  MessageCircle,
  Send,
  Bot,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Custom hook to detect if the device is mobile
const useIsMobile = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // This check ensures the code doesn't break during server-side rendering
    if (typeof window === 'undefined') {
      return;
    }

    const checkDevice = () => setIsMobile(window.innerWidth < breakpoint);

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, [breakpoint]);
  return isMobile;
};


// Enhanced Animation variants with more dramatic effects
const fadeInUp = {
  initial: { opacity: 0, y: 80, scale: 0.8 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 100
    }
  }
};

const slideInLeft = {
  initial: { opacity: 0, x: -100, rotateY: -30 },
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
      type: "spring",
      stiffness: 80
    }
  }
};

const slideInRight = {
  initial: { opacity: 0, x: 100, rotateY: 30 },
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
      type: "spring",
      stiffness: 80
    }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Magnetic button effect
const MagneticButton = ({ children, className, onClick, ...props }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  // OPTIMIZATION: Disable the magnetic effect on mobile as it relies on mouse events.
  const isMobile = useIsMobile();

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setMousePosition({
      x: (e.clientX - centerX) * 0.1,
      y: (e.clientY - centerY) * 0.1,
    });
  };

  const resetPosition = () => {
    if (isMobile) return;
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  }

  return (
    <motion.button
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={resetPosition}
      onClick={onClick}
      animate={!isMobile ? {
        x: mousePosition.x,
        y: mousePosition.y,
        scale: isHovered ? 1.05 : 1,
      } : {}}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Enhanced Background Component
const EnhancedBackground = ({ children, variant = "default" }) => {
  const isMobile = useIsMobile();

  // OPTIMIZATION: Drastically reduce the number of animated elements on mobile to save CPU/GPU resources.
  const particleCount = isMobile ? 8 : 30;
  const showComplexShapes = !isMobile;
  const showLightning = !isMobile;

  const variants = {
    default: {
      gradient: "from-purple-900 via-blue-900 to-purple-900",
      particles: particleCount,
      shapes: showComplexShapes
    },
    light: {
      gradient: "from-purple-50 via-blue-50 to-purple-50",
      particles: isMobile ? 5 : 20,
      shapes: showComplexShapes
    }
  };

  const config = variants[variant];

  return (
    <div className="relative min-h-screen">
      {/* Fixed Background for the entire page */}
      <div className="fixed inset-0 z-0">
        {/* Animated Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}>
          {/* OPTIMIZATION: The radial gradient animation is subtle but can be costly. We disable it on mobile. */}
          {!isMobile && <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/20 via-blue-400/10 to-transparent"
            animate={{
              background: [
                "radial-gradient(ellipse_at_20% 50%, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)",
                "radial-gradient(ellipse_at_80% 50%, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 100%)",
                "radial-gradient(ellipse_at_20% 50%, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)"
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />}
        </div>

        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(config.particles)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${i % 3 === 0 ? 'w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400' :
                i % 3 === 1 ? 'w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400' :
                  'w-3 h-3 bg-gradient-to-r from-purple-300 to-blue-300'
                } opacity-30`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100, -20],
                // OPTIMIZATION: Simplify animation by removing horizontal movement and rotation on mobile.
                x: isMobile ? 0 : [-10, 10, -10],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
                rotate: isMobile ? 0 : [0, 180, 360]
              }}
              transition={{
                duration: Math.random() * 8 + 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        {/* Enhanced Geometric Shapes - Disabled on mobile */}
        {config.shapes && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large floating orbs */}
            <motion.div
              className="absolute w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl"
              style={{ top: '10%', left: '5%' }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1],
                x: [0, 150, 0],
                y: [0, -100, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
              style={{ top: '60%', right: '5%' }}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.4, 0.1],
                x: [0, -120, 0],
                y: [0, 50, 0],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}

        {/* Lightning effects - Disabled on mobile */}
        {showLightning && <motion.div
          className="absolute w-1 h-96 bg-gradient-to-b from-transparent via-purple-400/30 to-transparent transform rotate-45"
          style={{ top: '10%', left: '30%' }}
          animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 8 }}
        />}
      </div>

      {/* Content with relative position */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};


// Enhanced Header Component with glassmorphism
const Header = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    const savedLanguage = localStorage.getItem('language') || 'en';
    i18n.changeLanguage(savedLanguage);
    setCurrentLang(savedLanguage);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [i18n]);

  const languages = [
    { code: 'en', name: t('homepage.header.languages.en'), flag: <img src="https://flagcdn.com/24x18/gb.png" alt="English" className="w-5 h-4" /> },
    { code: 'vi', name: t('homepage.header.languages.vi'), flag: <img src="https://flagcdn.com/24x18/vn.png" alt="Tiếng Việt" className="w-5 h-4" /> },
    { code: 'ja', name: t('homepage.header.languages.ja'), flag: <img src="https://flagcdn.com/24x18/jp.png" alt="日本語" className="w-5 h-4" /> }
  ];

  return (
    <motion.header
      // OPTIMIZATION: `backdrop-blur` is very performance-intensive. We replace it with a more solid background on mobile.
      className={`fixed w-full z-50 transition-all duration-500 ${scrolled
        ? isMobile
          ? 'bg-white/80 backdrop-blur-xl shadow-2xl' // Solid, performant background for mobile
          : 'bg-white/80 backdrop-blur-xl shadow-2xl' // Keep blur effect on desktop
        : 'bg-transparent'
        }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <motion.div
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="relative mr-3"
            >
              <div className="w-10 h-8 border-2 border-blue-500 rounded-md transform skew-x-6"></div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.div>
            </motion.div>
            <motion.span
              className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              TEKUTOKO
            </motion.span>
          </motion.div>

          {/* Enhanced Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {[
              { key: 'home', href: '#hero' },
              { key: 'introduction', href: '#introduction' },
              { key: 'features', href: '#features' },
              { key: 'faq', href: '#faq' },
              { key: 'contact', href: '#contact' }
            ].map((menuItem, index) => (
              <motion.a
                key={menuItem.key}
                href={menuItem.href}
                className={`relative transition-all duration-300 font-semibold group ${scrolled
                  ? 'text-gray-700 hover:text-purple-600'
                  : 'text-white hover:text-purple-400'
                  }`}
                whileHover={{ y: -3, scale: 1.05 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
              >
                {t(`homepage.header.menu.${menuItem.key}`)}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>

          {/* Enhanced Language Selector */}
          <div className="relative">
            <MagneticButton
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`flex items-center space-x-3 px-3 py-2 border rounded-xl transition-all duration-300 shadow-lg ${scrolled
                ? isMobile
                  ? 'bg-white/10 border-white/20 hover:bg-white/20' // Mobile scrolled style
                  : 'bg-gray-100/80 border-gray-200 hover:bg-gray-200/80 backdrop-blur-md' // Desktop scrolled style
                : 'bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md'
                }`}
            >
              <motion.span>
                {languages.find(l => l.code === currentLang)?.flag}
              </motion.span>
              <span className={`font-medium ${scrolled && !isMobile ? 'text-gray-700' : 'text-white'}`}>
                {languages.find(l => l.code === currentLang)?.name}
              </span>
              <motion.div
                animate={{ rotate: isLangOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className={`w-4 h-4 ${scrolled && !isMobile ? 'text-gray-700' : 'text-white'}`} />
              </motion.div>
            </MagneticButton>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-40 bg-gray-100/80 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden"
                >
                  {languages.map((lang, index) => (
                    <motion.button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm hover:bg-purple-50 transition-all duration-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5, backgroundColor: "rgba(147, 51, 234, 0.1)" }}
                    >
                      <span className="mr-3">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMenuOpen ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, rotateX: -90 }}
              animate={{ opacity: 1, height: 'auto', rotateX: 0 }}
              exit={{ opacity: 0, height: 0, rotateX: -90 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="lg:hidden mt-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {[
                  { key: 'home', href: '#hero' },
                  { key: 'introduction', href: '#introduction' },
                  { key: 'features', href: '#features' },
                  { key: 'faq', href: '#faq' },
                  { key: 'contact', href: '#contact' }
                ].map((menuItem, index) => (
                  <motion.a
                    key={menuItem.key}
                    href={menuItem.href}
                    className="block py-3 px-4 text-gray-700 hover:text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                  >
                    {t(`homepage.header.menu.${menuItem.key}`)}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};


// Enhanced Hero Section with 3D effects
const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const images = ['/images/1.webp', '/images/2.webp', '/images/3.webp', '/images/4.webp'];
  const isMobile = useIsMobile();

  // State để theo dõi xem có phải là lần render đầu tiên không
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Sau lần chuyển ảnh đầu tiên, nó không còn là initial load nữa
      setIsInitialLoad(false);
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  // OPTIMIZATION: Định nghĩa các trạng thái animation
  // Trạng thái cho ảnh đầu tiên: hiển thị ngay, chỉ scale nhẹ
  const initialLoadVariants = {
    initial: { opacity: 1, scale: 1.05 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeInOut" } },
    exit: { 
      x: "-100%", 
      opacity: 0, 
      scale: 0.9, 
      transition: { duration: 0.4, ease: "easeInOut" } 
    }
  };

  // Trạng thái cho các ảnh trong slideshow
  const slideshowVariants = {
    initial: isMobile
      ? { opacity: 0, scale: 1.1 }
      : { opacity: 0, scale: 1.3, rotateY: 90, filter: "blur(20px)" },
    animate: isMobile
      ? { opacity: 1, scale: 1 }
      : { opacity: 1, scale: 1, rotateY: 0, filter: "blur(0px)" },
    exit: isMobile
      ? { opacity: 0, scale: 0.9 }
      : { opacity: 0, scale: 0.8, rotateY: -90, filter: "blur(10px)" }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
        {/* Enhanced Phone Mockup */}
        <motion.div
          className="relative"
          variants={slideInLeft}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="relative w-72 h-144"
            style={{ perspective: 1000 }}
            whileHover={!isMobile ? { rotateY: 15, rotateX: 5, scale: 1.05 } : {}}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Phone Shadow */}
            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-48 h-16 bg-black/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

{/* Phone Frame */}
<div className="relative w-64 h-128 bg-gradient-to-br from-gray-800 to-black rounded-[2.5rem] border-8 border-gray-800 overflow-hidden shadow-2xl">
  <div className="absolute inset-2 bg-gradient-to-br from-white/10 to-transparent rounded-[1.75rem] z-20 pointer-events-none"></div>

  {/* Thay thế AnimatePresence mode="wait" bằng mode="popLayout" */}
  <AnimatePresence mode="popLayout">
    <motion.img
      key={currentImage}
      src={images[currentImage]}
      alt={`Screenshot ${currentImage + 1}`}
      className="absolute inset-0 w-full h-full object-cover" // Thêm absolute positioning
      // Hiệu ứng fade + slide mượt mà hơn
      variants={isInitialLoad ? initialLoadVariants : {
        initial: { 
          x: "100%", 
          opacity: 0,
          scale: 1.05
        },
        animate: { 
          x: 0, 
          opacity: 1,
          scale: 1,
          transition: { 
            x: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
            opacity: { duration: 0.4, ease: "easeOut" },
            scale: { duration: 0.6, ease: "easeOut" }
          }
        },
        exit: { 
          x: "-50%", // Giảm khoảng cách slide ra
          opacity: 0,
          scale: 0.95,
          transition: { 
            x: { duration: 0.4, ease: "easeIn" },
            opacity: { duration: 0.3, ease: "easeIn" },
            scale: { duration: 0.4, ease: "easeIn" }
          }
        }
      }}
      initial="initial"
      animate="animate"
      exit="exit"
    />
  </AnimatePresence>

  {/* Glowing border effect - Disabled on mobile */}
  {!isMobile && <motion.div
    className="absolute inset-0 rounded-[2.5rem]"
    animate={{ boxShadow: ["0 0 20px rgba(147, 51, 234, 0.3)", "0 0 40px rgba(59, 130, 246, 0.4)", "0 0 20px rgba(147, 51, 234, 0.3)"] }}
    transition={{ duration: 3, repeat: Infinity }}
  />}
</div>

            {/* Floating icons around phone - Disabled on mobile */}
            {!isMobile && [Camera, Heart, Star, Zap].map((Icon, index) => (
              <motion.div
                key={index}
                className="absolute w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ top: `${20 + index * 20}%`, left: index % 2 === 0 ? '-15%' : '95%' }}
                animate={{ y: [0, -20, 0], rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 3 + index, repeat: Infinity, delay: index * 0.5, ease: "linear" }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

          {/* Enhanced Hero Content (không thay đổi) */}
          <motion.div
            className="text-center lg:text-left max-w-2xl text-white flex flex-col items-center lg:items-start"
            variants={slideInRight}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              className="text-5xl md:text-6xl xl:text-7xl font-black mb-8 leading-tight"
            >
              <motion.span
                className="block"
                animate={!isMobile ? { textShadow: ["0 0 20px rgba(255,255,255,0.5)", "0 0 40px rgba(147,51,234,0.8)", "0 0 20px rgba(255,255,255,0.5)"] } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {t('homepage.hero.title')}
              </motion.span>
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              >
                {t('homepage.hero.titleHighlight')}
              </motion.span>
            </motion.h1>

            <motion.p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed">
              {t('homepage.hero.description')}
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 sm:px-0 py-4">
              <MagneticButton
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl text-lg font-bold shadow-2xl overflow-hidden min-w-[200px]"
                onClick={() => navigate('/home')}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center justify-center">
                  {t('homepage.hero.cta')}
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Rocket className="w-5 h-5" />
                  </motion.div>
                </span>
              </MagneticButton>

              <motion.button
                className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-semibold backdrop-blur-md hover:bg-white/10 transition-all duration-300 min-w-[180px]"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('introduction')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="flex items-center justify-center">
                  Learn More
                  <ChevronDown className="ml-2 w-5 h-5" />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


// Enhanced Introduction Section
const IntroductionSection = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <section id="introduction" ref={ref} className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80, rotateX: -30 }}
          animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 1.2, type: "spring" }}
          className="max-w-5xl mx-auto"
        >
          <motion.div
            className="text-8xl mb-12 inline-block"
            animate={inView ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0], y: [0, -20, 0] } : {}}
            transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.3, rotate: 15, transition: { duration: 0.3 } }}
          >
            💬
          </motion.div>

          <motion.blockquote
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-200 italic leading-tight relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <span className="relative z-10">"{t('homepage.introduction.quote')}"</span>

            <motion.span
              className="absolute -top-6 -left-6 text-6xl text-purple-300 opacity-50"
              initial={{ opacity: 0, rotate: -30, scale: 0 }}
              animate={inView ? { opacity: 0.5, rotate: 0, scale: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              "
            </motion.span>
            <motion.span
              className="absolute -bottom-6 -right-6 text-6xl text-blue-300 opacity-50 rotate-180"
              initial={{ opacity: 0, rotate: 150, scale: 0 }}
              animate={inView ? { opacity: 0.5, rotate: 180, scale: 1 } : {}}
              transition={{ delay: 1, duration: 0.8 }}
            >
              "
            </motion.span>
          </motion.blockquote>

          <motion.div
            className="flex justify-center items-center mt-12 space-x-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            {[Star, Heart, Sparkles].map((Icon, index) => (
              <motion.div
                key={index}
                className="w-8 h-8 text-purple-400"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
              >
                <Icon />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};


// Features Showcase
const FeaturesShowcase = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const isMobile = useIsMobile();

  const features = [
    { icon: Camera, title: t('homepage.features.items.photoHunt.title'), desc: t('homepage.features.items.photoHunt.description'), color: "purple" },
    { icon: FileText, title: t('homepage.features.items.stampCollection.title'), desc: t('homepage.features.items.stampCollection.description'), color: "blue" },
    { icon: Puzzle, title: t('homepage.features.items.riddleChallenge.title'), desc: t('homepage.features.items.riddleChallenge.description'), color: "green" },
    { icon: Scroll, title: t('homepage.features.items.missionLog.title'), desc: t('homepage.features.items.missionLog.description'), color: "yellow" },
    { icon: Folder, title: t('homepage.features.items.workflowSubmission.title'), desc: t('homepage.features.items.workflowSubmission.description'), color: "red" },
    { icon: BookOpen, title: t('homepage.features.items.homeworkSubmission.title'), desc: t('homepage.features.items.homeworkSubmission.description'), color: "indigo" }
  ];

  const colorClasses = {
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200",
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200",
    green: "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200",
    yellow: "bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border-yellow-200",
    red: "bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200",
    indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200"
  };

  return (
    <section id='features' ref={ref} className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <motion.div
            className="inline-block p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-8"
            whileHover={{ scale: 1.1, rotate: 5 }}
            animate={!isMobile ? {
              boxShadow: [
                "0 0 20px rgba(147, 51, 234, 0.3)",
                "0 0 40px rgba(59, 130, 246, 0.4)",
                "0 0 20px rgba(147, 51, 234, 0.3)",
              ]
            } : {}}
            transition={{ boxShadow: { duration: 3, repeat: Infinity }, hover: { duration: 0.3 } }}
          >
            <div className="bg-white rounded-xl p-4">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
          </motion.div>

          <motion.h2 className="text-5xl md:text-6xl xl:text-7xl font-black mb-8 leading-tight text-white">
            <motion.span
              className="block"
              // OPTIMIZATION: Disable expensive text-shadow animation on mobile.
              animate={!isMobile ? {
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(147,51,234,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)",
                ]
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {t('homepage.features.title')}
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {t('homepage.features.description')}
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={inView ? "animate" : "initial"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 ${colorClasses[feature.color]} overflow-hidden`}
              // OPTIMIZATION: Use a simpler hover effect on mobile.
              whileHover={isMobile ? { scale: 1.03 } : {
                scale: 1.05,
                rotateY: 10,
                rotateX: 5,
                boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center mb-6 relative z-10">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  <feature.icon className="w-8 h-8 text-white relative z-10" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed relative z-10">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Detailed Features Section
const DetailedFeaturesSection = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const features = [
    {
      title: t('homepage.detailedFeatures.items.eventOrganization.title'),
      description: t('homepage.detailedFeatures.items.eventOrganization.description'),
      image: "./images/feature1.webp",
      points: [
        t('homepage.detailedFeatures.items.eventOrganization.points.0'),
        t('homepage.detailedFeatures.items.eventOrganization.points.1'),
        t('homepage.detailedFeatures.items.eventOrganization.points.2')
      ],
      color: "purple",
      icon: Calendar
    },
    {
      title: t('homepage.detailedFeatures.items.exclusiveRewards.title'),
      description: t('homepage.detailedFeatures.items.exclusiveRewards.description'),
      image: "./images/feature2.webp",
      points: [
        t('homepage.detailedFeatures.items.exclusiveRewards.points.0'),
        t('homepage.detailedFeatures.items.exclusiveRewards.points.1'),
        t('homepage.detailedFeatures.items.exclusiveRewards.points.2')
      ],
      color: "blue",
      icon: Gift
    },
    {
      title: t('homepage.detailedFeatures.items.eventTracking.title'),
      description: t('homepage.detailedFeatures.items.eventTracking.description'),
      image: "./images/feature3.webp",
      points: [
        t('homepage.detailedFeatures.items.eventTracking.points.0'),
        t('homepage.detailedFeatures.items.eventTracking.points.1'),
        t('homepage.detailedFeatures.items.eventTracking.points.2')
      ],
      color: "green",
      icon: Share2
    }
  ];

  const colorClasses = {
    purple: { bg: "bg-purple-100", border: "border-purple-200", icon: "text-purple-600", button: "bg-purple-600 hover:bg-purple-700", accent: "bg-purple-500" },
    blue: { bg: "bg-blue-100", border: "border-blue-200", icon: "text-blue-600", button: "bg-blue-600 hover:bg-blue-700", accent: "bg-blue-500" },
    green: { bg: "bg-green-100", border: "border-green-200", icon: "text-green-600", button: "bg-green-600 hover:bg-green-700", accent: "bg-green-500" }
  };
  return (
    <section ref={ref} className="py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            className="inline-block p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <div className="bg-white rounded-full p-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.h2 className="text-5xl md:text-6xl xl:text-7xl font-black mb-8 leading-tight text-white">
            <motion.span
              className="block"
              animate={!isMobile ? {
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(147,51,234,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)",
                ]
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {t('homepage.detailedFeatures.title')}
            </motion.span>
          </motion.h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {t('homepage.detailedFeatures.description')}
          </p>
        </motion.div>

        {/* Desktop Layout: 3 columns (hidden on mobile) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group h-full"
            >
              <motion.div
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border-none ${colorClasses[feature.color].border} h-full flex flex-col`}
                whileHover={{ scale: 1.02, y: -10, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative overflow-hidden">
                  <motion.img src={feature.image} alt={feature.title} className="w-full h-48 object-cover" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${colorClasses[feature.color].accent} rounded-xl flex items-center justify-center mr-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{feature.description}</p>
                  <div className="space-y-3">
                    {feature.points.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-center text-gray-700">
                        <div className={`w-2 h-2 ${colorClasses[feature.color].accent} rounded-full mr-3`} />
                        <span className="text-sm font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Mobile/Tablet Layout: Stacked */}
        <div className="lg:hidden space-y-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-200">
              <div className="relative overflow-hidden">
                <img src={feature.image} alt={feature.title} className="w-full h-64 md:h-80 object-cover" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 ${colorClasses[feature.color].accent} rounded-xl flex items-center justify-center mr-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <div className="space-y-3 mb-6">
                  {feature.points.map((point, pointIndex) => (
                    <div key={pointIndex} className="flex items-center text-gray-700">
                      <div className={`w-3 h-3 ${colorClasses[feature.color].accent} rounded-full mr-4 flex-shrink-0`} />
                      <span className="font-medium">{point}</span>
                    </div>
                  ))}
                </div>
                <motion.button
                  className={`w-full ${colorClasses[feature.color].button} text-white py-3 px-8 rounded-xl font-semibold shadow-lg`}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('homepage.detailedFeatures.exploreButton')}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('homepage.detailedFeatures.cta.title')}</h3>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">{t('homepage.detailedFeatures.cta.description')}</p>
            <motion.button
              className="bg-white text-purple-600 py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/home')}
            >
              {t('homepage.detailedFeatures.cta.button')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


// Q&A Section
const QASection = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [openIndex, setOpenIndex] = useState(null);
  const isMobile = useIsMobile();

  const qaItems = [
    { question: t('homepage.faq.items.createEvent.question'), answer: t('homepage.faq.items.createEvent.answer'), image: "./images/pic1.webp" },
    { question: t('homepage.faq.items.getRewards.question'), answer: t('homepage.faq.items.getRewards.answer'), image: "./images/pic2.webp" },
    { question: t('homepage.faq.items.forgotPassword.question'), answer: t('homepage.faq.items.forgotPassword.answer') }
  ];

  return (
    <section id="faq" ref={ref} className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2 className="text-4xl font-extrabold mb-8 leading-tight text-white">
            <motion.span
              className="block"
              animate={!isMobile ? {
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(147,51,234,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)",
                ]
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {t('homepage.faq.title')}
            </motion.span>
          </motion.h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {qaItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-900">{item.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openIndex === index ? <Minus className="w-5 h-5 text-purple-600" /> : <Plus className="w-5 h-5 text-gray-600" />}
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-t border-gray-200"
                  >
                    <div className="px-6 py-4">
                      <p className="text-gray-600 mb-4">{item.answer}</p>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.question}
                          className="w-full rounded-lg mt-4 shadow-md"
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


// Footer Component
const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer id='contact' className="relative">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left text-gray-300"
          >
            <h3 className="text-xl font-semibold text-white mb-4">{t('homepage.footer.contact.title')}</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center md:justify-start">
                <Mail className="w-4 h-4 mr-3" />
                <a href={`mailto:${t('homepage.footer.contact.email')}`} className="hover:text-purple-400 transition-colors">
                  {t('homepage.footer.contact.email')}
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Phone className="w-4 h-4 mr-3" />
                <span>{t('homepage.footer.contact.phone')}</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex justify-center md:justify-start space-x-4">
              {[
                { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61568240777698" },
                { icon: Instagram, href: "https://www.instagram.com/tekutoko2219" },
                { icon: Twitter, href: "https://x.com/TEKUTOKOINFO" },
                { icon: Youtube, href: "https://www.youtube.com/@TEKUTOKO" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-right text-gray-400"
          >
            <p className="mb-4">{t('homepage.footer.copyright')}</p>
            <div className="space-x-4">
              <a href="https://tekutoko.org/terms-and-conditions" className="hover:text-purple-400 transition-colors">
                {t('homepage.footer.links.privacy')}
              </a>
              <a href="https://tekutoko.org/terms-and-conditions" className="hover:text-purple-400 transition-colors">
                {t('homepage.footer.links.terms')}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

// Typing Animation Component
const TypingAnimation = () => {
  return (
    <div className="flex items-center space-x-1 px-4 py-2">
      <div className="flex space-x-1">
        <motion.div
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span className="text-sm text-gray-500 ml-2">Typing...</span>
    </div>
  );
};

// Chat Bubble Component
const ChatBubble = ({ message, isBot, isTyping = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isBot ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-300'
            }`}>
            {isBot ? (
              <Bot className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>

        {/* Message */}
        <div className={`px-4 py-2 rounded-2xl ${isBot
          ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-sm'
          }`}>
          {isTyping ? (
            <TypingAnimation />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main Chatbot Component
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation(); // Thêm i18n để theo dõi thay đổi ngôn ngữ

  // Khởi tạo messages với một mảng trống trước
  const [messages, setMessages] = useState([]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // useEffect để cập nhật tin nhắn chào mừng khi ngôn ngữ thay đổi
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      text: t('homepage.chatbot.welcomeMessage'),
      isBot: true,
      timestamp: new Date()
    };

    // Nếu chưa có tin nhắn nào hoặc tin nhắn đầu tiên là tin nhắn chào mừng
    setMessages(prevMessages => {
      if (prevMessages.length === 0) {
        return [welcomeMessage];
      } else if (prevMessages[0].id === 1 && prevMessages[0].isBot) {
        // Cập nhật tin nhắn chào mừng
        return [welcomeMessage, ...prevMessages.slice(1)];
      }
      return prevMessages;
    });
  }, [t, i18n.language]); // Theo dõi sự thay đổi của ngôn ngữ

  // Auto scroll to bottom
  const messagesEndRef = React.useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputValue }),
      });

      const data = await response.json();

      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        const botMessage = {
          id: Date.now() + 1,
          text: data.answer || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau!",
          isBot: true,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);

        // Show notification if chat is closed
        if (!isOpen) {
          setNewMessageCount(prev => prev + 1);
        }
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      setTimeout(() => {
        setIsTyping(false);
        const errorMessage = {
          id: Date.now() + 1,
          text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau!",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }, 1500);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick suggestions
  const quickSuggestions = [
    t('homepage.chatbot.suggestions.suggestion1'),
    t('homepage.chatbot.suggestions.suggestion2'),
    t('homepage.chatbot.suggestions.suggestion3'),
    t('homepage.chatbot.suggestions.suggestion4')
  ];

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  // Clear new message count when opening chat
  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setNewMessageCount(0);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={handleToggleChat}
          className="relative w-16 h-16 bg-white/80 rounded-full shadow-2xl flex items-center justify-center text-gray-600 border border-gray-200 hover:bg-white transition-colors duration-300"
          whileHover={{ scale: 1.1, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            ]
          }}
          transition={{ boxShadow: { duration: 3, repeat: Infinity } }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? 'close' : 'chat'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-500" />
              ) : (
                <MessageCircle className="w-6 h-6 text-blue-500" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* New message notification */}
          {newMessageCount > 0 && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
            >
              {newMessageCount}
            </motion.div>
          )}

          {/* Pulse effect khi có tin nhắn mới */}
          {newMessageCount > 0 && !isOpen && (
            <motion.div
              className="absolute inset-0 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.4],
                opacity: [0.7, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          )}
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-20 right-2 sm:right-6 z-50 
                 w-[calc(100vw-16px)] sm:w-96 
                 h-[70vh] sm:h-[500px] 
                 max-w-sm sm:max-w-none
                 bg-white rounded-2xl shadow-2xl
                 flex flex-col overflow-hidden"
          >
            {/* Header - Fixed height */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 sm:p-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">{t('homepage.chatbot.title')}</h3>
                    <p className="text-xs opacity-90 hidden sm:block">{t('homepage.chatbot.description')}</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>

            {/* Messages - Flexible height */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message.text}
                  isBot={message.isBot}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <ChatBubble isBot={true} isTyping={true} />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions - Show only on larger screens */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-3 sm:px-4 pb-2 flex-shrink-0 hidden sm:block">
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input - Fixed height */}
            <div className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('homepage.chatbot.inputPlaceholder', 'Nhập câu hỏi của bạn...')}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       min-h-[40px]"
                  disabled={isTyping}
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       w-10 h-10 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Main HomePage Component
const HomePage = () => {
  return (
    <EnhancedBackground variant='default'>
      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <IntroductionSection />
          <FeaturesShowcase />
          <DetailedFeaturesSection />
          <QASection />
        </main>
        <Footer />
        <ChatBot />
      </div>
    </EnhancedBackground>
  );
};

export default HomePage;