import axios from "axios"
import { Config } from "../Config"
import { GeminiAI } from "./Gemini";

export class Pixel{
    public static async getPhotos(text:string){
        try {
            let queryString = new URLSearchParams({
                query : text,
                size : 'medium',
                per_page : '1'
            });

            const photoResponse = await axios.get(`https://api.pexels.com/v1/search?${queryString}`,{
                     headers: { Authorization: Config.configKeys.pixelApiKey },
            });

            if(photoResponse?.data?.photos?.length){
                return photoResponse?.data;
            }

            return ''

        } catch (error) {
            return ''
        }
    }

    public static async getPhotosByArr(keyWords: string[],prompt:string) {    
        let photoUrls = await Promise.all(
            keyWords.map(async (word) => {
                let photo = await this.getPhotos(`${prompt} ${word}`);
                let imageUrl = photo?.[0]?.src?.original || null;
    
                return imageUrl ? { word, imageUrl } : null; 
            })
        );
    
        return photoUrls.filter(item => item !== null); 
    }

    public static async getPhotoFromRecipeName(recipeName: string,cuisine:string) {
        const cleanName = recipeName.replace(/^[-–—]\s*/, "").trim(); 
        let query = await GeminiAI.generateImageSearchDescription(cleanName,cuisine);

        let photoResponse = await this.getPhotos(query);
        return photoResponse?.photos?.[0]?.src?.original
        
    }
    
}