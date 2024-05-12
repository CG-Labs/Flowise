import express from 'express'
import chatflowsService from '../services/chatflows'

const router = express.Router()

// Route to get all chatflows
router.get('/get-all-chatflows', async (req, res) => {
    // Added logging to confirm route is hit
    console.log('Received request for all chatflows')
    try {
        const chatflows = await chatflowsService.getAllChatflows()
        // Added logging to output retrieved chatflows
        console.log('Chatflows retrieved:', chatflows)
        res.setHeader('Content-Type', 'application/json')
        res.json(chatflows)
    } catch (error: any) {
        // Added logging for errors
        console.error('Error retrieving chatflows:', error)
        res.status(500).json({ message: 'Error retrieving chatflows', error: error.message })
    }
})

export default router
