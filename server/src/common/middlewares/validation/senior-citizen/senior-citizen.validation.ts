// import { Request, Response, NextFunction } from "express";
// import { validate } from "class-validator";

// export const addSeniorCitizenValidation = async (req: Request, res: Response, next: NextFunction) => {
//   const seniorCitizen = req.body;

//   const errors = await validate(seniorCitizen);

//   if (errors.length > 0) {
//     return res.status(400).json({ message: "Invalid request", errors });
//   }

//   next();
// };
// import { validator } from "@/utils";
// import { NextFunction } from "express";
// import { addUserSchema } from "./senior.schema";


// export const addSeniorCitizenValidation: any = async (
//   req: Request, res: Response, next: NextFunction
// ) => await validator(addUserSchema, req.body!, next)
import { validator } from "@/utils";
import { NextFunction, Request, Response } from "express";
import { addSeniorSchema } from "./senior.schema";

export const addSeniorCitizenValidation = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    await validator(addSeniorSchema, req.body!, next);
    next();
  } catch (error) {
    next(error);
  }
};