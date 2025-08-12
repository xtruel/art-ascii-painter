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
  const [cols, setCols] = useState(110);
  const [ramp, setRamp] = useState<keyof typeof RAMPS>((RAMPS as any).symbols ? ("symbols" as keyof typeof RAMPS) : "detailed");
  const [invert, setInvert] = useState(true);
  const [aspect, setAspect] = useState(2.0);
  const [randomMode, setRandomMode] = useState(true);
  const [color, setColor] = useState<ColorKey>("white");
  const [ascii, setAscii] = useState<string>("");
  const [mode, setMode] = useState<"text" | "image">("image");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const randomizeControls = () => {
    const keys = Object.keys(RAMPS) as Array<keyof typeof RAMPS>;
    const k = keys[Math.floor(Math.random() * keys.length)];
    setRamp(k);
    const c = Math.floor(80 + Math.random() * 160);
    setCols(c);
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
    return imageDataToASCII(imgData, canvas.width, canvas.height, cols, rampStr, invert, aspect);
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
    <section aria-labelledby="maker-title" className="space-y-4">
      <Card className="border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[var(--shadow-elegant,0_10px_30px_-10px_hsl(var(--primary)/0.2))]">
        <CardHeader>
          <CardTitle id="maker-title" className="text-base">Generate ASCII</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-12 gap-3">
            <div className="md:col-span-6 space-y-2">
              {mode === "text" && (
                <>
                  <Label htmlFor="prompt">Text prompt</Label>
                  <Input
                    id="prompt"
                    placeholder="Type something…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="h-9 text-sm"
                  />
                </>
              )}
              {mode === "image" && (
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <Input id="image" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </div>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Columns</Label>
              <div className="px-1">
                <Slider value={[cols]} min={40} max={320} step={1} onValueChange={(v) => setCols(v[0] ?? cols)} />
                <div className="text-xs text-muted-foreground mt-1">{cols} cols</div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Aspect</Label>
              <div className="px-1">
                <Slider value={[aspect]} min={1.0} max={3.0} step={0.1} onValueChange={(v) => setAspect(Number(v[0] ?? aspect))} />
                <div className="text-xs text-muted-foreground mt-1">{aspect.toFixed(1)} h/w</div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Ramp</Label>
              <Select value={ramp} onValueChange={(v) => setRamp(v as keyof typeof RAMPS)}>
                <SelectTrigger aria-label="Character ramp" className="h-9">
                  <SelectValue placeholder="Select ramp" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(RAMPS).map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
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
            <div className="md:col-span-2 flex items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="invert">Invert</Label>
                <div className="flex items-center gap-2">
                  <Switch id="invert" checked={invert} onCheckedChange={setInvert} />
                  <span className="text-sm text-muted-foreground">{invert ? "On" : "Off"}</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-12 flex flex-wrap gap-2 items-end">
              <Button size="sm" onClick={onGenerate} disabled={loading}>{loading ? "Generating…" : "Generate"}</Button>
              <Button size="sm" variant="secondary" onClick={() => setRandomMode((s) => !s)}>
                Random: {randomMode ? "ON" : "OFF"}
              </Button>
              <Button size="sm" variant="secondary" onClick={onCopy} disabled={!ascii}>
                Copy
              </Button>
              <Button size="sm" variant="secondary" onClick={onDownload} disabled={!ascii}>
                Download .txt
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Text color</Label>
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
          <pre
            className="font-pixel max-h-[45vh] overflow-auto whitespace-pre leading-[0.9] text-xs md:text-sm"
            style={{ color: textColor }}
            aria-label="ASCII preview"
          >
            {ascii || ""}
          </pre>
        </CardContent>
      </Card>
    </section>
  );
}
