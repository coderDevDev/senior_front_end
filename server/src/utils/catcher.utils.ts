import { Request, Response } from "express";

/**
 *
 * @param {*} fn
 * @returns {Promise}
 * Automatically handles and catches errors in application (sends error message to client)
 */
export const catcher =
  (fn: Function, cb?: Function) => (request: Request, response: Response) => {
    Promise.resolve(fn(request, response)).catch((err) => {
      if (cb) {
        cb(request, response);
        return;
      }

      console.log(`[CatcherError]: ${err}`);

      response.status(400).send({
        message: err.message,
      });
    });
  };
