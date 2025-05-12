import { NextFunction } from "express";
import createHttpError from "http-errors";
import { z } from "zod";

export async function validator(schemaName: z.ZodSchema, body: Record<string, any>, next: NextFunction) {
  try {
    const { error } = schemaName.safeParse(body);

    console.log(body);
    
    error ? next(createHttpError(422, error.errors[0].message)) : next();
  } catch (error) {
    console.log(`[ValidationMiddlewareError]: ${error}`)
  }
}
