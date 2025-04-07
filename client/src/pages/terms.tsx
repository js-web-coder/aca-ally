import { Container } from '@/components/layout/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Terms() {
  return (
    <Container>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms & Policies</h1>
        
        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
            <TabsTrigger value="community">Community Guidelines</TabsTrigger>
          </TabsList>
          
          <TabsContent value="terms" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <h2>Terms of Service</h2>
              <p>Last updated: January 15, 2023</p>
              
              <h3>1. Introduction</h3>
              <p>
                Welcome to Aca.Ally. These Terms of Service govern your use of our website and services. By accessing or using Aca.Ally, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
              </p>
              
              <h3>2. Accounts</h3>
              <p>
                When you create an account with us, you must provide accurate, complete, and up-to-date information. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
              </p>
              
              <h3>3. Content</h3>
              <p>
                Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material. You are responsible for the content that you post, including its legality, reliability, and appropriateness.
              </p>
              <p>
                By posting content to Aca.Ally, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the service. You retain any and all of your rights to any content you submit, post, or display on or through the service.
              </p>
              
              <h3>4. Use License</h3>
              <p>
                Permission is granted to temporarily download one copy of the materials on Aca.Ally for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials;</li>
                <li>Use the materials for any commercial purpose;</li>
                <li>Attempt to decompile or reverse engineer any software contained on Aca.Ally;</li>
                <li>Remove any copyright or other proprietary notations from the materials; or</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
              </ul>
              
              <h3>5. Termination</h3>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              
              <h3>6. Limitation of Liability</h3>
              <p>
                In no event shall Aca.Ally, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
              
              <h3>7. Changes</h3>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              
              <h3>8. Contact Us</h3>
              <p>
                If you have any questions about these Terms, please contact us at terms@aca.ally.com.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <h2>Privacy Policy</h2>
              <p>Last updated: January 15, 2023</p>
              
              <h3>1. Information We Collect</h3>
              <p>
                We collect information you provide directly to us when you create an account, update your profile, post content, or communicate with other users. This information may include your name, email address, username, password, profile picture, and any other information you choose to provide.
              </p>
              
              <h3>2. How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services;</li>
                <li>Process transactions and send related information;</li>
                <li>Send technical notices, updates, security alerts, and support messages;</li>
                <li>Respond to your comments, questions, and requests;</li>
                <li>Communicate with you about products, services, offers, and events;</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
              </ul>
              
              <h3>3. Sharing of Information</h3>
              <p>
                We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
              </p>
              
              <h3>4. Data Retention</h3>
              <p>
                We will retain your information for as long as your account is active or as needed to provide you services. If you wish to cancel your account or request that we no longer use your information, please contact us.
              </p>
              
              <h3>5. Security</h3>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
              </p>
              
              <h3>6. Changes to this Policy</h3>
              <p>
                We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
              </p>
              
              <h3>7. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@aca.ally.com.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="cookies" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <h2>Cookie Policy</h2>
              <p>Last updated: January 15, 2023</p>
              
              <h3>1. What Are Cookies</h3>
              <p>
                Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the service or a third-party to recognize you and make your next visit easier and the service more useful to you.
              </p>
              
              <h3>2. How We Use Cookies</h3>
              <p>We use cookies for the following purposes:</p>
              <ul>
                <li>To enable certain functions of the service</li>
                <li>To provide analytics</li>
                <li>To store your preferences</li>
                <li>To enable advertisements delivery, including behavioral advertising</li>
              </ul>
              
              <h3>3. Types of Cookies We Use</h3>
              <p>Essential cookies: These are cookies that are required for the operation of our website.</p>
              <p>Analytical/performance cookies: These allow us to recognize and count the number of visitors and to see how visitors move around our website.</p>
              <p>Functionality cookies: These are used to recognize you when you return to our website.</p>
              <p>Targeting cookies: These record your visit to our website, the pages you have visited and the links you have followed.</p>
              
              <h3>4. Your Choices Regarding Cookies</h3>
              <p>
                If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser.
              </p>
              <p>
                Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
              </p>
              
              <h3>5. Changes to This Cookie Policy</h3>
              <p>
                We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page.
              </p>
              
              <h3>6. Contact Us</h3>
              <p>
                If you have any questions about our Cookie Policy, please contact us at cookies@aca.ally.com.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="community" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <h2>Community Guidelines</h2>
              <p>Last updated: January 15, 2023</p>
              
              <h3>1. Be Respectful</h3>
              <p>
                Treat others with respect. Do not attack others based on their race, ethnicity, national origin, gender, gender identity, sexual orientation, religious affiliation, age, or disability.
              </p>
              
              <h3>2. Create Quality Content</h3>
              <p>
                Create content that is educational, informative, and helpful. Avoid posting misleading information, and cite sources when appropriate.
              </p>
              
              <h3>3. No Harassment or Bullying</h3>
              <p>
                Do not engage in harassment, bullying, or intimidation of any individual or group. This includes threats, insults, and encouraging others to engage in negative behavior.
              </p>
              
              <h3>4. No Spam or Self-Promotion</h3>
              <p>
                Do not post content primarily to advertise a product or service. While sharing resources is encouraged, excessive self-promotion is not.
              </p>
              
              <h3>5. Protect Privacy</h3>
              <p>
                Do not share personal information about others without their consent. This includes names, addresses, email addresses, phone numbers, or other identifying information.
              </p>
              
              <h3>6. Follow Copyright Laws</h3>
              <p>
                Only post content that you have the right to share. Respect copyright laws and give credit to original creators when sharing their work.
              </p>
              
              <h3>7. No Inappropriate Content</h3>
              <p>
                Do not post content that contains explicit language, violence, or adult themes inappropriate for an educational platform.
              </p>
              
              <h3>8. Report Violations</h3>
              <p>
                If you see content that violates these guidelines, please report it. Moderators will review reported content and take appropriate action.
              </p>
              
              <h3>9. Consequences of Violations</h3>
              <p>
                Violations of these guidelines may result in content removal, temporary suspension, or permanent banning from the platform, depending on the severity and frequency of the violations.
              </p>
              
              <h3>10. Changes to Guidelines</h3>
              <p>
                These guidelines may be updated from time to time. Users will be notified of significant changes.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}
