// Import the necessary services
const chatflowsService = require('./services/chatflows')

// Function to retrieve and log all chatflow IDs
async function getAllChatflowIds() {
  try {
    const chatflows = await chatflowsService.getChatflows()
    const chatflowIds = chatflows.map(cf => cf.id)
    console.log('Chatflow IDs:', chatflowIds)
  } catch (error) {
    console.error('Error retrieving chatflows:', error)
  }
}

// Execute the function
getAllChatflowIds()
