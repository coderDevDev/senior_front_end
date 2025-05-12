// import { Request, Response, NextFunction } from "express";
// import { SeniorCitizenService } from "./seniior-citizen.service";
// import createHttpError from "http-errors";
// import UserController from "../sb-users/user.controller";

// export class SeniorCitizenController extends UserController {
//   private seniorCitizenService: typeof SeniorCitizenService;

//   constructor() {
//     super(); // Call the parent constructor
//     this.seniorCitizenService = SeniorCitizenService;
//   }

//   // Fetch all senior citizens
//   getSeniorCitizensHandler = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const seniors = await this.seniorCitizenService.getAllSeniorCitizen();
//       res.status(200).json(seniors);
//     } catch (error) {
//       next(createHttpError(500, "Error fetching senior citizens"));
//     }
//   };

//   // Add a new senior citizen
//   addSeniorCitizenHandler = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const newSeniorCitizen = await this.seniorCitizenService.addSeniorCitizen(req.body);
//       res.status(201).json(newSeniorCitizen);
//     } catch (error) {
//       next(error);
//     }
//   };

//   // Update an existing senior citizen by ID
//   updateSeniorCitizenHandler = async (req: Request, res: Response, next: NextFunction) => {
//     const { id } = req.params;
//     try {
//       const updatedSenior = await this.seniorCitizenService.updateSeniorCitizen(id, req.body);
//       if (!updatedSenior) {
//         throw createHttpError(404, `Senior citizen with id ${id} not found`);
//       }
//       res.status(200).json(updatedSenior);
//     } catch (error) {
//       next(error);
//     }
//   };

//   // Delete a senior citizen by ID
//   deleteSeniorCitizenHandler = async (req: Request, res: Response, next: NextFunction) => {
//     const { id } = req.params;
//     try {
//       const deletedSenior = await this.seniorCitizenService.deleteSeniorCitizen(id);
//       if (!deletedSenior) {
//         throw createHttpError(404, `Senior citizen with id ${id} not found`);
//       }
//       res.status(204).send();
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default SeniorCitizenController;
// import { customReponse } from "@/utils";
// import { HttpStatusCodes } from "@/constants";
// import { SeniorCitizenService } from "./seniior-citizen.service";
// import { Request, Response, NextFunction } from "express";

// class SeniorCitizenController {
//   async getSeniorCitizensHandler(req: Request, res: Response, next: NextFunction) {
//     try {
//       const data = []; // Replace with actual data fetching logic
//       res.status(200).json({ success: true, data });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async addSeniorCitizenHandler(req: Request, res: Response, next: NextFunction) {
//     try {
//       const newData = {}; // Replace with actual data creation logic
//       res.status(201).json({ success: true, data: newData });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async updateSeniorCitizenHandler(req: Request, res: Response, next: NextFunction) {
//     try {
//       res.status(200).json({ success: true, message: "Updated successfully" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async deleteSeniorCitizenHandler(req: Request, res: Response, next: NextFunction) {
//     try {
//       res.status(200).json({ success: true, message: "Deleted successfully" });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// export default SeniorCitizenController;
import uploadFile from "@/common/middlewares/file-upload/storage";
import { HttpStatusCodes } from "@/constants";
import { TPaginationResponse } from "@/interface";
import { customReponse } from "@/utils";
import { NextFunction, Request, Response } from "express";
import { SeniorCitizenService } from "./seniior-citizen.service";
import ISeniorCitizen from "./senior-citizen.interface";

// Define a custom interface that extends the Response interface
interface CustomResponse extends Response {
  paginatedResults?: TPaginationResponse["paginatedResults"];
}

class SeniorCitizenController {
  private seniorCitizenService: typeof SeniorCitizenService;

  constructor() {
    this.seniorCitizenService = SeniorCitizenService;
  }

  async getSeniorCitizensHandler(req: Request, res: CustomResponse, next: NextFunction) {
    try {
      if (res.paginatedResults) {
        const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;

        const responseObject: any = {
          totalDocs: totalDocs || 0,
          totalPages: totalPages || 0,
          lastPage: lastPage || 0,
          count: results?.length || 0,
          currentPage: currentPage || 0,
        };

        if (next) {
          responseObject.nextPage = next;
        }
        if (previous) {
          responseObject.prevPage = previous;
        }

        responseObject.seniors = results?.map((user: ISeniorCitizen) => {
          return {
            ...user,
            request: {
              type: 'GET',
              description: 'Get one user with the ID',
              url: `http://localhost:5370/api/v1/user/senior/${user.user_id}`
            }
          }
        })

        const success = customReponse<typeof responseObject>().success(HttpStatusCodes.OK, responseObject, "Successfully found seniors");

        return res.status(success.statusCode).json(success)
      } else {
        const error = customReponse().error(404, new Error('No seniors found.'), "No seniors found")
        return res.status(error.statusCode).json(error)
      }
    } catch (error) {
      return res.status(500).send(
        customReponse().error(404, error as Error, 'An error occurred while retrieving seniors')
      )
    }
  }

  async addSeniorCitizenHandler(req: Request, res: Response, next: NextFunction) {
    // try {
    //   const newData = await this.seniorCitizenService.addSeniorCitizen(req.body);
    //   const response = customReponse().success(HttpStatusCodes.CREATED, newData, "Senior citizen added successfully");
    //   return res.status(response.statusCode).json(response);
    // } catch (error) {
    //   next(error);
    // }
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


      const data = await this.seniorCitizenService.addSeniorCitizen(userData);


      const response = customReponse().success(HttpStatusCodes.OK, data, `Student has been added.`)

      return res.status(response.statusCode).json(response);

    } catch (err) {
      console.log(`[AddSeniorCitizenControllerError]: ${err}`)
      
      next(err);

    }
  }

  async updateSeniorCitizenHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedData = await this.seniorCitizenService.updateSeniorCitizen(req.params.id, req.body);
      const response = customReponse().success(HttpStatusCodes.OK, updatedData, "Senior citizen updated successfully");
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
 

  // Update an existing senior citizen by ID
  // updateSeniorCitizenHandler = async (req: Request, res: Response, next: NextFunction) => {
  //   const { id } = req.params;
  //   try {
  //     const updatedSenior = await this.seniorCitizenService.updateSeniorCitizen(id, req.body);
  //     if (!updatedSenior) {
  //       throw createHttpError(404, `Senior citizen with id ${id} not found`);
  //     }
  //     res.status(200).json(updatedSenior);
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  async deleteSeniorCitizenHandler(req: Request, res: Response, next: NextFunction) {
    try {
      await this.seniorCitizenService.deleteSeniorCitizen(req.params.id);
      const response = customReponse().success(HttpStatusCodes.OK, null, "Senior citizen deleted successfully");
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
  // // Delete a senior citizen by ID
  // deleteSeniorCitizenHandler = async (req: Request, res: Response, next: NextFunction) => {
  //   const { id } = req.params;
  //   try {
  //     const deletedSenior = await this.seniorCitizenService.deleteSeniorCitizen(id);
  //     if (!deletedSenior) {
  //       throw createHttpError(404, `Senior citizen with id ${id} not found`);
  //     }
  //     res.status(204).send();
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default SeniorCitizenController;
