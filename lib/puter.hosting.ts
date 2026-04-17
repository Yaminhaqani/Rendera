import puter from "@heyputer/puter.js";
import { createHostingSlug, fetchBlobFromUrl, getHostedUrl, getImageExtension, HOSTING_CONFIG_KEY, imageUrlToPngBlob, isHostedUrl } from "./utils";

export const getOrCreateHostingConfig = async (): Promise<HostingConfig | null> => {
  //only 1 domain is created and everything is saved there
    const existing = (await puter.kv.get(
      HOSTING_CONFIG_KEY,
    )) as HostingConfig | null;

    if (existing?.subdomain) return { subdomain: existing.subdomain };

    const subdomain = createHostingSlug();

    try {
      const created = await puter.hosting.create(subdomain, "."); //. means current directory

      const record = { subdomain: created.subdomain };
      await puter.kv.set(HOSTING_CONFIG_KEY, record);
      return record;
    } catch (error) {
      console.warn(`Could not find subdomain: ${error}`);
      return null;
    }
  };

export const uploadImageToHosting = async({hosting, url, projectId, label}: StoreHostedImageParams): Promise<HostedAsset | null> => {
    if(!hosting || !url) return null;

    if(isHostedUrl(url)) return {url};

    try {
        const resolved = label === "rendered" 
          ? await imageUrlToPngBlob(url)
           .then((blob) => blob ? {blob, contentType: 'image/png'}: null)
          : await fetchBlobFromUrl(url);

        if(!resolved) return null;

        const contentType = resolved.contentType || resolved.blob.type || '';
        const ext = getImageExtension(contentType, url);
        const dir = `projects/${projectId}`;
        const filePath = `${dir}/${label}.${ext}`;

        const uploadFile = new File([resolved.blob], `${label}.${ext}`, {
            type: contentType,
        });

        //createMissingParents: in case dir is created for the first time
        await puter.fs.mkdir(dir, { createMissingParents: true });
        await puter.fs.write(filePath, uploadFile);

        const hostedUrl = getHostedUrl({ subdomain: hosting.subdomain }, filePath);

        return hostedUrl ? { url: hostedUrl } : null;

    } catch (error) {
        console.warn(`Failed to store the hosted imgae: ${error}`);
        return null;
    }
}