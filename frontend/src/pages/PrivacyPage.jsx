import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPage({ onBack }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-gray-950/80 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-white font-bold text-lg">Privacy Policy</h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="prose prose-invert max-w-none space-y-8">
          <div>
            <p className="text-gray-400 text-sm mb-4">Last updated: June 26, 2026</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Gita Gyan ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered spiritual mentor application.
            </p>
          </div>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. Information We Collect</h2>
            <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
              <p><strong className="text-white">Account Information:</strong> If you choose to create an account, we collect your email address and name. You may also use the app without an account.</p>
              <p><strong className="text-white">Chat Conversations:</strong> Your conversations with the AI mentor are processed to provide responses. Conversations are stored to maintain context within sessions.</p>
              <p><strong className="text-white">Usage Data:</strong> We collect anonymized usage analytics including pages visited, features used, and interaction patterns to improve the app.</p>
              <p><strong className="text-white">Device Information:</strong> Browser type, operating system, and screen size for optimal display.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. How We Use Your Information</h2>
            <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
              <p>To provide and maintain the AI spiritual mentor service.</p>
              <p>To personalize your experience and provide relevant Gita wisdom.</p>
              <p>To track your spiritual journey progress (streaks, achievements, quizzes).</p>
              <p>To improve the quality and accuracy of AI responses.</p>
              <p>To send daily verse notifications (only if you opt in).</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. Data Storage & Security</h2>
            <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
              <p>Your data is stored securely using industry-standard encryption. We use Supabase (PostgreSQL) for database storage with row-level security.</p>
              <p>Chat conversations are processed by AI providers (OpenAI, Google Gemini) subject to their respective privacy policies.</p>
              <p>We do not sell, trade, or share your personal information with third parties for marketing purposes.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. AI & Third-Party Services</h2>
            <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
              <p><strong className="text-white">AI Processing:</strong> Your messages are sent to AI providers (OpenAI, Google Gemini) to generate responses. These providers do not use your data to train their models.</p>
              <p><strong className="text-white">Analytics:</strong> We use Google Analytics for anonymized usage data. No personally identifiable information is shared.</p>
              <p><strong className="text-white">Push Notifications:</strong> Web push notifications require your explicit opt-in and can be disabled at any time.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. Your Rights</h2>
            <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
              <p>You may request access to, correction of, or deletion of your personal data at any time.</p>
              <p>You may export your data or request account deletion by contacting us.</p>
              <p>You may opt out of non-essential data collection (analytics, push notifications).</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. Children's Privacy</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Gita Gyan is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. Changes to This Policy</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. Contact Us</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@gitagyan.app" className="text-amber-400 hover:text-amber-300 transition-colors">privacy@gitagyan.app</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
