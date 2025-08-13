import React, { useEffect, useState } from 'react';

const SimpleJavaBackground = () => {
  const [frame, setFrame] = useState(0);

  // Simple globe frames - classic Java style
  const globeFrames = [
    [
      "    .-..--..--.    ",
      "  .´           `.  ",
      " /  ASCII        \\ ",
      "|  GENERATOR       |",
      " \\    GLOBE       / ",
      "  `.___________.'  ",
      "    `--´`--´`--´   "
    ],
    [
      "     .--..--..     ",
      "   .´          `.  ",
      "  /  ASCII       \\ ",
      " |  GENERATOR      |",
      "  \\   GLOBE       / ",
      "   `.__________.'   ",
      "     `--´`--´`--´   "
    ],
    [
      "      .--..--.     ",
      "    .´        `.   ",
      "   /  ASCII     \\  ",
      "  |  GENERATOR   | ",
      "   \\  GLOBE     /  ",
      "    `.________.´   ",
      "      `--´`--´     "
    ]
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 24);
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  const currentGlobe = globeFrames[Math.floor(frame / 8) % globeFrames.length];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1] opacity-30">
      
      {/* Simple Hello World Style Code */}
      <div className="absolute top-16 left-16 text-sm font-mono text-accent/60">
        <div>public class AsciiGenerator {`{`}</div>
        <div>    public static void main(String[] args) {`{`}</div>
        <div>        System.out.println("Hello ASCII World!");</div>
        <div>        rotate3D({frame}°);</div>
        <div>    {`}`}</div>
        <div>{`}`}</div>
      </div>

      {/* Rotating Globe Center */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="text-base font-mono text-primary/70 leading-tight text-center"
          style={{
            transform: `rotateY(${frame * 15}deg)`,
          }}
        >
          {currentGlobe.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Simple Title Animation */}
      <div 
        className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 text-xl font-mono text-secondary/50 text-center"
        style={{
          transform: `scale(${1 + Math.sin(frame * 0.2) * 0.1})`,
        }}
      >
        ASCII Generator
      </div>

      {/* Simple Corner Elements */}
      <div className="absolute top-20 right-20 text-sm font-mono text-purple-400/50">
        <div>// Simple Java Globe</div>
        <div>Thread.sleep(200);</div>
      </div>

      <div className="absolute bottom-20 left-20 text-sm font-mono text-cyan-400/50">
        <div>int rotation = {frame};</div>
        <div>globe.update();</div>
      </div>

      {/* Simple floating dots */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute text-lg font-mono text-accent/40"
          style={{
            top: `${30 + i * 20}%`,
            left: `${20 + i * 25}%`,
            transform: `translateY(${Math.sin((frame + i * 8) * 0.2) * 10}px)`,
          }}
        >
          ●
        </div>
      ))}
    </div>
  );
};

export default SimpleJavaBackground;