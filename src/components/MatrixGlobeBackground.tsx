import React, { useEffect, useState } from 'react';

const SidebarJavaGlobe = () => {
  const [frame, setFrame] = useState(0);

  // Simple globe frames - classic Java style
  const globeFrames = [
    [
      "   .-..--..--.   ",
      " .´           `. ",
      "/  ASCII        \\",
      "| GENERATOR      |",
      "\\    GLOBE      /",
      " `.___________.' ",
      "   `--´`--´`--´  "
    ],
    [
      "    .--..--..    ",
      "  .´          `. ",
      " /  ASCII       \\",
      "|  GENERATOR     |",
      " \\   GLOBE      /",
      "  `.__________.' ",
      "    `--´`--´`--´ "
    ],
    [
      "     .--..--.    ",
      "   .´        `.  ",
      "  /  ASCII     \\ ",
      " |  GENERATOR   |",
      "  \\  GLOBE     / ",
      "   `.________.´  ",
      "     `--´`--´    "
    ]
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 24);
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  const currentGlobe = globeFrames[Math.floor(frame / 8) % globeFrames.length];

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
      {/* Java Code Header */}
      <div className="text-xs font-mono text-accent/80 mb-4">
        <div>// AsciiGenerator.java</div>
        <div>public class Globe {`{`}</div>
      </div>

      {/* Rotating Globe */}
      <div className="mb-4">
        <div 
          className="text-sm font-mono text-primary leading-tight text-center"
          style={{
            transform: `rotateY(${frame * 15}deg)`,
            filter: 'drop-shadow(0 0 8px currentColor)',
          }}
        >
          {currentGlobe.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Java Code Footer */}
      <div className="text-xs font-mono text-accent/80">
        <div>  rotate({frame}°);</div>
        <div>  print("Hello!");</div>
        <div>{`}`}</div>
      </div>

      {/* Floating dots around globe */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute text-sm font-mono text-secondary/60"
          style={{
            top: `${20 + i * 25}%`,
            left: `${-10 + i * 15}px`,
            transform: `translateY(${Math.sin((frame + i * 8) * 0.3) * 8}px)`,
          }}
        >
          ●
        </div>
      ))}
    </div>
  );
};

export default SidebarJavaGlobe;