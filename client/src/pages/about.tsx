import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function About() {
  return (
    <Container>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About Aca.Ally</h1>
        
        <div className="prose dark:prose-invert max-w-none mb-8">
          <p className="lead text-xl text-gray-600 dark:text-gray-400 mb-6">
            Aca.Ally is a modern educational platform designed to bring together students, teachers, and educational enthusiasts in a vibrant community of learning and sharing.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            We believe that education thrives in community. Our mission is to create an open, accessible platform where knowledge can be freely shared, where students can find help and inspiration, and where educators can connect with those eager to learn.
          </p>
          
          <h2>What We Offer</h2>
          <ul>
            <li>
              <strong>Content Creation & Sharing</strong> - Create rich educational content with our advanced editor, supporting text, images, embeds, and more.
            </li>
            <li>
              <strong>Community Engagement</strong> - Like, share, follow, and save content that interests you. Build your own following by contributing valuable resources.
            </li>
            <li>
              <strong>AI Learning Assistant</strong> - Get help with homework, brainstorm ideas, or clarify concepts with our AI-powered chat assistant.
            </li>
            <li>
              <strong>Subject-Focused Learning</strong> - Browse content by subject to find exactly what you need, when you need it.
            </li>
          </ul>
          
          <h2>Our Team</h2>
          <p>
            Aca.Ally was created by a passionate team of educators, developers, and designers who believe in the power of technology to transform education. We're committed to building tools that make learning more accessible, engaging, and community-driven.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80" 
                alt="Sarah Johnson" 
                className="rounded-full w-28 h-28 mx-auto mb-3 object-cover"
              />
              <h3 className="font-semibold text-lg">Sarah Johnson</h3>
              <p className="text-gray-600 dark:text-gray-400">Founder & Educator</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80" 
                alt="Michael Chen" 
                className="rounded-full w-28 h-28 mx-auto mb-3 object-cover"
              />
              <h3 className="font-semibold text-lg">Michael Chen</h3>
              <p className="text-gray-600 dark:text-gray-400">Lead Developer</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80" 
                alt="Aisha Patel" 
                className="rounded-full w-28 h-28 mx-auto mb-3 object-cover"
              />
              <h3 className="font-semibold text-lg">Aisha Patel</h3>
              <p className="text-gray-600 dark:text-gray-400">UX Designer</p>
            </div>
          </div>
          
          <h2>Our Vision</h2>
          <p>
            We envision a world where quality education is accessible to everyone, regardless of location or background. Aca.Ally aims to be a bridge that connects learners with knowledge, students with teachers, and ideas with communities.
          </p>
          <p>
            As we grow, we plan to expand our platform with more collaborative tools, specialized subject communities, and enhanced learning resources – all driven by the needs of our users and the evolving landscape of education.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center my-10">
          <Button asChild>
            <Link href="/accounts/signup">Join Our Community</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
