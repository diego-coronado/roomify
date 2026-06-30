import puter from "@heyputer/puter.js";
import {
  ROOMIFY_MODIFY_PROMPT_TEMPLATE,
  ROOMIFY_RENDER_PROMPT,
} from "./constants";

export const fetchAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getImagePayload = async (sourceImage: string) => {
  const dataUrl = sourceImage.startsWith("data:")
    ? sourceImage
    : await fetchAsDataUrl(sourceImage);

  const base64Data = dataUrl.split(",")[1];
  const mimeType = dataUrl.split(";")[0].split(":")[1];

  if (!mimeType || !base64Data) throw new Error("Invalid source image payload");

  return { base64Data, mimeType };
};

const resolveRenderedImage = async (response: unknown) => {
  const rawImageUrl = (response as HTMLImageElement | { src?: string }).src ?? null;

  if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

  const renderedImage = rawImageUrl.startsWith("data:")
    ? rawImageUrl
    : await fetchAsDataUrl(rawImageUrl);

  return { renderedImage, renderedPath: undefined };
};

export const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
  const { base64Data, mimeType } = await getImagePayload(sourceImage);

  const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
    provider: "gemini",
    model: "gemini-2.5-flash-image-preview",
    input_image: base64Data,
    input_image_mime_type: mimeType,
    ratio: { w: 1024, h: 1024 },
  });

  return resolveRenderedImage(response);
};

export const modify3DView = async ({
  sourceImage,
  instruction,
}: ModifyRenderParams): Promise<ModifyRenderResult> => {
  const normalizedInstruction = instruction.trim();

  if (!normalizedInstruction) {
    throw new Error("A change request is required.");
  }

  const { base64Data, mimeType } = await getImagePayload(sourceImage);
  const prompt = ROOMIFY_MODIFY_PROMPT_TEMPLATE.replace(
    "{instruction}",
    normalizedInstruction,
  );

  const response = await puter.ai.txt2img(prompt, {
    provider: "gemini",
    model: "gemini-2.5-flash-image-preview",
    input_image: base64Data,
    input_image_mime_type: mimeType,
    ratio: { w: 1024, h: 1024 },
  });

  return resolveRenderedImage(response);
};
