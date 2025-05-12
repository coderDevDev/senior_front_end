import { uploadFile } from "@/common/middlewares/file-upload";
import { HttpStatusCodes } from "@/constants";
import { TPaginationResponse } from "@/interface";
import { customReponse, deleteFile } from "@/utils";
import getRandomAvatarImage from "@/utils/random-avatar.utils";
import { NextFunction, Request, Response } from "express";
import IPharmacy from "./phamarcy.interface";
import PharmacyService from "./phamarcy.service";

export class PharmacyController {

  private phamarcyService: PharmacyService | any;
  
  constructor() {
    this.phamarcyService = new PharmacyService();
   }


   addPhamarcyHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {


      let storageRefUrl = '';

      if(req.file?.filename) {
        const localFilePath = `${process.env.PWD}/public/uploads/pharmacy/${req.file?.filename}`;
        const destination = `phamarcy/${req.file.filename}`;

        storageRefUrl = await uploadFile(localFilePath, destination);

        
        deleteFile(localFilePath);
      } else {
        storageRefUrl = getRandomAvatarImage()
      }
      

      const userData = {
        ...req.body,
        pharmacyImg: storageRefUrl
      }


      const data = await this.phamarcyService.createPharmacy(userData);


      const response = customReponse().success(HttpStatusCodes.OK, data, `Phamarcy has been added.`)

      return res.status(response.statusCode).json(response);

    } catch (err) {
      console.log(`[AddPhamarcyControllerError]: ${err}`)
      
      next(err);

    }
  }

  getPharmaciesHandler = async (_req: Request, res: TPaginationResponse) => {
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
  
        responseObject.pharmacies = results?.map((user: IPharmacy) => {
          return {
            ...user,
            request: {
              type: 'GET',
              description: 'Get one phamarcy with the ID',
              url: `http://localhost:8080/api/v1/phamarcy/${user.pharmacyId}`
            }
          }
        })
  
        const success = customReponse<typeof responseObject>().success(HttpStatusCodes.OK, responseObject, "Successfully found pharmacies");
  
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
