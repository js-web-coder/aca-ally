import { Container } from '@/components/layout/container';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function FAQ() {
  const faqCategories = [
    {
      id: 'general',
      title: 'General Questions',
      questions: [
        {
          id: 'what-is',
          question: 'What is Aca.Ally?',
          answer: 'Aca.Ally is an educational platform that connects students, teachers, and educational enthusiasts. It allows users to create, share, and engage with educational content while fostering a vibrant learning community.'
        },
        {
          id: 'who-for',
          question: 'Who can use Aca.Ally?',
          answer: 'Aca.Ally is designed for students of all ages, teachers, professors, tutors, and anyone interested in education. Whether you\'re looking to share knowledge, find help with homework, or connect with like-minded learners, our platform is for you.'
        },
        {
          id: 'cost',
          question: 'Is Aca.Ally free to use?',
          answer: 'Yes, Aca.Ally is currently free to use. We believe in making educational resources accessible to everyone. In the future, we may introduce premium features, but the core functionality will always remain free.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      questions: [
        {
          id: 'create-account',
          question: 'How do I create an account?',
          answer: 'To create an account, click the "Sign Up" button in the top-right corner of the page. You\'ll need to provide a username, email address, and password. After signing up, you\'ll receive a verification email to confirm your account.'
        },
        {
          id: 'edit-profile',
          question: 'How do I edit my profile?',
          answer: 'Once logged in, click on your profile picture in the top-right corner and select "Profile" from the dropdown menu. On your profile page, you\'ll find an "Edit Profile" button that allows you to update your information, add a profile picture, and more.'
        },
        {
          id: 'forgot-password',
          question: 'I forgot my password. How can I reset it?',
          answer: 'On the login page, click the "Forgot password?" link. Enter your email address, and we\'ll send you instructions to reset your password. Make sure to check your spam folder if you don\'t see the email in your inbox.'
        }
      ]
    },
    {
      id: 'content',
      title: 'Content & Posting',
      questions: [
        {
          id: 'create-post',
          question: 'How do I create a post?',
          answer: 'After logging in, click on your profile picture and select "Create Post" from the dropdown menu. Alternatively, you can navigate to the "Create Post" page directly. Use our rich text editor to format your content, add images, embed videos, and more.'
        },
        {
          id: 'content-types',
          question: 'What types of content can I post?',
          answer: 'You can post text, images, embedded videos (like YouTube), and links. Our rich text editor supports various formatting options including headings, lists, quotes, and more to help you create engaging educational content.'
        },
        {
          id: 'post-visibility',
          question: 'Can I control who sees my posts?',
          answer: 'Yes, when creating a post, you can set its visibility to "Public" (visible to everyone), "Private" (visible only to you), or "Followers Only" (visible to your followers). You can also edit a post\'s visibility settings after publishing.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Features & Functionality',
      questions: [
        {
          id: 'ai-chat',
          question: 'What is the AI Chat feature?',
          answer: 'The AI Chat is an intelligent assistant powered by OpenAI that can help you with homework questions, explain concepts, provide study resources, or engage in educational conversations. It\'s designed to provide accurate and helpful information in an educational context.'
        },
        {
          id: 'follow-users',
          question: 'How do I follow other users?',
          answer: 'To follow another user, visit their profile page and click the "Follow" button. Once you follow someone, their public posts will appear in your feed, and you\'ll receive notifications about their new content (if you have notifications enabled).'
        },
        {
          id: 'save-posts',
          question: 'How do I save posts for later?',
          answer: 'Each post has a bookmark icon (🔖) that you can click to save the post. To view your saved posts, go to your profile and select the "Saved" tab. Saved posts are private and only visible to you.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      questions: [
        {
          id: 'browser-compatibility',
          question: 'Which browsers support Aca.Ally?',
          answer: 'Aca.Ally works best on modern browsers like Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version for the best experience. Some features may not work properly on older browsers.'
        },
        {
          id: 'report-issue',
          question: 'How do I report a technical issue?',
          answer: 'If you encounter a technical issue, please visit our Contact page and submit a detailed description of the problem. Include information about your browser, device, and steps to reproduce the issue if possible. Screenshots are also helpful.'
        },
        {
          id: 'data-privacy',
          question: 'How is my data protected?',
          answer: 'We take data privacy seriously. Your personal information is encrypted and stored securely. We do not sell your data to third parties. For detailed information, please refer to our Privacy Policy page.'
        }
      ]
    }
  ];

  return (
    <Container>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Find answers to common questions about using Aca.Ally. If you can't find what you're looking for, feel free to contact us.
        </p>
        
        <div className="space-y-8">
          {faqCategories.map(category => (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">{category.title}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, index) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-1 text-gray-600 dark:text-gray-400">
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <h2 className="text-xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you couldn't find the answer to your question, our support team is here to help.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
