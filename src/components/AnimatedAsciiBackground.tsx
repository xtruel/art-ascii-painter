import React, { useEffect, useState } from 'react';

const AnimatedAsciiBackground = () => {
  const [frame, setFrame] = useState(0);
  
  const cuteAsciiArt = [
    // Cute anime-style faces
    "(◕‿◕)",
    "(｡◕‿◕｡)",
    "ヽ(°〇°)ﾉ",
    "(≧▽≦)",
    "(´｡• ᵕ •｡`)",
    "♡(˃͈ દ ˂͈ ༶ )",
    // Decorative patterns
    "✧･ﾟ: *✧･ﾟ:*",
    "｡･:*:･ﾟ★,｡･:*:･ﾟ☆",
    "▄▀▄▀▄▀▄▀▄",
    "░▒▓█▓▒░",
    "◆◇◆◇◆◇◆",
    "∞∞∞∞∞∞∞",
  ];

  const rotatingGlobe = [
    "     ●○●○●     ",
    "   ●○●○●○●   ",
    " ●○●○●○●○● ",
    "●○●○●○●○●○●",
    " ●○●○●○●○● ",
    "   ●○●○●○●   ",
    "     ●○●○●     ",
  ];

  const movingPattern = [
    "///////////////////%&\"%\"%",
    "/////////////////%&\"%\"%//",
    "///////////////%&\"%\"%////",
    "/////////////%&\"%\"%//////",
    "///////////%&\"%\"%////////",
    "/////////%&\"%\"%//////////",
    "///////%&\"%\"%////////////",
    "/////%&\"%\"%//////////////",
    "///%&\"%\"%////////////////",
    "/%&\"%\"%//////////////////",
    "&\"%\"%////////////////////",
    "\"%\"//////////////////////",
    "%////////////////////////",
    "/////////////////////////",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 20);
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
      {/* Top floating decorations */}
      <div className="absolute top-4 left-4 text-xs font-mono text-accent animate-pulse">
        {cuteAsciiArt[frame % cuteAsciiArt.length]}
      </div>
      
      <div className="absolute top-4 right-4 text-xs font-mono text-primary animate-bounce">
        {cuteAsciiArt[(frame + 3) % cuteAsciiArt.length]}
      </div>
      
      {/* Moving pattern across top */}
      <div className="absolute top-0 left-0 w-full text-xs font-mono text-accent/30 whitespace-nowrap overflow-hidden">
        <div 
          className="inline-block animate-pulse transition-transform duration-300"
          style={{ transform: `translateX(-${(frame * 20) % 100}px)` }}
        >
          {movingPattern[frame % movingPattern.length]}
        </div>
      </div>
      
      {/* Rotating globe in corner */}
      <div className="absolute bottom-4 left-4 text-xs font-mono text-secondary leading-none">
        <div className="transform transition-transform duration-300" 
             style={{ transform: `rotate(${frame * 18}deg)` }}>
          {rotatingGlobe.map((line, i) => (
            <div key={i} className="text-center">{line}</div>
          ))}
        </div>
      </div>
      
      {/* Bottom right cute decoration */}
      <div className="absolute bottom-4 right-4 text-sm font-mono text-purple-400 animate-pulse">
        ◇◆ aiR---//generatorAsc11...!! ◆◇
      </div>
      
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute text-xs font-mono text-accent/40 animate-pulse"
          style={{
            top: `${20 + (i * 10)}%`,
            left: `${10 + (i * 11)}%`,
            animationDelay: `${i * 0.2}s`,
            transform: `translateY(${Math.sin((frame + i) * 0.3) * 10}px)`,
          }}
        >
          {['★', '☆', '◆', '◇', '●', '○', '▲', '△'][i]}
        </div>
      ))}
      
      {/* Side decorative borders */}
      <div className="absolute left-0 top-1/4 h-1/2 text-xs font-mono text-accent/20 transform -rotate-90 origin-left">
        ▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀
      </div>
      
      <div className="absolute right-0 top-1/4 h-1/2 text-xs font-mono text-accent/20 transform rotate-90 origin-right">
        ▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀
      </div>
    </div>
  );
};

export default AnimatedAsciiBackground;