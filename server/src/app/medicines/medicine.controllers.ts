import { uploadFile } from "@/common/middlewares/file-upload";
import { HttpStatusCodes } from "@/constants";
import { TPaginationResponse } from "@/interface";
import { customReponse, deleteFile } from "@/utils";
import { NextFunction, Request, Response } from "express";
import IMedicine from "./medicine.interface";
import MedicineService from "./medicine.service";

export default class MedicineController {
  private medicineService: MedicineService | any;
  
  constructor() {
    this.medicineService = new MedicineService();
  }

  addMedicineHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const medicineData: IMedicine = req.body;

      console.log(medicineData)


      // Handle file upload
      let medicineImageUrl = '';
      if (req.file?.filename) {
        const localFilePath = `${process.env.PWD}/public/uploads/others/${req.file.filename}`;
        const destination = `medicines/${req.file.filename}`;
        medicineImageUrl = await uploadFile(localFilePath, destination);
        deleteFile(localFilePath);
      }

      // Prepare medicine data
      const medicine: IMedicine = {
        ...medicineData,
        medicineImageUrl,
        isActive: medicineData.isActive ?? true,
      };


      // Create medicine
      const createdMedicine = await this.medicineService.addMedicine(medicine);

      const response = customReponse().success(
        HttpStatusCodes.CREATED,
        createdMedicine,
        'Medicine has been added successfully.'
      );

      return res.status(response.statusCode).json(response);
    } catch (err) {
      console.error(`[AddMedicineControllerError]: ${err}`);
      next(err);
    }
  }

  getMedicinesHandler = async (_req: Request, res: TPaginationResponse) => {
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
  
        responseObject.medicines = results?.map((user: IMedicine) => {
          return {
            ...user,
            request: {
              type: 'GET',
              description: 'Get one phamarcy with the ID',
              url: `http://localhost:8080/api/v1/phamarcy/${user.medicineId}`
            }
          }
        })
  
        const success = customReponse<typeof responseObject>().success(HttpStatusCodes.OK, responseObject, "Successfully found medicines");
  
        return res.status(success.statusCode).json(success)
      } else {
        const error = customReponse().error(404, new Error('No medicine found.'), "No medicine found")
        return res.status(error.statusCode).json(error)
      }
    } catch (error) {
      return res.status(500).send(
        customReponse().error(404, error as Error, 'An error occurred while retrieving medicine')
      )
    }
  } 


}
