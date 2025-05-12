import { validator } from "@/utils";
import { NextFunction } from "express";
import { addUserSchema, updateUserSchema } from "./user.schema";


export const addUserValidation: any = async (
  req: Request, res: Response, next: NextFunction
) => await validator(addUserSchema, req.body!, next);

export const updateUserValidation: any = async (
  req: Request, res: Response, next: NextFunction
) => await validator(updateUserSchema, req.body!, next);
