import { uploadImage } from "@/common/middlewares/file-upload";
import { medicineFeature } from "@/common/middlewares/sort-filter-pagination";
import express from "express";
import MedicineController from "./medicine.controllers";

const router = express.Router();

const medicineController = new MedicineController;


// router.get("/", UserController.getUsersHandler)
router.post("/add_medicine", uploadImage.single('medicineImageFile'), (medicineController as any).addMedicineHandler)
router.get("/", medicineFeature(), medicineController.getMedicinesHandler as any)



export const MedicineRoute: express.Router = router;
