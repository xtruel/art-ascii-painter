import React, { useEffect, useState, useRef } from 'react';

const MatrixGlobeBackground = () => {
  const [frame, setFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Matrix-style globe data - represents a 3D sphere in ASCII
  const globeFrames = [
    // Frame 0 - Front view
    [
      "     .-..--..--.                  ",
      "   .´  aiR---//  `.               ",
      " /   generatorAsc11  \\            ",
      "|  ░▒▓█ GLOBE █▓▒░   |           ",
      "|  ██████████████████ |           ",
      "|  ░▒▓█▓▒░▒▓█▓▒░▒▓█  |           ",
      " \\   ████ MATRIX ████  /          ",
      "   `.______________.'             ",
      "     `--´  `--´  `--´             "
    ],
    // Frame 1 - Slight rotation
    [
      "      ..--..--..                 ",
      "    .´ aiR---// `.               ",
      "  /  generatorAsc11 \\            ",
      " |  ▒▓█ GLOBE █▓▒   |            ",
      " |  █████████████████|            ",
      " |  ▓▒░▒▓█▓▒░▒▓█▓▒░ |            ",
      "  \\  ███ MATRIX ███ /            ",
      "    `.____________.'              ",
      "      `--´ `--´ `--´              "
    ],
    // Frame 2 - More rotation
    [
      "       .--..--..                 ",
      "     .´aiR---//`.                ",
      "   / generatorAsc11\\             ",
      "  |  ▓█ GLOBE █▓  |              ",
      "  |  ████████████ |              ",
      "  |  ▒░▒▓█▓▒░▒▓█  |              ",
      "   \\ ██ MATRIX ██/               ",
      "     `.__________.'               ",
      "       `--´`--´`--´               "
    ],
    // Frame 3 - Side view
    [
      "        .--..--.                 ",
      "      .´aiR---//.                ",
      "    / generator \\                ",
      "   |  █ GLOBE █ |                ",
      "   |  ██████████|                ",
      "   |  ░▒▓█▓▒░▒▓ |                ",
      "    \\ █ MATRIX █/                ",
      "      `.______.'                 ",
      "        `--´`--´                 "
    ]
  ];

  // Matrix rain characters
  const matrixChars = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ',
    '█', '▓', '▒', '░', '▄', '▀', '■', '□', '▲', '△',
    '/', '\\', '|', '-', '_', '*', '#', '@', '$', '%'
  ];

  // Java-style globe rotation algorithm (converted to TypeScript)
  const generateGlobePoint = (theta: number, phi: number, radius: number = 10) => {
    // Convert spherical coordinates to cartesian (Java Math.sin/cos style)
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    // Project 3D to 2D (simple orthographic projection)
    const screenX = Math.floor(x + 15);
    const screenY = Math.floor(y + 8);
    
    return { x: screenX, y: screenY, z };
  };

  // Matrix rain effect
  const [matrixColumns, setMatrixColumns] = useState<Array<{
    x: number;
    y: number;
    speed: number;
    char: string;
    opacity: number;
  }>>([]);

  useEffect(() => {
    // Initialize matrix rain columns
    const cols = [];
    for (let i = 0; i < 50; i++) {
      cols.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: Math.random() * 2 + 1,
        char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
        opacity: Math.random() * 0.7 + 0.3
      });
    }
    setMatrixColumns(cols);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 32);
      
      // Update matrix rain
      setMatrixColumns(prev => prev.map(col => ({
        ...col,
        y: (col.y + col.speed) % 110,
        char: Math.random() > 0.95 ? 
          matrixChars[Math.floor(Math.random() * matrixChars.length)] : 
          col.char,
        opacity: Math.random() > 0.98 ? Math.random() * 0.7 + 0.3 : col.opacity
      })));
    }, 150);
    
    return () => clearInterval(interval);
  }, []);

  // Get current globe frame
  const currentGlobe = globeFrames[Math.floor(frame / 8) % globeFrames.length];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Matrix Rain Background */}
      <div className="absolute inset-0">
        {matrixColumns.map((col, i) => (
          <div
            key={i}
            className="absolute text-xs font-mono text-green-400"
            style={{
              left: `${col.x}%`,
              top: `${col.y}%`,
              opacity: col.opacity * 0.3,
              animation: `matrix-fall ${3 + col.speed}s linear infinite`,
              textShadow: '0 0 5px currentColor'
            }}
          >
            {col.char}
          </div>
        ))}
      </div>

      {/* Rotating Globe Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="text-xs font-mono text-primary leading-none opacity-40"
          style={{
            transform: `rotateY(${frame * 11.25}deg)`,
            filter: 'drop-shadow(0 0 10px currentColor)',
            textShadow: '0 0 20px currentColor'
          }}
        >
          {currentGlobe.map((line, i) => (
            <div key={i} className="text-center whitespace-pre">
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Code Fragments */}
      <div className="absolute top-10 left-10 text-xs font-mono text-accent/30 animate-pulse">
        <div>public class GlobeMatrix {`{`}</div>
        <div>  float theta = {frame * 0.1}f;</div>
        <div>  rotate3D(theta, PI/2);</div>
        <div>{`}`}</div>
      </div>

      <div className="absolute top-20 right-10 text-xs font-mono text-secondary/30 animate-pulse">
        <div>// ASCII Generator Core</div>
        <div>Matrix globe = new Matrix();</div>
        <div>globe.rotate({frame}°);</div>
        <div>render(ASCII_ART);</div>
      </div>

      {/* Corner Code Snippets */}
      <div className="absolute bottom-20 left-10 text-xs font-mono text-purple-400/20 leading-tight">
        <div className="animate-pulse">
          <div>int[] vertices = {`{`}</div>
          <div>  {Math.sin(frame * 0.1).toFixed(2)}, {Math.cos(frame * 0.1).toFixed(2)},</div>
          <div>  {Math.sin(frame * 0.15).toFixed(2)}, {Math.cos(frame * 0.15).toFixed(2)}</div>
          <div>{`};`}</div>
        </div>
      </div>

      <div className="absolute bottom-10 right-20 text-xs font-mono text-cyan-400/20">
        <div 
          className="transform transition-transform duration-300"
          style={{ transform: `scale(${1 + Math.sin(frame * 0.2) * 0.1})` }}
        >
          <div>// aiR---//generatorAsc11...!!</div>
          <div>System.out.println("MATRIX_GLOBE");</div>
          <div>Thread.sleep({frame * 10}ms);</div>
        </div>
      </div>

      {/* Orbital Elements */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-xs font-mono text-accent/20"
          style={{
            top: `${50 + Math.sin((frame + i * 60) * 0.05) * 30}%`,
            left: `${50 + Math.cos((frame + i * 60) * 0.05) * 40}%`,
            transform: `rotate(${frame * (i + 1) * 2}deg)`,
          }}
        >
          {['▲', '●', '◆', '▼', '○', '◇'][i]}
        </div>
      ))}

      {/* CSS Animation Styles */}
      <style>{`
        @keyframes matrix-fall {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MatrixGlobeBackground;