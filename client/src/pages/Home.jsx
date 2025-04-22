import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProjectListings from "../components/ProjectListings";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

const Home = () => {
  const [bubbles, setBubbles] = useState([]);
  
  // Generate a new bubble
  const createBubble = () => {
    const bubble = {
      id: Date.now() + Math.random(), // unique ID
      x: Math.random() * 100, // random position across the screen (%)
      y: 100 + Math.random() * 20, // start below the screen
      size: 10 + Math.random() * 35, // random size with more variation
      speed: 0.15 + Math.random() * 0.35, // slower speed but with variation
      opacity: 0.4 + Math.random() * 0.4, // varying opacity
      hue: 195 + Math.random() * 45, // blue hue variation
    };
    
    setBubbles(prev => [...prev, bubble]);
    
    // Remove bubble after animation completes
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    }, 25000); // Even longer lifetime for more bubbles on screen
  };
  
  // Create bubbles more frequently for more bubbles
  useEffect(() => {
    // Create bubbles more frequently
    const interval = setInterval(createBubble, 400); // Much more frequent bubbles
    
    // Initial bubbles (many more)
    for (let i = 0; i < 20; i++) {
      setTimeout(() => createBubble(), i * 200); // Stagger initial creation
    }
    
    return () => clearInterval(interval);
  }, []);
  
  // Move bubbles upward
  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      setBubbles(prev => 
        prev.map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed,
          // Gentler sway with variation
          x: bubble.x + Math.sin(Date.now() / (2000 + bubble.size * 10) + bubble.id) * 0.12
        }))
      );
      requestAnimationFrame(animate);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, []);
  
  // Special effect: Bubble popping animation
  const popBubble = (id) => {
    // Find the bubble
    const bubble = bubbles.find(b => b.id === id);
    if (!bubble) return;
    
    // Create tiny bubbles at the position of the popped bubble
    const tinyBubbles = [];
    const numFragments = Math.floor(bubble.size / 4); // Larger bubbles create more fragments
    
    for (let i = 0; i < numFragments; i++) {
      const angle = (i / numFragments) * Math.PI * 2;
      const distance = bubble.size / 4;
      
      tinyBubbles.push({
        id: Date.now() + i + Math.random(),
        x: bubble.x + Math.cos(angle) * distance / 5,
        y: bubble.y + Math.sin(angle) * distance / 5,
        size: 3 + Math.random() * 6,
        speed: 0.05 + Math.random() * 0.25,
        opacity: 0.2 + Math.random() * 0.3,
        hue: bubble.hue + Math.random() * 10 - 5,
        tiny: true,
        angle: angle,
        distance: distance,
      });
    }
    
    // Remove the original bubble and add tiny ones
    setBubbles(prev => [...prev.filter(b => b.id !== id), ...tinyBubbles]);
    
    // Remove tiny bubbles after a short time
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => !tinyBubbles.some(tb => tb.id === b.id)));
    }, 2500);
  };
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Animated bubbles */}
      <div className="absolute inset-0 z-0">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              opacity: bubble.opacity,
              background: bubble.tiny 
                ? `hsla(${bubble.hue}, 80%, 70%, 0.4)` 
                : `radial-gradient(circle at 30% 30%, hsla(${bubble.hue}, 100%, 90%, 0.8), hsla(${bubble.hue}, 80%, 50%, 0.6))`,
              boxShadow: bubble.tiny 
                ? "none" 
                : "inset 0 0 10px rgba(255, 255, 255, 0.8), 0 0 5px rgba(0, 120, 255, 0.3)",
              transform: bubble.tiny 
                ? `translate(${Math.cos(bubble.angle) * bubble.distance * (Date.now() % 2500) / 2500}px, ${Math.sin(bubble.angle) * bubble.distance * (Date.now() % 2500) / 2500}px)` 
                : `scale(${1 + Math.sin(Date.now() / 3000 + bubble.id) * 0.05})`,
              transition: bubble.tiny ? "none" : "transform 2s ease",
            }}
            onClick={() => {
              if (!bubble.tiny) {
                popBubble(bubble.id);
              }
            }}
          />
        ))}
      </div>
      
      {/* Special effect: Subtle wave background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#81c3fd" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4a90e2" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path 
            className="wave-path-1" 
            fill="url(#wave-gradient)" 
            d="M0,50 C100,100 200,0 300,50 C400,100 500,0 600,50 C700,100 800,0 900,50 C1000,100 1100,0 1200,50 V200 H0 V50Z"
          />
          <path 
            className="wave-path-2" 
            fill="url(#wave-gradient)" 
            opacity="0.5"
            d="M0,70 C150,20 250,120 350,70 C450,20 550,120 650,70 C750,20 850,120 950,70 C1050,20 1150,120 1250,70 V220 H0 V70Z"
          />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <ProjectListings />
        <Footer />
      </div>
      
      {/* Special effect: Floating light dots */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute bg-blue-100 rounded-full animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              width: `${3 + Math.random() * 8}px`,
              height: `${3 + Math.random() * 8}px`,
              animation: `float ${20 + Math.random() * 40}s infinite linear`,
              animationDelay: `${Math.random() * 20}s`,
              filter: "blur(1px)",
            }}
          />
        ))}
      </div>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(30px, -30px);
          }
          50% {
            transform: translate(0, -60px);
          }
          75% {
            transform: translate(-30px, -30px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        .animate-float {
          animation: float 25s infinite ease-in-out;
        }
        
        .wave-path-1 {
          animation: wave1 20s infinite linear;
          transform-origin: center;
        }
        
        .wave-path-2 {
          animation: wave2 15s infinite linear;
          transform-origin: center;
        }
        
        @keyframes wave1 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-300px);
          }
        }
        
        @keyframes wave2 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(300px);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;