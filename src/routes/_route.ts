import { Router } from "express";
import foodRouter from '../routes/route'

const router = Router();

router.use('/v1',foodRouter)

export default router