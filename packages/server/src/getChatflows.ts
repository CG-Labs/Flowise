// Import the necessary services
import chatflowsService from './services/chatflows';

// Function to retrieve and log all chatflow IDs
async function getAllChatflowIds() {
  try {
    const chatflows = await chatflowsService.getAllChatflows();
    const chatflowIds = chatflows.map((cf: any) => cf.id);
    console.log('Chatflow IDs:', chatflowIds);
  } catch (error: any) {
    console.error('Error retrieving chatflows:', error);
  }
}

// Execute the function
getAllChatflowIds();
