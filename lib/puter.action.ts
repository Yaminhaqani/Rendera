import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";

export const signIn = async () => await puter.auth.signIn();

export const signOut = () => puter.auth.signOut();

export const getCurrentUser = async () => {
    try {

        return await puter.auth.getUser();
        
    } catch (error) {
        return null;
    }
}

export const createProject = async({item}: CreateProjectParams) : Promise<DesignItem | null | undefined> => {
    const projectId = item.id;

    //Checks if you already have a subdomain (like abc.puter.site). Now you have a place to upload images
    const hosting = await getOrCreateHostingConfig();

    //Upload original image (sourceImage), label it "source"
    const hostedSource = projectId ?
      await uploadImageToHosting({ hosting, url: item.sourceImage, projectId, 
        label: 'source', }) : null;

    //access to hosted render, AI-generated result
    const hostedRender = projectId && item.renderedImage ?
      await uploadImageToHosting({ hosting, url: item.renderedImage, projectId, 
        label: 'rendered', }) : null;

    //hostedSource?.url= Upload succeeded || isHostedUrl(item.sourceImage)= Upload failed BUT already hosted, use original URL || empty string
    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage)
     ? item.sourceImage : '');

     if(!resolvedSource) {
        console.warn('Failed to host source image, skipping save.');
        return null; 
     }

     const resolvedRender = hostedRender ?.url
      ? hostedRender.url
      : item.renderedImage && isHostedUrl(item.renderedImage)
        ? item.renderedImage : undefined;

        //renamed on right side
     const {
        sourcePath : _sourcePath,
        renderedPath : _renderedPath,
        publicPath : _publicPath,
        ...rest
     } = item;

     const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
     }

     try {

        //call the puter worker to store project in kv
        



        return payload;
        
     } catch (error) {
        console.warn('Failed to save project', error);
        return null;  
     }
}