import { v2 as cloudinary } from 'cloudinary';
import { Config } from '../Config';

export class Cloudinary{

    public static init(){
        cloudinary.config({
            cloud_name: Config.configKeys.cloudinary.cloud_name, 
            api_key: Config.configKeys.cloudinary.api_key, 
            api_secret: Config.configKeys.cloudinary.api_secret
        });
        console.log("✅ cloudinary Initialized");
    }

    public static async uploadImage(base64String : Base64URLString, name:string){
        const dataUri = `data:image/png;base64,${base64String}`;

        try {
            const uploadResult = await cloudinary.uploader.upload(dataUri,{
                public_id : name,
                folder : 'recipes'
            });
            return uploadResult?.secure_url;
        } catch (error) {
            console.error('❌ Upload error:', error);
            return ""
        }
    }
}