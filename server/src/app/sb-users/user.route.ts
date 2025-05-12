import usersFeature from "@/common/middlewares/sort-filter-pagination/sb-users.features";
import { addUserValidation } from "@/common/middlewares/validation";
import express from "express";
import UserController from "./user.controller";

const router = express.Router();

const userController = new UserController;


// router.get("/", UserController.getUsersHandler)
router.post("/add_user", addUserValidation, (userController as any).addUserHandler)
router.get("/", usersFeature(), userController.getStudentsHandler as any)
// router.get('/api/v1/user/:id', (userController as any).getOneUserHandler);


export const SbUserRoute: express.Router = router;