import { HttpStatusCodes } from "@/constants"
import { TPaginationRequest, TPaginationResponse } from "@/interface"
import { customReponse } from "@/utils"
import { NextFunction, Request, Response } from "express"
import { ITransaction } from "./transaction.interface"
import TransactionService from "./transaction.service"

export class TransactionController {
  private transactionService: TransactionService | any;

  constructor() {
    this.transactionService = new TransactionService()
  }

  addTransactionHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactionData = req.body
      const data = await this.transactionService.createTransaction(transactionData)
      const response = customReponse().success(HttpStatusCodes.CREATED, data, `Transaction has been added.`)
      return res.status(response.statusCode).json(response)
    } catch (err) {
      console.log(`[AddTransactionControllerError]: ${err}`)
      next(err)
    }
  }

  getOneTransactionHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id
      const data = await this.transactionService.getTransactionById(id)
      if (!data) {
        const error = customReponse().error(404, new Error("Transaction not found."), "Transaction not found")
        return res.status(error.statusCode).json(error)
      }
      const response = customReponse().success(HttpStatusCodes.OK, data, `Transaction has been found.`)
      return res.status(response.statusCode).json(response)
    } catch (err) {
      console.log(`[GetTransactionHandlerError]: ${err}`)
      next(err)
    }
  }

  getTransactionsHandler = async (_req: TPaginationRequest, res: TPaginationResponse) => {
    try {
      if (res.paginatedResults) {
        const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults
        const responseObject: any = {
          totalDocs: totalDocs || 0,
          totalPages: totalPages || 0,
          lastPage: lastPage || 0,
          count: results?.length || 0,
          currentPage: currentPage || 0,
        }
        if (next) {
          responseObject.nextPage = next
        }
        if (previous) {
          responseObject.prevPage = previous
        }
        responseObject.transactions = results?.map((transaction: ITransaction) => {
          return {
            ...transaction,
            request: {
              type: "GET",
              description: "Get one transaction with the ID",
              url: `http://localhost:5370/api/v1/transaction/${transaction.transaction_id}`,
            },
          }
        })
        const success = customReponse<typeof responseObject>().success(
          HttpStatusCodes.OK,
          responseObject,
          "Successfully found transactions",
        )
        return res.status(success.statusCode).json(success)
      } else {
        const error = customReponse().error(404, new Error("No transactions found."), "No transactions found")
        return res.status(error.statusCode).json(error)
      }
    } catch (error) {
      return res
        .status(500)
        .send(customReponse().error(404, error as Error, "An error occurred while retrieving transactions"))
    }
  }

  updateTransactionHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id
      const updateData = req.body
      const data = await this.transactionService.updateTransaction(id, updateData)
      const response = customReponse().success(HttpStatusCodes.OK, data, `Transaction has been updated.`)
      return res.status(response.statusCode).json(response)
    } catch (err) {
      console.log(`[UpdateTransactionControllerError]: ${err}`)
      next(err)
    }
  }

  deleteTransactionHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id
      await this.transactionService.deleteTransaction(id)
      const response = customReponse().success(HttpStatusCodes.OK, null, `Transaction has been deleted.`)
      return res.status(response.statusCode).json(response)
    } catch (err) {
      console.log(`[DeleteTransactionControllerError]: ${err}`)
      next(err)
    }
  }
}

export default TransactionController

