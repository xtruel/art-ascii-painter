import React, { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RAMPS, generateAsciiFromText, imageDataToASCII } from "@/lib/ascii";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Copy, 
  Maximize2, 
  Minimize2, 
  Shuffle, 
  Sun, 
  Moon,
  Upload,
  Palette
} from "lucide-react";

type ColorKey = "white" | "yellow" | "red" | "lime" | "blue" | "purple";
type ThemeMode = "dark" | "light";

const colorTokenMap: Record<ColorKey, string> = {
  white: "hsl(var(--ascii-white))",
  yellow: "hsl(var(--ascii-yellow))",
  red: "hsl(var(--ascii-red))",
  lime: "hsl(var(--ascii-lime))",
  blue: "hsl(var(--ascii-blue))",
  purple: "hsl(var(--ascii-purple))",
};

const darkModeColors: ColorKey[] = ["white", "yellow", "blue", "red", "lime", "purple"];
const lightModeColors: ColorKey[] = ["white", "red", "lime", "purple", "yellow", "blue"];

const AsciiArtMaker = () => {
  const [text, setText] = useState("ASCII");
  const [asciiArt, setAsciiArt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"text" | "image">("text");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  
  // Generation parameters
  const [columns, setColumns] = useState(80);
  const [aspectRatio, setAspectRatio] = useState(1.8);
  const [ramp, setRamp] = useState<keyof typeof RAMPS>("detailed");
  const [invert, setInvert] = useState(false);
  const [color, setColor] = useState<ColorKey>("white");
  const [previewSize, setPreviewSize] = useState(0.8);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const currentColors = theme === "dark" ? darkModeColors : lightModeColors;

  const randomizeControls = useCallback(() => {
    setColumns(Math.floor(Math.random() * 80) + 20);
    setAspectRatio(Math.random() * 2 + 0.5);
    const keys = Object.keys(RAMPS) as Array<keyof typeof RAMPS>;
    setRamp(keys[Math.floor(Math.random() * keys.length)]);
    setInvert(Math.random() > 0.5);
    const availableColors = currentColors;
    setColor(availableColors[Math.floor(Math.random() * availableColors.length)]);
  }, [currentColors]);

  const applyStyle = useCallback((styleType: string) => {
    const availableColors = currentColors;
    
    switch(styleType) {
      case "RETRO":
        setColumns(60 + Math.floor(Math.random() * 20));
        setAspectRatio(1.5 + Math.random() * 0.5);
        setRamp("blocks");
        setInvert(false);
        setColor(theme === "dark" ? "lime" : "red");
        setPreviewSize(1.2);
        break;
        
      case "MINIMAL":
        setColumns(40 + Math.floor(Math.random() * 15));
        setAspectRatio(2.0 + Math.random() * 0.3);
        setRamp("smooth");
        setInvert(Math.random() > 0.7);
        setColor(theme === "dark" ? "white" : "white");
        setPreviewSize(1.0);
        break;
        
      case "DENSE":
        setColumns(90 + Math.floor(Math.random() * 30));
        setAspectRatio(1.0 + Math.random() * 0.8);
        setRamp("detailed");
        setInvert(Math.random() > 0.6);
        setColor(availableColors[Math.floor(Math.random() * availableColors.length)]);
        setPreviewSize(0.8);
        break;
        
      case "NEON":
        setColumns(70 + Math.floor(Math.random() * 20));
        setAspectRatio(1.8 + Math.random() * 0.4);
        setRamp("symbols");
        setInvert(true);
        setColor(theme === "dark" ? "purple" : "purple");
        setPreviewSize(1.1);
        break;
        
      case "CYBER":
        setColumns(55 + Math.floor(Math.random() * 25));
        setAspectRatio(1.6 + Math.random() * 0.6);
        setRamp("binary");
        setInvert(Math.random() > 0.5);
        setColor(theme === "dark" ? "blue" : "blue");
        setPreviewSize(1.3);
        break;
        
      default:
        randomizeControls();
    }
  }, [currentColors, theme, randomizeControls]);

  const measureCharAspect = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 2;

    const fontSize = 12 * previewSize;
    ctx.font = `${fontSize}px monospace`;
    const metrics = ctx.measureText("M");
    return fontSize / (metrics.width || fontSize / 2);
  }, [previewSize]);

  const rasterImageToAscii = useCallback(
    (imgEl: HTMLImageElement) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      canvas.width = imgEl.naturalWidth || imgEl.width;
      canvas.height = imgEl.naturalHeight || imgEl.height;
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const rampStr = RAMPS[ramp] || RAMPS.detailed;
      const charAspect = measureCharAspect();

      const aspectRatio = canvas.width / canvas.height;
      const isSquareish = Math.abs(aspectRatio - 1) < 0.3;
      
      let targetCols: number;
      
      if (isSquareish) {
        targetCols = Math.floor(Math.min(100, Math.max(40, columns * 0.8)));
      } else {
        if (aspectRatio > 1.5) {
          targetCols = Math.floor(Math.min(120, Math.max(60, columns)));
        } else if (aspectRatio < 0.7) {
          targetCols = Math.floor(Math.min(80, Math.max(40, columns * 0.7)));
        } else {
          targetCols = Math.floor(Math.min(100, Math.max(50, columns * 0.9)));
        }
      }

      return imageDataToASCII(imgData, canvas.width, canvas.height, targetCols, rampStr, invert, charAspect, { gamma: 0.9, samples: 3 });
    },
    [ramp, invert, columns, measureCharAspect]
  );

  const onGenerate = useCallback(async () => {
    setIsLoading(true);
    try {
      if (mode === "text") {
        const result = generateAsciiFromText({ text, cols: columns, rampKey: ramp, invert, aspect: aspectRatio });
        setAsciiArt(result);
      } else if (imageFile) {
        const img = new Image();
        img.onload = () => {
          const result = rasterImageToAscii(img);
          setAsciiArt(result);
          setIsLoading(false);
        };
        img.src = URL.createObjectURL(imageFile);
        return;
      }
    } catch (error) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation failed",
        description: "Please try again with different settings.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [mode, text, imageFile, columns, aspectRatio, ramp, invert, rasterImageToAscii, toast]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(asciiArt);
    toast({
      title: "Copied!",
      description: "ASCII art copied to clipboard.",
    });
  }, [asciiArt, toast]);

  const onDownload = useCallback(() => {
    const blob = new Blob([asciiArt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [asciiArt]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const calculateOptimalDisplay = useMemo(() => {
    if (!asciiArt) return { fontSize: 12, width: "100%", height: "auto" };

    const lines = asciiArt.split("\n");
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const lineCount = lines.length;

    const containerWidth = isFullscreen ? window.innerWidth - 40 : 600;
    const containerHeight = isFullscreen ? window.innerHeight - 40 : 400;

    const fontSizeByWidth = (containerWidth * 0.9) / (maxLineLength * 0.6);
    const fontSizeByHeight = (containerHeight * 0.9) / (lineCount * 1.2);
    
    const fontSize = Math.max(6, Math.min(fontSizeByWidth, fontSizeByHeight)) * previewSize;

    return {
      fontSize: Math.round(fontSize),
      width: "100%",
      height: "auto",
    };
  }, [asciiArt, isFullscreen, previewSize]);

  const themeBackgroundClass = theme === "dark" 
    ? "bg-[hsl(var(--theme-dark-bg))]" 
    : "bg-[hsl(var(--theme-light-bg))]";

  const themeTextClass = theme === "dark" ? "text-white" : "text-white";
  const surfaceClass = theme === "dark" 
    ? "bg-[hsl(var(--theme-dark-surface))]" 
    : "bg-[hsl(var(--theme-light-surface))]";

  return (
    <div className={`min-h-screen w-full flex ${themeBackgroundClass} ${themeTextClass}`}>
      {/* Sidebar */}
      <div className={`w-80 ${surfaceClass} border-r border-border/20 p-4 overflow-y-auto`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-pixel text-white">ASCII Generator</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-white hover:text-white"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={mode} onValueChange={(value) => setMode(value as "text" | "image")}>
            <TabsList className="grid w-full grid-cols-3 bg-background/10">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="text-input" className="text-sm font-medium text-white">Text to Convert</Label>
                <Textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your text..."
                  className="mt-1 bg-background/10 border-border/30 text-white"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-white">Aspect Ratio: {aspectRatio.toFixed(1)}</Label>
                <Slider
                  value={[aspectRatio]}
                  onValueChange={(value) => setAspectRatio(value[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-white">Upload Image</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full text-white border-white/20 hover:bg-white/10"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {imageFile ? imageFile.name : "Choose Image"}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-white">Aspect Ratio: {aspectRatio.toFixed(1)}</Label>
                <Slider
                  value={[aspectRatio]}
                  onValueChange={(value) => setAspectRatio(value[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {imageFile && (
                <div className="rounded-lg overflow-hidden border border-border/30">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-white">Character Set</Label>
                <Select value={ramp} onValueChange={(value) => setRamp(value as keyof typeof RAMPS)}>
                  <SelectTrigger className="mt-1 bg-background/10 border-border/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(RAMPS).map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-white">Text Color</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {currentColors.map((colorKey) => (
                    <button
                      key={colorKey}
                      onClick={() => setColor(colorKey)}
                      className={`h-8 rounded border-2 transition-all ${
                        color === colorKey ? "border-white" : "border-border/30"
                      }`}
                      style={{ backgroundColor: colorTokenMap[colorKey] }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">Invert</Label>
                <Switch checked={invert} onCheckedChange={setInvert} />
              </div>

              <div>
                <Label className="text-sm font-medium text-white">Preview Size: {Math.round(previewSize * 100)}%</Label>
                <Slider
                  value={[previewSize]}
                  onValueChange={(value) => setPreviewSize(value[0])}
                  min={0.3}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={onGenerate} 
              disabled={isLoading}
              className="w-full bg-brand hover:bg-brand/90 text-white"
            >
              {isLoading ? "Generating..." : "Generate ASCII"}
            </Button>

            {/* Style Presets */}
            <div className="space-y-2">
              <Label className="text-xs text-white/80 font-semibold">STYLE PRESETS</Label>
              <div className="grid grid-cols-1 gap-1">
                {["RETRO", "MINIMAL", "DENSE", "NEON", "CYBER"].map((style) => (
                  <Button 
                    key={style}
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyStyle(style)}
                    className="text-white border-white/20 hover:bg-white/10 text-xs font-mono"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={randomizeControls} className="text-white border-white/20 hover:bg-white/10">
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onCopy} disabled={!asciiArt} className="text-white border-white/20 hover:bg-white/10">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onDownload} disabled={!asciiArt} className="text-white border-white/20 hover:bg-white/10">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 bg-background/5 border-b border-border/20 flex items-center justify-between px-4">
          <span className="text-sm font-medium text-white">ASCII Preview</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-white hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Preview Container */}
        <div className="flex-1 p-4">
          <Card className={`h-full bg-background/5 border-border/20 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            <div className="h-full flex items-center justify-center p-4">
              {asciiArt ? (
                <pre
                  className="font-mono whitespace-pre leading-none overflow-auto max-w-full max-h-full"
                  style={{
                    color: colorTokenMap[color],
                    fontSize: `${calculateOptimalDisplay.fontSize}px`,
                    lineHeight: "1.1",
                  }}
                >
                  {asciiArt}
                </pre>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Palette className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-white">No ASCII art generated yet</p>
                  <p className="text-sm text-white/70">Use the sidebar to create your ASCII art</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AsciiArtMaker;