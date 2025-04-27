import { Chat } from '../models/mongoose/Chat';
import { Types } from 'mongoose';
import * as tf from '@tensorflow/tfjs';
import nlp from 'compromise';

export class ChatService {
  private model: tf.LayersModel | null = null;
  private responseTemplates = {
    greeting: [
      "Hello! How can I help you with your IT training today?",
      "Hi there! What would you like to learn about?",
      "Welcome! How can I assist you with your IT education?"
    ],
    course: [
      "We offer various IT courses including programming, networking, and cybersecurity.",
      "You can find our course catalog in the courses section.",
      "Our courses are designed to help you build practical IT skills."
    ],
    assessment: [
      "Assessments help track your learning progress.",
      "You can take assessments after completing each module.",
      "Your assessment results will be available in your dashboard."
    ],
    help: [
      "I can help you with course information, assessments, and general guidance.",
      "Feel free to ask me anything about our IT training program.",
      "I'm here to assist you with your learning journey."
    ],
    default: [
      "I'm not sure I understand. Could you rephrase that?",
      "Could you provide more details about what you're looking for?",
      "I'm still learning. Could you try asking in a different way?"
    ]
  };

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    // Create a simple model for intent classification
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [100], units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'softmax' })
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  private preprocessText(text: string): number[] {
    // Simple text preprocessing
    const doc = nlp(text.toLowerCase());
    const words = doc.terms().out('array');
    const vector = new Array(100).fill(0);
    
    // Simple word frequency vector
    words.forEach(word => {
      const index = word.charCodeAt(0) % 100;
      vector[index] += 1;
    });

    return vector;
  }

  private classifyIntent(text: string): string {
    const doc = nlp(text.toLowerCase());
    
    // Basic intent classification using keywords
    if (doc.match('hello|hi|hey|greetings').found) {
      return 'greeting';
    } else if (doc.match('course|courses|class|classes|learn|study').found) {
      return 'course';
    } else if (doc.match('test|exam|assessment|quiz|evaluate').found) {
      return 'assessment';
    } else if (doc.match('help|support|assist|guide|how').found) {
      return 'help';
    }
    
    return 'default';
  }

  private getResponse(intent: string): string {
    const templates = this.responseTemplates[intent as keyof typeof this.responseTemplates] || 
                     this.responseTemplates.default;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  async processMessage(userId: string, message: string) {
    try {
      // Classify intent
      const intent = this.classifyIntent(message);
      
      // Get appropriate response
      const response = this.getResponse(intent);

      // Save the chat message and response
      const chat = new Chat({
        userId: new Types.ObjectId(userId),
        message,
        response,
      });

      await chat.save();

      return chat;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  async getChatHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      Chat.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Chat.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      chats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
} 