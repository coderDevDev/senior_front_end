import uploadFile from "@/common/middlewares/file-upload/storage";
import { HttpStatusCodes } from "@/constants";
import { TPaginationRequest, TPaginationResponse } from "@/interface";
import { customReponse } from "@/utils";
import { NextFunction, Request, Response } from "express";
import { IUser } from "./user.interface";
import UserService from "./user.service";

export class UserController {

  private userService: UserService | any;
  
  constructor() {
    this.userService = new UserService();
   }

   addUserHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {

      let storageRefUrl = '';

      if(req.file?.filename) {
        const localFilePath = `${process.env.PWD}/public/uploads/sb_users/${req.file?.filename}`;
        const destination = `sb_users/${req.file.filename}`;

        storageRefUrl = await uploadFile(localFilePath, destination);

      }
      

      const userData = {
        ...req.body,
        userImg: storageRefUrl
      }


      const data = await this.userService.createUser(userData);


      const response = customReponse().success(HttpStatusCodes.OK, data, `User has been added.`)

      return res.status(response.statusCode).json(response);

    } catch (err) {
      console.log(`[AddStudentControllerError]: ${err}`)
      
      next(err);

    }
  }

  updateUserHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // Update user implementation
      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  };

  getOneUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const data = await this.userService.getUserById(id);

    if (!data) {
      const error = customReponse().error(404, new Error('User not found.'), "User not found")
      return res.status(error.statusCode).json(error)
    }

    const response = customReponse().success(HttpStatusCodes.OK, data, `User has been found.`)

    return res.status(response.statusCode).json(response);
  } catch (err) {
    console.log(`[GetUserHandlerError]: ${err}`)
    
    next(err);
  }
}

  getStudentsHandler = async (_req: TPaginationRequest, res: TPaginationResponse) => {
    try {
      if(res.paginatedResults) {
        const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;
  
        const responseObject: any = {
          totalDocs: totalDocs || 0,
          totalPages: totalPages || 0,
          lastPage: lastPage || 0,
          count: results?.length || 0,
          currentPage: currentPage || 0,
        };
  
        if(next) {
          responseObject.nextPage = next;
        }
        if(previous) {
          responseObject.prevPage = previous;
        }
  
        responseObject.students = results?.map((user: IUser) => {
          return {
            ...user,
            request: {
              type: 'GET',
              description: 'Get one user with the ID',
              url: `http://localhost:5370/api/v1/user/${user.user_id}`
            }
          }
        })
  
        const success = customReponse<typeof responseObject>().success(HttpStatusCodes.OK, responseObject, "Successfully found students");
  
        return res.status(success.statusCode).json(success)
      } else {
        const error = customReponse().error(404, new Error('No students found.'), "No students found")
        return res.status(error.statusCode).json(error)
      }
    } catch (error) {
      return res.status(500).send(
        customReponse().error(404, error as Error, 'An error occurred while retrieving products')
      )
    }
  } 
  
}

export default UserController;
