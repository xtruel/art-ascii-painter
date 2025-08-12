export const RAMPS: Record<string, string> = {
  blocks: " .:-=+*#%@",
  detailed:
    " .'`\",:;Il!i><~+_-?][}{1)(|\\/*tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  smooth: " .'`\",:;~-_=+*#%@",
  heavy: " ░▒▓█",
  sharp: " .,:;!ilI|/\\\tfxjrvnczXYUJCLQ0OZmwqpdbkhao#MW&8%B@$",
  symbols: " .'`^\"~,.:;_-+=*|/\\()[]{}<>!?%$#@&£€¥§°•·=÷×|~'\"-+_<>/\\",
};

export interface GenerateAsciiParams {
  text: string;
  cols: number; // 40 - 320 typical
  rampKey: keyof typeof RAMPS;
  invert: boolean;
  aspect: number; // 1.0 - 3.0
}

function rasterizeTextToCanvas(text: string, W = 1000, H = 360): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // background white for consistent luminance mapping
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Start with large font size and shrink if needed
  let baseSize = 200;
  ctx.font = `${baseSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace`;
  let m = ctx.measureText(text || " ");
  if (m.width > W * 0.9) {
    const scale = (W * 0.9) / Math.max(1, m.width);
    baseSize = Math.max(12, Math.floor(baseSize * scale));
    ctx.font = `${baseSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace`;
    m = ctx.measureText(text || " ");
  }

  ctx.fillStyle = "#000000";
  const x = Math.floor((W - m.width) / 2);
  const y = Math.floor((H + baseSize * 0.75) / 2);
  ctx.fillText(text || " ", x, y);
  return canvas;
}

export function imageDataToASCII(
  imgData: ImageData,
  w: number,
  h: number,
  cols: number,
  ramp: string,
  invert = false,
  aspect = 2.0,
  options?: { gamma?: number; samples?: number }
): string {
  cols = Math.max(1, Math.min(800, cols | 0));
  const cellW = w / cols;
  const cellH = Math.max(0.000001, cellW * aspect);
  const rows = Math.max(1, Math.floor(h / cellH));

  const rampChars = ramp.split("");
  const L = rampChars.length;
  const samples = Math.max(1, Math.min(6, options?.samples ?? 3));
  const gamma = options?.gamma ?? 1.0;

  const get = (x: number, y: number) => {
    const ix = Math.max(0, Math.min(w - 1, x | 0));
    const iy = Math.max(0, Math.min(h - 1, y | 0));
    const i = (iy * w + ix) * 4;
    const r = imgData.data[i];
    const g = imgData.data[i + 1];
    const b = imgData.data[i + 2];
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255; // luminance
  };

  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      // Average luminance over an s x s grid within the cell (box sampling)
      const startX = c * cellW;
      const startY = r * cellH;
      let sum = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = startX + ((sx + 0.5) / samples) * cellW;
          const py = startY + ((sy + 0.5) / samples) * cellH;
          sum += get(px, py);
        }
      }
      let v = sum / (samples * samples);
      if (invert) v = 1 - v;
      // gamma correction for better contrast without grain
      if (gamma !== 1) v = Math.max(0, Math.min(1, Math.pow(v, gamma)));

      const idx = Math.min(L - 1, Math.max(0, Math.round(v * (L - 1))));
      line += rampChars[idx];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function generateAsciiFromText(params: GenerateAsciiParams): string {
  const { text, cols, rampKey, invert, aspect } = params;
  const canvas = rasterizeTextToCanvas(text);
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const ramp = RAMPS[rampKey] || RAMPS.detailed;
  return imageDataToASCII(imgData, canvas.width, canvas.height, cols, ramp, invert, aspect);
}
