import express from 'express'
import chatflowsService from '../services/chatflows'

const router = express.Router()

// Route to get all chatflows
router.get('/get-all-chatflows', async (req, res) => {
  try {
    const chatflows = await chatflowsService.getAllChatflows()
    res.json(chatflows)
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving chatflows', error: error.message })
  }
})

export default router
