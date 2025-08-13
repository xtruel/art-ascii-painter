import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RAMPS, generateAsciiFromText, imageDataToASCII } from "@/lib/ascii";

import { toast } from "sonner";

const colorKeys = ["white", "yellow", "blue", "lime", "orange"] as const;

type ColorKey = typeof colorKeys[number];

const colorTokenMap: Record<ColorKey, string> = {
  white: "--ascii-white",
  yellow: "--ascii-yellow",
  blue: "--ascii-blue",
  lime: "--ascii-lime",
  orange: "--ascii-orange",
};

export default function AsciiArtMaker() {
  const [text, setText] = useState("HELLO WORLD");
  const [cols, setCols] = useState(150);
  const [ramp, setRamp] = useState<keyof typeof RAMPS>((RAMPS as any).symbols ? ("symbols" as keyof typeof RAMPS) : "detailed");
  const [invert, setInvert] = useState(true);
  const [aspect, setAspect] = useState(1.6);
  const [randomMode, setRandomMode] = useState(false);
  const [color, setColor] = useState<ColorKey>("white");
  const [ascii, setAscii] = useState<string>("");
  const [mode, setMode] = useState<"text" | "image">("image");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewSize, setPreviewSize] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const randomizeControls = () => {
    const keys = Object.keys(RAMPS) as Array<keyof typeof RAMPS>;
    const k = keys[Math.floor(Math.random() * keys.length)];
    setRamp(k);
    const c = Math.floor(80 + Math.random() * 160);
    setCols(c);
  };

  const measureCharAspect = () => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return aspect;
      const fontSize = previewSize; // px
      const lineH = 0.8; // matches <pre> style
      ctx.font = `${fontSize}px "Press Start 2P", "VT323", ui-monospace, Menlo, Consolas, monospace`;
      const charW = ctx.measureText("M").width || fontSize * 0.6;
      const charH = fontSize * lineH;
      const ratio = charH / Math.max(1, charW);
      return Math.max(0.6, Math.min(3, ratio));
    } catch {
      return aspect;
    }
  };

  const rasterImageToAscii = async (imgEl: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = imgEl.naturalWidth || imgEl.width;
    canvas.height = imgEl.naturalHeight || imgEl.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const rampStr = RAMPS[ramp] || RAMPS.detailed;
    const aspectEff = measureCharAspect();
    
    // Target max 7000 characters for good quantization
    const maxChars = 7000;
    const aspectRatio = canvas.width / canvas.height;
    
    // Calculate optimal dimensions within character limit
    let targetRows = Math.sqrt(maxChars / aspectRatio);
    let targetCols = targetRows * aspectRatio;
    
    // Ensure we stay within bounds and character limit
    targetRows = Math.floor(Math.min(100, targetRows));
    targetCols = Math.floor(Math.min(150, targetCols));
    
    // Verify total chars don't exceed limit
    if (targetRows * targetCols > maxChars) {
      const scale = Math.sqrt(maxChars / (targetRows * targetCols));
      targetRows = Math.floor(targetRows * scale);
      targetCols = Math.floor(targetCols * scale);
    }
    
    const dynCols = Math.max(40, targetCols);
    if (dynCols !== cols) setCols(dynCols);
    return imageDataToASCII(imgData, canvas.width, canvas.height, dynCols, rampStr, invert, aspectEff, { gamma: 0.9, samples: 3 });
  };

  const onGenerate = async () => {
    try {
      setLoading(true);
      if (randomMode) randomizeControls();

      if (mode === "text") {
        const out = generateAsciiFromText({ text, cols, rampKey: ramp, invert, aspect });
        setAscii(out);
        if (!out) toast.error("Failed to generate ASCII");
        return;
      }

      if (mode === "image") {
        if (!file) {
          toast.error("Choose an image");
          return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = URL.createObjectURL(file);
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error("Image load failed"));
        });
        const out = await rasterImageToAscii(img);
        setAscii(out);
        URL.revokeObjectURL(img.src);
        return;
      }

    } catch (e) {
      console.error(e);
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(ascii);
      toast.success("ASCII copied to clipboard");
    } catch (e) {
      toast.error("Copy failed");
    }
  };

  const onDownload = () => {
    const blob = new Blob([ascii], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ascii.txt";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("ascii.txt downloaded");
  };

  const textColor = `hsl(var(${colorTokenMap[color]}))`;

  return (
    <section aria-labelledby="maker-title" className="space-y-4 mx-auto max-w-3xl">
      <Card className="border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[var(--shadow-elegant,0_10px_30px_-10px_hsl(var(--primary)/0.2))]">
        <CardHeader>
          <CardTitle id="maker-title" className="text-base">AI ASCII Art Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-12 gap-3">
            <div className="md:col-span-6 space-y-2">
              {mode === "text" && (
                <>
                  <Label htmlFor="prompt">Enter your prompt here…</Label>
                  <div className="relative">
                    <Input
                      id="prompt"
                      placeholder="Enter your prompt…"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="h-9 text-sm pr-24"
                    />
                    <Button
                      size="sm"
                      className="absolute right-1 top-1"
                      onClick={onGenerate}
                      disabled={loading}
                    >
                      {loading ? "Generating…" : "Generate"}
                    </Button>
                  </div>
                </>
              )}
              {mode === "image" && (
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="flex items-center gap-2">
                    <Input id="image" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    <Button size="sm" onClick={onGenerate} disabled={loading}>
                      {loading ? "Generating…" : "Generate"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="md:col-span-6">
              <Button size="sm" variant="ghost" onClick={() => setShowAdvanced((v) => !v)}>
                {showAdvanced ? "Hide advanced" : "Advanced"}
              </Button>
            </div>
            <div className={`md:col-span-2 space-y-2 ${showAdvanced ? "" : "hidden"}`}>
              <Label>Columns</Label>
              <div className="px-1">
                <Slider value={[cols]} min={40} max={150} step={1} onValueChange={(v) => setCols(v[0] ?? cols)} />
                <div className="text-xs text-muted-foreground mt-1">{cols} cols</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="secondary" onClick={() => setCols((c) => Math.max(40, c - 30))}>-30</Button>
                  <Button size="sm" variant="secondary" onClick={() => setCols((c) => Math.min(150, c + 30))}>+30</Button>
                </div>
              </div>
            </div>
            <div className={`md:col-span-2 space-y-2 ${showAdvanced ? "" : "hidden"}`}>
              <Label>Aspect</Label>
              <div className="px-1">
                <Slider value={[aspect]} min={1.0} max={3.0} step={0.1} onValueChange={(v) => setAspect(Number(v[0] ?? aspect))} />
                <div className="text-xs text-muted-foreground mt-1">{aspect.toFixed(1)} h/w</div>
              </div>
            </div>
            <div className={`md:col-span-2 space-y-2 ${showAdvanced ? "" : "hidden"}`}>
              <Label>Preview size</Label>
              <div className="px-1">
                <Slider value={[previewSize]} min={2} max={14} step={1} onValueChange={(v) => setPreviewSize(Number(v[0] ?? previewSize))} />
                <div className="text-xs text-muted-foreground mt-1">{previewSize}px</div>
              </div>
            </div>
            <div className={`md:col-span-6 space-y-2 ${showAdvanced ? "" : "hidden"}`}>
              <Label>Character set</Label>
              <div className="flex flex-wrap gap-1">
                {Object.keys(RAMPS).map((k) => (
                  <Button
                    key={k}
                    size="sm"
                    variant={ramp === (k as keyof typeof RAMPS) ? "default" : "secondary"}
                    aria-pressed={ramp === (k as keyof typeof RAMPS)}
                    onClick={() => setRamp(k as keyof typeof RAMPS)}
                  >
                    {k}
                  </Button>
                ))}
              </div>
            </div>
            <div className={`md:col-span-2 space-y-2 ${showAdvanced ? "" : "hidden"}`}>
              <Label>Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "text" | "image")}>
                <SelectTrigger aria-label="Generation mode" className="h-9">
                  <SelectValue placeholder="Choose mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={`md:col-span-2 flex items-end gap-3 ${showAdvanced ? "" : "hidden"}`}>
              <div className="space-y-2">
                <Label htmlFor="invert">Invert</Label>
                <div className="flex items-center gap-2">
                  <Switch id="invert" checked={invert} onCheckedChange={setInvert} />
                  <span className="text-sm text-muted-foreground">{invert ? "On" : "Off"}</span>
                </div>
              </div>
            </div>
            <div className={`md:col-span-12 flex flex-wrap gap-2 items-end ${showAdvanced ? "" : "hidden"}`}>
              <Button size="sm" variant="secondary" onClick={() => setRandomMode((s) => !s)}>
                Random: {randomMode ? "ON" : "OFF"}
              </Button>
              <Button size="sm" variant="secondary" onClick={onCopy} disabled={!ascii}>
                Copy as text
              </Button>
              <Button size="sm" variant="secondary" onClick={onDownload} disabled={!ascii}>
                Save as TXT
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Foreground</Label>
                <div className="flex gap-1">
                  {colorKeys.map((ck) => (
                    <button
                      key={ck}
                      title={ck}
                      onClick={() => setColor(ck)}
                      className={`h-6 w-6 rounded-md border border-border aria-selected:ring-2 aria-selected:ring-ring`}
                      aria-selected={color === ck}
                      style={{ background: `hsl(var(${colorTokenMap[ck]}))` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div
            className="rounded-md border overflow-hidden w-[510px] h-[510px] mx-auto"
            style={{
              backgroundImage:
                `linear-gradient(to right, hsl(var(--border) / 0.2) 1px, transparent 1px),` +
                `linear-gradient(to bottom, hsl(var(--border) / 0.2) 1px, transparent 1px)`,
              backgroundSize: "12px 12px",
            }}
          >
            <pre
              className="font-ascii max-h-[45vh] whitespace-pre px-[7.5%] pt-[7.5%] pb-[15%]"
              style={{ color: textColor, fontSize: `${previewSize}px`, lineHeight: 0.8 }}
              aria-label="ASCII preview"
            >
              {ascii || ""}
            </pre>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
