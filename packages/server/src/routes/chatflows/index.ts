import express from 'express'
import chatflowsController from '../../controllers/chatflows'
const router = express.Router()

// CREATE
router.post('/', chatflowsController.saveChatflow)

// READ
router.get('/all', chatflowsController.getAllChatflows) // Route to get all chatflows
router.get('/apikey/:apikey', chatflowsController.getChatflowByApiKey) // Route to get a chatflow by API key
router.get('/:id', chatflowsController.getChatflowById) // Route to get a chatflow by ID

// UPDATE
router.put('/:id', chatflowsController.updateChatflow)

// DELETE
router.delete('/:id', chatflowsController.deleteChatflow)

export default router
