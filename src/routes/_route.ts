import { Router,Response,Request } from "express";
import { StatusSuccess } from "../Utils/Status";

const router = Router();

router.get('/ping', (req:Request, res:Response)=>{
    res?.send({...StatusSuccess})
})

export default router