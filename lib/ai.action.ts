import puter from "@heyputer/puter.js";
import {RENDERA_RENDER_PROMPT} from "./constants";


//FULL FLOW
// User uploads image
//         ↓
// Check: base64 or URL?
//         ↓
// Convert to base64 (if needed)
//         ↓
// Extract mime + data
//         ↓
// Send to AI
//         ↓
// AI generates image
//         ↓
// Get image URL
//         ↓
// Convert to base64
//         ↓
// Return result

//Convert any image URL → base64 (data URL)
export const fetchAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  //Blob = raw binary file (image in memory)
  const blob = await response.blob();

  return new Promise((resolve, reject) => {

    //Browser API to read files
    const reader = new FileReader();

    //onloadend: It runs when reading is finished
    // here 'as string' because result: string | ArrayBuffer | null;
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;

    //Converts blob → base64 string
    reader.readAsDataURL(blob);
  });
};

// Send image to AI → get rendered image back
export const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
    const dataUrl = sourceImage.startsWith('data:')
        ? sourceImage
        //here it will be url, if image, it will not come to this part
        : await fetchAsDataUrl(sourceImage);

    //extracting parts. eg: data:image/png;base64,AAAAAAA
    //mimeType: image/png and base64Data: AAAAAAA
    const base64Data = dataUrl.split(',')[1];
    const mimeType = dataUrl.split(';')[0].split(':')[1];

    if(!mimeType || !base64Data) throw new Error('Invalid source image payload');

    const response = await puter.ai.txt2img(RENDERA_RENDER_PROMPT, {
        provider: "gemini",
        model: "gemini-2.5-flash-image-preview",
        input_image: base64Data,
        input_image_mime_type: mimeType,
        ratio: { w: 1024, h: 1024 },
    });

    //response.src → actual image
    const rawImageUrl = (response as HTMLImageElement).src ?? null;

    if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

    //Convert output to base64
    const renderedImage = rawImageUrl.startsWith('data:')
    ? rawImageUrl : await fetchAsDataUrl(rawImageUrl);

    return { renderedImage, renderedPath: undefined };
}

