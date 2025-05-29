import { GoogleGenerativeAI } from '@google/generative-ai';
import asyncHandler from 'express-async-handler';

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Project knowledge base
const projectKnowledge = {
  features: [
    'Freelance marketplace for tech professionals',
    'Event management system for tech events',
    'Community platform with groups and direct messaging',
    'User profiles with skills and social links',
    'Support system with AI assistant',
  ],
  categories: [
    'Freelance Gigs',
    'Events',
    'Community',
    'User Profiles',
    'Support',
  ],
  endpoints: [
    '/freelance',
    '/events',
    '/community',
    '/profile',
    '/support',
  ],
};

// Function to check if query is within project scope
const isWithinScope = (query) => {
  const queryLower = query.toLowerCase();
  
  // Check against project knowledge
  const isFeatureRelated = projectKnowledge.features.some(feature => 
    queryLower.includes(feature.toLowerCase())
  );
  
  const isCategoryRelated = projectKnowledge.categories.some(category => 
    queryLower.includes(category.toLowerCase())
  );
  
  const isEndpointRelated = projectKnowledge.endpoints.some(endpoint => 
    queryLower.includes(endpoint.toLowerCase())
  );

  return isFeatureRelated || isCategoryRelated || isEndpointRelated;
};

// Function to get relevant project knowledge
const getRelevantKnowledge = (query) => {
  const queryLower = query.toLowerCase();
  let relevantInfo = [];

  // Add relevant features
  projectKnowledge.features.forEach(feature => {
    if (queryLower.includes(feature.toLowerCase())) {
      relevantInfo.push(feature);
    }
  });

  // Add relevant categories
  projectKnowledge.categories.forEach(category => {
    if (queryLower.includes(category.toLowerCase())) {
      relevantInfo.push(category);
    }
  });

  return relevantInfo.join('. ');
};

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  if (!process.env.GOOGLE_API_KEY) {
    res.status(500);
    throw new Error('Google API key is not configured');
  }

  try {
    // Check if query is within project scope
    if (!isWithinScope(message)) {
      return res.json({
        response: "I apologize, but this question is outside the scope of my knowledge about this project. I can only help with questions related to the TechNexus platform, including freelance services, events, community features, user profiles, and support."
      });
    }

    // Get relevant project knowledge
    const relevantKnowledge = getRelevantKnowledge(message);

    // Create system message with project context
    const systemMessage = `You are an AI assistant for the TechNexus platform. 
    You can only answer questions about the following features:
    ${projectKnowledge.features.join(', ')}
    
    If asked about anything outside these features, respond with "This is outside the scope of my knowledge about this project."
    
    Current relevant information: ${relevantKnowledge}`;

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate response
    const result = await model.generateContent([
      systemMessage,
      message
    ]);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response from Gemini');
    }

    res.json({
      response: text
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      error: 'Error processing your request',
      details: error.message
    });
  }
});

export { chatWithAI }; 