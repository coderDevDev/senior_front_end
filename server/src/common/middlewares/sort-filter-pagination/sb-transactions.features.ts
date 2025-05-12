import type { NextFunction } from "express"
import {supabase} from "@/config";
import type { TPaginationRequest, TPaginationResponse } from "@/interface"


const transactionsFeature = () => {
  return async (req: TPaginationRequest, res: TPaginationResponse, next: NextFunction) => {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const sortBy = (req.query.sort as string) || "transaction_date"
      const order = (req.query.orderBy as string) || "desc"
      const searchTerm = req.query.search as string

      let query = supabase.from("transaction").select("*", { count: "exact" })

      // Apply search if searchTerm is provided
      if (searchTerm) {
        query = query.or(`senior_citizen_id.ilike.%${searchTerm}%,pharmacy_id.ilike.%${searchTerm}%`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: order === "asc" })

      // Get total count before pagination
      const { count } = await query

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = page * limit

      query = query.range(startIndex, endIndex - 1)

      const { data: transactions, error } = await query

      if (error) throw error

      const totalPages = Math.ceil(count! / limit)

      const paginatedResults: any = {
        results: transactions,
        totalDocs: count?.toString() || "0",
        limit,
        totalPages,
        page,
        pagingCounter: startIndex + 1,
        hasPrevPage: page > 1,
        hasNextPage: endIndex < count!,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: endIndex < count! ? page + 1 : null,
        next: endIndex < count! ? (page + 1).toString() : "",
        previous: page > 1 ? (page - 1).toString() : "",
        currentPage: page.toString(),
        lastPage: totalPages.toString(),
      }

      res.paginatedResults = paginatedResults;
      next()
    } catch (error) {
      next(error)
    }
  }
}

export default transactionsFeature

