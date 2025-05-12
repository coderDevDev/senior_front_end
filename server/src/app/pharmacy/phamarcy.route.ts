import { uploadImage } from "@/common/middlewares/file-upload";
import { pharmacyFeature } from "@/common/middlewares/sort-filter-pagination";
import { addPhamarcyValidation } from "@/common/middlewares/validation/phamarcy";
import express from "express";
import { PharmacyController } from "./phamarcy.controller";

const router = express.Router();

const phamarcyController = new PharmacyController;


// router.get("/", UserController.getUsersHandler)
router.post("/add_pharmacy", uploadImage.single('pharmacyImg'), addPhamarcyValidation, (phamarcyController as any).addPhamarcyHandler)
router.get("/", pharmacyFeature(), phamarcyController.getPharmaciesHandler as any)



export const PharmacyRoute: express.Router = router;
