import express from 'express'
import chatflowsService from '../services/chatflows'
import logger from '../utils/logger' // Assuming logger is exported from the utils/logger file

const router = express.Router()

// Route to get all chatflows
router.get('/api/v1/chatflows/get-all-chatflows', async (req, res) => {
    try {
        logger.info('Request received for /api/v1/chatflows/get-all-chatflows')
        const chatflows = await chatflowsService.getAllChatflows()
        res.setHeader('Content-Type', 'application/json')
        res.json(chatflows)
    } catch (error: any) {
        logger.error(`Error in /api/v1/chatflows/get-all-chatflows: ${error.message}, Stack: ${error.stack}`)
        res.status(500).json({ message: 'Error retrieving chatflows', error: error.message })
    }
})

export default router
