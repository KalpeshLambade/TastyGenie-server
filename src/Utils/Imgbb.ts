import axios from "axios";
import { Config } from "../Config";

export class Imgbb{
    private static readonly MAX_SIZE_MB = 32;
    private static readonly MAX_SIZE_BYTES = Imgbb.MAX_SIZE_MB * 1024 * 1024; 
    private static readonly EXPIRATION_TIME = 86400;

    public static async uploadImage(image: File | Blob | string, name?: string) {
        try {
            const formData = new FormData();
            formData.append('key', Config.configKeys.imgbb);
            formData.append('expiration', Imgbb.EXPIRATION_TIME.toString()); 

            if (typeof image === 'string') {
                formData.append('image', image);
                if (name) {
                    formData.append('name', name);
                }
            } else {
                if (image.size > Imgbb.MAX_SIZE_BYTES) {
                    throw new Error(`Image size exceeds ${Imgbb.MAX_SIZE_MB} MB limit.`);
                }
                formData.append('image', image, name || 'image.jpg');
            }
            const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data?.data?.display_url;
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error; 
        }
    }
}