import { TuziImageModel } from "./tuzi-image-model";

export interface TuziProviderSettings {
  apiKey: string;
  baseURL?: string;
}

export class TuziProvider {
  readonly name = "tuzi";
  
  constructor(private settings: TuziProviderSettings) {}
  
  image(model: string) {
    return new TuziImageModel(model, this.settings);
  }
}

export function createTuzi(settings: TuziProviderSettings) {
  return new TuziProvider(settings);
}

// 默认实例，使用环境变量
export const tuzi = createTuzi({
  apiKey: process.env.TUZI_API_KEY || "",
  baseURL: process.env.TUZI_BASE_URL || "https://api.tu-zi.com",
});


