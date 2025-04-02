import { Router,Response,Request } from "express";
import { StatusSuccess } from "../Utils/Status";
import { GeminiAI } from "../Utils/Gemini";

const router = Router();

router.get('/ping', (req:Request, res:Response)=>{
    res?.send({...StatusSuccess})
})

router.post('/test', async(req:Request, res:Response)=>{
    let prompt = req?.body?.prompt;
    let aiResponse = await GeminiAI.generateRecipeList (prompt);

    res?.send({...StatusSuccess,aiResponse})
})

export default router