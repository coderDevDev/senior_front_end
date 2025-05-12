import transactionsFeature from "@/common/middlewares/sort-filter-pagination/sb-transactions.features"
import express from "express"
import { TransactionController } from "./transaction.controller"

const router = express.Router()

const transactionController = new TransactionController()

//router.post("/transaction", transactionController.addTransactionHandler)
router.get("/", transactionsFeature(), transactionController.getTransactionsHandler as any)
//router.get("/:id", transactionController.getOneTransactionHandler)
//router.put("/:id", transactionController.updateTransactionHandler)
//router.delete("/:id", transactionController.deleteTransactionHandler)

export const TransactionRoute: express.Router = router

