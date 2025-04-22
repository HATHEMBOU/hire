import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Award, ChevronRight, Globe, Users, Zap, ArrowRight } from 'lucide-react';

const Hero = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [animatedCount, setAnimatedCount] = useState({ projects: 0, students: 0, rate: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const difficultyLevels = [
    { value: 'Beginner', description: 'Perfect for newcomers', color: 'bg-green-400' },
    { value: 'Intermediate', description: 'Moderate experience required', color: 'bg-yellow-400' },
    { value: 'Advanced', description: 'For skilled practitioners', color: 'bg-orange-400' },
    { value: 'Expert', description: 'Master-level challenges', color: 'bg-red-400' },
  ];

  const popularCategories = [
    'Web Development',
    'Mobile App',
    'Data Science',
    'AI/ML',
    'UI/UX Design',
    'Game Development',
    'Blockchain',
    'E-commerce',
    'Education',
    'Health & Fitness'
  ];

  // Animate counter on scroll
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('stats-section');
      if (element) {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight - 100 && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  // Animate the counters
  const animateCounters = () => {
    const targetValues = { projects: 100, students: 50, rate: 95 };
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedCount({
        projects: Math.round(targetValues.projects * progress),
        students: Math.round(targetValues.students * progress),
        rate: Math.round(targetValues.rate * progress)
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  // Rotate through categories
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % popularCategories.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Scroll to projects section
  const scrollToProjects = () => {
    document.getElementById('project-list')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="container 2xl:px-20 mx-auto my-12">
      {/* Main Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mx-2">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-700"></div>
        
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 rounded-full bg-white opacity-20 -top-10 -left-10 animate-pulse"></div>
          <div className="absolute w-96 h-96 rounded-full bg-cyan-300 opacity-10 bottom-0 right-0 animate-blob"></div>
          <div className="absolute w-72 h-72 rounded-full bg-blue-400 opacity-15 top-1/2 left-1/3 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 px-6 py-20 text-center flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight animate-fade-in-up">
            Learn, Build, and <span className="text-cyan-300 relative inline-block">
              Gain Experience
              <span className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 transform animate-width-expand"></span>
            </span>
          </h1>
          
          <p className="mb-10 max-w-2xl mx-auto text-base md:text-lg font-light text-gray-100 leading-relaxed animate-fade-in-up animation-delay-300">
            Accelerate your career growth with real-world projects and challenges. HireNext connects you with
            opportunities to build your portfolio and skills.
          </p>

          {/* Featured Category Showcase */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 max-w-3xl w-full mb-10 animate-fade-in-up animation-delay-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="text-cyan-300" size={24} />
                <h3 className="text-xl text-white font-semibold">Featured Categories</h3>
              </div>
              <div className="text-cyan-200 text-sm">
                Explore our {popularCategories.length} categories
              </div>
            </div>
            
            <div className="mt-6 relative h-16">
              {popularCategories.map((category, index) => (
                <div 
                  key={index} 
                  className={`absolute top-0 left-0 w-full transition-all duration-500 flex items-center gap-4 ${
                    index === activeCategory 
                      ? 'opacity-100 transform translate-y-0' 
                      : 'opacity-0 transform translate-y-8'
                  }`}
                >
                  <div className="bg-white/20 text-white p-4 rounded-lg">
                    <span className="text-4xl font-bold">{index + 1}</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white text-xl font-medium">{category}</h4>
                    <p className="text-cyan-200 text-sm">
                      {index % 2 === 0 ? 'Build real-world projects' : 'Gain practical experience'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <div className="flex space-x-1">
                {popularCategories.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveCategory(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeCategory ? 'bg-cyan-300 w-6' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              
              <button 
                onClick={scrollToProjects}
                className="flex items-center gap-2 text-white hover:text-cyan-300 transition-colors group"
              >
                <span>View all projects</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={scrollToProjects}
            className="relative bg-gradient-to-r from-blue-600 to-cyan-500 group text-white px-8 py-4 rounded-lg 
            font-medium transition duration-300 shadow-lg hover:shadow-cyan-500/30 animate-fade-in-up animation-delay-900
            overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>Explore All Projects</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 
            group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>

          {/* Difficulty Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-10 animate-fade-in-up animation-delay-1200">
            {difficultyLevels.map((level, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <span className={`w-3 h-3 rounded-full ${level.color}`}></span>
                <span className="text-sm text-white">{level.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="stats-section" className="mx-2 mt-12">
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              { icon: <Zap size={28} />, value: animatedCount.projects, suffix: 'K+', label: 'Projects Available' },
              { icon: <Users size={28} />, value: animatedCount.students, suffix: 'K+', label: 'Active Students' },
              { icon: <Award size={28} />, value: animatedCount.rate, suffix: '%', label: 'Success Rate' },
            ].map((stat, index) => (
              <div key={index} className={`p-10 text-center ${
                index !== 2 ? 'md:border-r border-white/10' : ''
              }`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-cyan-300 mb-4">
                  {stat.icon}
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-bold text-white">{stat.value}</span>
                  <span className="text-xl md:text-2xl text-cyan-300 ml-1">{stat.suffix}</span>
                </div>
                <div className="text-gray-300 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

     {/* Trusted By Section */}
<div className="mx-2 mt-12">
  <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-lg rounded-2xl p-10">
    <h3 className="text-center font-semibold text-gray-700 mb-10 text-xl relative inline-block w-full">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
        Trusted by leading companies worldwide
      </span>
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></div>
    </h3>
    
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
      {['microsoft_logo', 'walmart_logo', 'accenture_logo', 'samsung_logo', 'amazon_logo', 'adobe_logo'].map(
        (logo, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
            <img 
              className="h-8 md:h-10 filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110" 
              src={assets[logo]} 
              alt={logo.split('_')[0]} 
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300"></div>
          </div>
        )
      )}
    </div>
  </div>
</div>

      {/* How It Works Section */}
      <div className="mx-2 mt-16">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">How HireNext Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform -translate-y-1/2 z-0"></div>
          
          {[
            {
              step: '1',
              title: 'Find a Project',
              description: 'Browse challenges that match your interests and difficulty level.',
              icon: <Globe size={24} className="text-blue-500" />
            },
            {
              step: '2',
              title: 'Build Your Solution',
              description: 'Work on real-world problems and develop your portfolio.',
              icon: <Zap size={24} className="text-blue-500" />
            },
            {
              step: '3',
              title: 'Get Recognized',
              description: 'Showcase your work and connect with top companies.',
              icon: <Award size={24} className="text-blue-500" />
            },
          ].map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative z-10 hover:shadow-xl transition-shadow group">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              <div className="mt-4 text-center">
                <div className="flex justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add CSS for the animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: scale(1); }
          33% { transform: scale(1.1) translate(50px, -20px); }
          66% { transform: scale(0.9) translate(-20px, 30px); }
          100% { transform: scale(1); }
        }
        
        @keyframes width-expand {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite alternate;
        }
        
        .animate-width-expand {
          animation: width-expand 1.5s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-900 {
          animation-delay: 900ms;
        }
        
        .animation-delay-1200 {
          animation-delay: 1200ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </div>
  );
};

export default Hero;