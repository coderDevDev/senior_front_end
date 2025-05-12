// // export const UserRoute: express.Router = router;
// import express from "express";
// import SeniorCitizenController from "./senior-citizen.controllers";

// const router = express.Router();
// const seniorCitizenController = new SeniorCitizenController(); // Create an instance of SeniorCitizenController

// // Route handlers
// router.get("/senior", seniorCitizenController.getSeniorCitizensHandler);
// router.post("/senior", seniorCitizenController.addSeniorCitizenHandler);
// router.put("/senior:id", seniorCitizenController.updateSeniorCitizenHandler);
// router.delete("/senior:id", seniorCitizenController.deleteSeniorCitizenHandler);

// export const SeniorCitizenRoute: express.Router = router;

import express from "express";
import SeniorCitizenController from "../senior-citizen/senior-citizen.controllers";
// import { addSeniorCitizenValidation } from "@/common/middlewares/validation/senior-citizen/senior-citizen.validation";
// import seniorCitizensFeature from "@/common/middlewares/sort-filter-pagination/sb-senior-citizens.features";
import usersFeature from "@/common/middlewares/sort-filter-pagination/sb-users.features";
import { addSeniorCitizenValidation } from "@/common/middlewares/validation/senior-citizen";

const router = express.Router();
const seniorCitizenController = new SeniorCitizenController(); // Create an instance of SeniorCitizenController

// Route handlers
router.get("/", usersFeature(), (seniorCitizenController as any).getSeniorCitizensHandler); //seniorCitizensFeature(), 
router.post("/add_senior",  addSeniorCitizenValidation ,(seniorCitizenController as any).addSeniorCitizenHandler); //addSeniorCitizenValidation, 
router.put("/senior/:id", (seniorCitizenController as any).updateSeniorCitizenHandler);
router.delete("/senior/:id", (seniorCitizenController as any).deleteSeniorCitizenHandler);

export const SeniorCitizenRoute: express.Router = router;
// import express from "express";
// import SeniorCitizenController from "../senior-citizen/senior-citizen.controllers";
// import usersFeature from "@/common/middlewares/sort-filter-pagination/sb-users.features";
// import { addSeniorCitizenValidation } from "@/common/middlewares/validation/senior-citizen";

// const router = express.Router();
// const seniorCitizenController = new SeniorCitizenController();

// // Route handlers
// router.get("/senior", usersFeature(),
// (seniorCitizenController as any).getSeniorCitizensHandler);

// // router.post("/senior", addSeniorCitizenValidation, (req, res, next) => {
// //   seniorCitizenController.addSeniorCitizenHandler(req, res, next).catch(next);
// // });
// router.post("/senior", addSeniorCitizenValidation, (seniorCitizenController as any).addSeniorCitizenHandler);

// router.put("/senior/:id", (seniorCitizenController as any).updateSeniorCitizenHandler);

// router.delete("/senior/:id",(seniorCitizenController as any).deleteSeniorCitizenHandler);

// export const SeniorCitizenRoute: express.Router = router;