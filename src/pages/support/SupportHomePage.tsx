import { useState, useEffect, useRef } from 'react';
import { MessageSquare, CreditCard, Briefcase, User, HelpCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  options?: string[];
}

interface SupportOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  subOptions: {
    id: string;
    title: string;
    content: string;
  }[];
}

const supportOptions: SupportOption[] = [
  {
    id: 'payment',
    title: 'Payment & Billing',
    icon: <CreditCard className="h-6 w-6" />,
    subOptions: [
      {
        id: 'payment-methods',
        title: 'Payment Methods',
        content: 'We accept various payment methods including credit cards, PayPal, and bank transfers. You can manage your payment methods in your account settings.'
      },
      {
        id: 'refunds',
        title: 'Refunds',
        content: 'Refunds are processed within 5-7 business days. If you need a refund, please contact our support team with your order details.'
      },
      {
        id: 'invoices',
        title: 'Invoices',
        content: 'You can download your invoices from your account dashboard under the Billing section.'
      }
    ]
  },
  {
    id: 'gigs',
    title: 'My Gigs',
    icon: <Briefcase className="h-6 w-6" />,
    subOptions: [
      {
        id: 'create-gig',
        title: 'Creating a Gig',
        content: 'To create a new gig, go to your dashboard and click on "Create New Gig". Fill in the required details and submit for review.'
      },
      {
        id: 'manage-gigs',
        title: 'Managing Gigs',
        content: 'You can edit, pause, or delete your gigs from the My Gigs section in your dashboard.'
      },
      {
        id: 'gig-promotion',
        title: 'Promoting Gigs',
        content: 'Use our promotion tools to increase your gig visibility. You can set up targeted ads and special offers.'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account Settings',
    icon: <User className="h-6 w-6" />,
    subOptions: [
      {
        id: 'profile',
        title: 'Profile Settings',
        content: 'Update your profile information, skills, and portfolio in the Profile section.'
      },
      {
        id: 'security',
        title: 'Security',
        content: 'Manage your password, two-factor authentication, and account security settings.'
      },
      {
        id: 'notifications',
        title: 'Notifications',
        content: 'Customize your email and in-app notification preferences.'
      }
    ]
  },
  {
    id: 'general',
    title: 'General Help',
    icon: <HelpCircle className="h-6 w-6" />,
    subOptions: [
      {
        id: 'faq',
        title: 'FAQ',
        content: 'Check our frequently asked questions for quick answers to common queries.'
      },
      {
        id: 'contact',
        title: 'Contact Support',
        content: 'Need more help? Our support team is available 24/7. You can reach us through live chat or email.'
      },
      {
        id: 'community',
        title: 'Community',
        content: 'Join our community forum to connect with other users and share experiences.'
      }
    ]
  }
];

const SupportHomePage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: 'Hello! How can I help you today?',
      isBot: true,
      options: supportOptions.map(option => option.title)
    }
  ]);
  const [selectedOption, setSelectedOption] = useState<SupportOption | null>(null);
  const [selectedSubOption, setSelectedSubOption] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOptionSelect = (optionTitle: string) => {
    const option = supportOptions.find(opt => opt.title === optionTitle);
    if (option) {
      setSelectedOption(option);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: `You selected: ${option.title}`,
          isBot: false
        },
        {
          id: prev.length + 2,
          text: 'What would you like to know about?',
          isBot: true,
          options: option.subOptions.map(subOpt => subOpt.title)
        }
      ]);
    }
  };

  const handleSubOptionSelect = (subOptionTitle: string) => {
    if (selectedOption) {
      const subOption = selectedOption.subOptions.find(subOpt => subOpt.title === subOptionTitle);
      if (subOption) {
        setSelectedSubOption(subOption.id);
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            text: `You selected: ${subOption.title}`,
            isBot: false
          },
          {
            id: prev.length + 2,
            text: subOption.content,
            isBot: true
          },
          {
            id: prev.length + 3,
            text: 'Is there anything else you\'d like to know?',
            isBot: true,
            options: ['Back to Main Menu', 'Contact Support']
          }
        ]);
      }
    }
  };

  const handleBackToMain = () => {
    setSelectedOption(null);
    setSelectedSubOption(null);
    setMessages([
      {
        id: 1,
        text: 'Hello! How can I help you today?',
        isBot: true,
        options: supportOptions.map(option => option.title)
      }
    ]);
  };

  const handleContactSupport = () => {
    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        text: 'You can contact our support team through:',
        isBot: true,
        options: ['Email Support', 'Live Chat', 'Back to Main Menu']
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Support Chat</h1>
                  <p className="text-white/80 text-sm">We're here to help!</p>
                </div>
              </div>
              <button
                onClick={handleBackToMain}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.isBot
                        ? 'bg-white dark:bg-gray-800 shadow-sm'
                        : 'bg-primary-600 text-white'
                    }`}
                  >
                    <p className="mb-2">{message.text}</p>
                    {message.options && (
                      <div className="space-y-2">
                        {message.options.map((option) => (
                          <motion.button
                            key={option}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (option === 'Back to Main Menu') {
                                handleBackToMain();
                              } else if (option === 'Contact Support') {
                                handleContactSupport();
                              } else if (selectedOption) {
                                handleSubOptionSelect(option);
                              } else {
                                handleOptionSelect(option);
                              }
                            }}
                            className="block w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Access Buttons */}
          <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {supportOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect(option.title)}
                  className="flex items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 group-hover:bg-primary-200 dark:group-hover:bg-primary-900 transition-colors">
                      {option.icon}
                    </div>
                    <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {option.title}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportHomePage; 