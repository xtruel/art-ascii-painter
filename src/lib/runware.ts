export interface GenerateImageParams {
  positivePrompt: string;
  model?: string;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  promptWeighting?: "compel" | "sdEmbeds";
  seed?: number | null;
  lora?: string[];
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
  NSFWContent: boolean;
}

const API_ENDPOINT = "wss://ws-api.runware.ai/v1";

export class RunwareService {
  private ws: WebSocket | null = null;
  private apiKey: string | null = null;
  private connectionSessionUUID: string | null = null;
  private messageCallbacks: Map<string, (data: any) => void> = new Map();
  private isAuthenticated: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.connectionPromise = this.connect();
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(API_ENDPOINT);

      this.ws.onopen = () => {
        this.authenticate().then(resolve).catch(reject);
      };

      this.ws.onmessage = (event) => {
        const response = JSON.parse(event.data as string);
        if (response.error || response.errors) {
          console.error("Runware error:", response);
          return;
        }
        if (response.data) {
          response.data.forEach((item: any) => {
            if (item.taskType === "authentication") {
              this.connectionSessionUUID = item.connectionSessionUUID;
              this.isAuthenticated = true;
            } else {
              const cb = this.messageCallbacks.get(item.taskUUID);
              if (cb) {
                cb(item);
                this.messageCallbacks.delete(item.taskUUID);
              }
            }
          });
        }
      };

      this.ws.onerror = (err) => {
        console.error("Runware WS error", err);
        reject(err);
      };

      this.ws.onclose = () => {
        this.isAuthenticated = false;
        setTimeout(() => {
          this.connectionPromise = this.connect();
        }, 1000);
      };
    });
  }

  private authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not ready"));
        return;
      }
      const authMessage = [
        {
          taskType: "authentication",
          apiKey: this.apiKey,
          ...(this.connectionSessionUUID && { connectionSessionUUID: this.connectionSessionUUID }),
        },
      ];

      const authCallback = (event: MessageEvent) => {
        try {
          const response = JSON.parse((event as any).data);
          if (response.data?.[0]?.taskType === "authentication") {
            this.ws?.removeEventListener("message", authCallback as any);
            resolve();
          }
        } catch {}
      };

      this.ws.addEventListener("message", authCallback as any);
      this.ws.send(JSON.stringify(authMessage));
    });
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    await this.connectionPromise;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
      this.connectionPromise = this.connect();
      await this.connectionPromise;
    }

    const taskUUID = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const message: any[] = [
        {
          taskType: "imageInference",
          taskUUID,
          model: params.model || "runware:100@1",
          width: 768,
          height: 768,
          numberResults: params.numberResults || 1,
          outputFormat: params.outputFormat || "WEBP",
          steps: 4,
          CFGScale: params.CFGScale || 1,
          scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
          strength: params.strength || 0.8,
          lora: params.lora || [],
          ...params,
        },
      ];

      if (!params.seed) delete message[0].seed;
      if (message[0].model === "runware:100@1") delete message[0].promptWeighting;

      this.messageCallbacks.set(taskUUID, (data) => {
        if (data.error) {
          reject(new Error(data.errorMessage));
        } else {
          resolve(data as GeneratedImage);
        }
      });

      this.ws!.send(JSON.stringify(message));
    });
  }
}
