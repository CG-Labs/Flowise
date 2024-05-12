import express from 'express'
import chatflowsController from '../../controllers/chatflows'
const router = express.Router()

// CREATE
router.post('/', chatflowsController.saveChatflow)

// READ
router.get('/all', chatflowsController.getAllChatflows) // Adjusted route to prevent conflict with '/:id'
router.get('/:id', chatflowsController.getChatflowById)
router.get('/apikey/:apikey', chatflowsController.getChatflowByApiKey)

// UPDATE
router.put('/:id', chatflowsController.updateChatflow)

// DELETE
router.delete('/:id', chatflowsController.deleteChatflow)

export default router
