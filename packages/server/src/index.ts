import express from 'express'
import { Request, Response } from 'express'
import path from 'path'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import { DataSource } from 'typeorm'
import { IChatFlow } from './Interface'
import { getNodeModulesPackagePath, getEncryptionKey } from './utils'
import logger, { expressRequestLogger } from './utils/logger'
import { getDataSource } from './DataSource'
import { NodesPool } from './NodesPool'
import { ChatFlow } from './database/entities/ChatFlow'
import { ChatflowPool } from './ChatflowPool'
import { CachePool } from './CachePool'
import { initializeRateLimiter } from './utils/rateLimit'
import { getAPIKeys } from './utils/apiKey'
import { sanitizeMiddleware, getCorsOptions, getAllowedIframeOrigins } from './utils/XSS'
import { Telemetry } from './utils/telemetry'
import flowiseApiV1Router from './routes'
import errorHandlerMiddleware from './middlewares/errors'

// Define paths for UI static files
const packagePath = getNodeModulesPackagePath('flowise-ui')
const uiBuildPath = path.join(packagePath, 'build')
const uiHtmlPath = path.join(packagePath, 'build', 'index.html')

declare global {
    namespace Express {
        interface Request {
            io?: Server
        }
    }
}

export class App {
    app: express.Application
    nodesPool: NodesPool
    chatflowPool: ChatflowPool
    cachePool: CachePool
    telemetry: Telemetry
    AppDataSource: DataSource = getDataSource()

    constructor() {
        this.app = express()
    }

    async initDatabase() {
        // Initialize database
        this.AppDataSource.initialize()
            .then(async () => {
                logger.info('📦 [server]: Data Source is initializing...')

                // Run Migrations Scripts
                await this.AppDataSource.runMigrations({ transaction: 'each' })

                // Initialize nodes pool
                this.nodesPool = new NodesPool()
                await this.nodesPool.initialize()

                // Initialize chatflow pool
                this.chatflowPool = new ChatflowPool()

                // Initialize API keys
                await getAPIKeys()

                // Initialize encryption key
                await getEncryptionKey()

                // Initialize Rate Limit
                const AllChatFlow: IChatFlow[] = await getAllChatFlow()
                await initializeRateLimiter(AllChatFlow)

                // Initialize cache pool
                this.cachePool = new CachePool()

                // Initialize telemetry
                this.telemetry = new Telemetry()
                logger.info('📦 [server]: Data Source has been initialized!')
            })
            .catch((err) => {
                logger.error('❌ [server]: Error during Data Source initialization:', err)
            })
    }

    async config(socketIO?: Server) {
        // Limit is needed to allow sending/receiving base64 encoded string
        const flowise_file_size_limit = process.env.FLOWISE_FILE_SIZE_LIMIT || '50mb'
        this.app.use(express.json({ limit: flowise_file_size_limit }))
        this.app.use(express.urlencoded({ limit: flowise_file_size_limit, extended: true }))
        if (process.env.NUMBER_OF_PROXIES && parseInt(process.env.NUMBER_OF_PROXIES) > 0)
            this.app.set('trust proxy', parseInt(process.env.NUMBER_OF_PROXIES))

        // Allow access from specified domains
        this.app.use(cors(getCorsOptions()))

        // Allow embedding from specified domains.
        this.app.use((req, res, next) => {
            const allowedOrigins = getAllowedIframeOrigins()
            if (allowedOrigins == '*') {
                next()
            } else {
                const csp = `frame-ancestors ${allowedOrigins}`
                res.setHeader('Content-Security-Policy', csp)
                next()
            }
        })

        // Switch off the default 'X-Powered-By: Express' header
        this.app.disable('x-powered-by')

        // Add the expressRequestLogger middleware to log all requests
        this.app.use(expressRequestLogger)

        // Add the sanitizeMiddleware to guard against XSS
        this.app.use(sanitizeMiddleware)

        // Middleware to log the request path and method
        this.app.use((req, res, next) => {
            logger.info(`Request received: ${req.method} ${req.path}`)
            next()
        })

        // API routes should be checked before serving static files
        this.app.use('/api/v1', flowiseApiV1Router)

        // Make io accessible to our router on req.io
        this.app.use((req, res, next) => {
            req.io = socketIO
            next()
        })

        // Serve static files for UI
        this.app.use(express.static(uiBuildPath))

        // This catch-all route handler should be after all other middleware to ensure it only catches unhandled requests
        // It serves index.html for any non-API requests
        this.app.get('*', (req: Request, res: Response, next) => {
            if (req.originalUrl.startsWith('/api/v1')) {
                next() // Pass API requests to the next middleware
            } else {
                res.status(404).send('Not Found') // Respond with 404 for non-API requests not handled by static files
            }
        })

        // Error handling
        this.app.use(errorHandlerMiddleware)
    }

    async stopApp() {
        try {
            const removePromises: any[] = []
            removePromises.push(this.telemetry.flush())
            await Promise.all(removePromises)
        } catch (e) {
            logger.error(`❌[server]: Flowise Server shut down error: ${e}`)
        }
    }
}

let serverApp: App | undefined

export async function getAllChatFlow(): Promise<IChatFlow[]> {
    return await getDataSource().getRepository(ChatFlow).find()
}

export async function start(): Promise<void> {
    serverApp = new App()

    const port = parseInt(process.env.PORT || '', 10) || 3000
    const server = http.createServer(serverApp.app)

    const io = new Server(server, {
        cors: getCorsOptions()
    })

    await serverApp.initDatabase()
    await serverApp.config(io)

    // The basic authentication middleware and other configurations will be placed here

    server.listen(port, () => {
        logger.info(`⚡️ [server]: Flowise Server is listening at ${port}`)
    })
}

export function getInstance(): App | undefined {
    return serverApp
}
