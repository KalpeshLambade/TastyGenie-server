import { Router,Response,Request } from "express";
import { StatusSuccess } from "../Utils/Status";
import { suggestFoodItems } from "../controller/AIRecipeController ";

const router = Router();

router.get('/ping', (req:Request, res:Response)=>{
    res?.send({...StatusSuccess})
});

router.post('/suggestFoodItems',suggestFoodItems)

export default router;