import express from 'express'
import chatflowsController from '../../controllers/chatflows'
const router = express.Router()

// CREATE
router.post('/', chatflowsController.saveChatflow)

// READ
// Route to explicitly get all chatflows
router.get('/get-all', chatflowsController.getAllChatflows)
// Route to get a chatflow by API key
router.get('/apikey/:apikey', chatflowsController.getChatflowByApiKey)
// Route to get a chatflow by ID
// The order of this route is important to avoid conflict with '/get-all'
// Placing a regex to ensure 'get-all' is not matched as an ID
router.get('/:id(\\d+)', chatflowsController.getChatflowById)

// UPDATE
router.put('/:id(\\d+)', chatflowsController.updateChatflow)

// DELETE
router.delete('/:id(\\d+)', chatflowsController.deleteChatflow)

export default router
