import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import logger from '../../utils/logger' // Corrected import path for the logger

// we need eslint because we have to pass next arg for the error middleware
// eslint-disable-next-line
async function errorHandlerMiddleware(err: InternalFlowiseError, req: Request, res: Response, next: NextFunction) {
    let displayedError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: err.message,
        // Provide error stack trace only in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    }

    // Log the error using the imported logger
    logger.error(`Error: ${err.message}`, {
        statusCode: displayedError.statusCode,
        stack: err.stack,
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
    })

    res.setHeader('Content-Type', 'application/json')
    res.status(displayedError.statusCode).json(displayedError)
}

export default errorHandlerMiddleware
