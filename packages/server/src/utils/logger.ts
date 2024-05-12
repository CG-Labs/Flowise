import * as path from 'path'
import * as fs from 'fs'
import config from './config' // should be replaced by node-config or similar
import { createLogger, transports, format } from 'winston'
import { NextFunction, Request, Response } from 'express'

const { combine, timestamp, printf, errors } = format

// expect the log dir be relative to the projects root
const logDir = path.join(__dirname, '../../logs') // Updated to ensure logs directory is at the root of the project

// Create the log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}

const logger = createLogger({
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.json(),
        printf(({ level, message, timestamp, stack }) => {
            const text = `${timestamp} [${level.toUpperCase()}]: ${message}`
            return stack ? text + '\n' + stack : text
        }),
        errors({ stack: true })
    ),
    defaultMeta: {
        package: 'server'
    },
    transports: [
        new transports.Console(),
        new transports.File({
            filename: path.join(logDir, 'server.log'), // Updated to use a fixed filename
            level: 'info'
        }),
        new transports.File({
            filename: path.join(logDir, 'server-error.log'), // Updated to use a fixed filename
            level: 'error' // Log only errors to this file
        })
    ],
    exceptionHandlers: [
        new transports.File({
            filename: path.join(logDir, 'server-error.log') // Updated to use a fixed filename
        })
    ],
    rejectionHandlers: [
        new transports.File({
            filename: path.join(logDir, 'server-error.log') // Updated to use a fixed filename
        })
    ]
})

/**
 * This function is used by express as a middleware.
 * @example
 *   this.app = express()
 *   this.app.use(expressRequestLogger)
 */
export function expressRequestLogger(req: Request, res: Response, next: NextFunction): void {
    const unwantedLogURLs = ['/api/v1/node-icon/']
    if (req.url.includes('/api/v1/') && !unwantedLogURLs.some((url) => req.url.includes(url))) {
        const fileLogger = createLogger({
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json(), errors({ stack: true })),
            defaultMeta: {
                package: 'server',
                request: {
                    method: req.method,
                    url: req.url,
                    body: req.body,
                    query: req.query,
                    params: req.params,
                    headers: req.headers
                }
            },
            transports: [
                new transports.File({
                    filename: path.join(logDir, 'server-requests.log.jsonl'), // Updated to use a fixed filename
                    level: 'debug'
                })
            ]
        })

        const getRequestEmoji = (method: string) => {
            const requetsEmojis: Record<string, string> = {
                GET: '⬇️',
                POST: '⬆️',
                PUT: '🖊',
                DELETE: '❌',
                OPTION: '🔗'
            }

            return requetsEmojis[method] || '?'
        }

        if (req.method !== 'GET') {
            fileLogger.info(`${getRequestEmoji(req.method)} ${req.method} ${req.url}`)
            logger.info(`${getRequestEmoji(req.method)} ${req.method} ${req.url}`)
        } else {
            fileLogger.http(`${getRequestEmoji(req.method)} ${req.method} ${req.url}`)
        }
    }

    next()
}

export default logger
