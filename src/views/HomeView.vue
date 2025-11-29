<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToCreate = () => {
  router.push('/create')
}

onMounted(() => {
  // Setup intersection observer for smooth fade-in animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    },
    { threshold: 0.1 },
  )

  // Observe all feature cards and steps
  document.querySelectorAll('.feature-card, .step').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">CV Generator</h1>
        <p class="hero-subtitle">Create Professional Resumes in Minutes</p>
        <div class="hero-decoration">
          <div class="decoration-line"></div>
        </div>
      </div>
      <div class="scroll-indicator">
        <span>Scroll to learn more</span>
        <div class="scroll-arrow">↓</div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="features-container">
        <div class="feature-card">
          <div class="feature-icon">📄</div>
          <h2>Professional Templates</h2>
          <p>
            Choose from beautifully designed CV templates that make a lasting impression. Our
            layouts are optimized for both digital viewing and printing, ensuring your resume looks
            perfect in any format.
          </p>
          <span class="dev-badge">More templates in development</span>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h2>Customizable Design</h2>
          <p>
            Personalize your CV with independent dark mode controls for the interface and document.
            Adjust colors, fonts, and layouts to match your personal brand and stand out from the
            competition.
          </p>
          <span class="dev-badge">Additional customization options coming soon</span>
        </div>

        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h2>Fast & Easy</h2>
          <p>
            Build your CV in minutes with our intuitive interface. Simply fill in your information,
            and watch as your professional resume takes shape in real-time with live preview
            capabilities.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h2>Responsive Preview</h2>
          <p>
            View your CV exactly as it will appear with our A4 format preview. Zoom, pan, and
            inspect every detail to ensure perfection before exporting your final document.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">💾</div>
          <h2>Export to PDF</h2>
          <p>
            Download your CV as a high-quality PDF file ready for submission. Your document will be
            perfectly formatted and compatible with all applicant tracking systems.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h2>Privacy First</h2>
          <p>
            Your data stays in your browser. We don't store any personal information on our servers.
            Everything is saved locally, giving you complete control over your sensitive career
            information.
          </p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <h2 class="section-title">How It Works</h2>
      <div class="steps-container">
        <div class="step">
          <div class="step-number">1</div>
          <h3>Enter Your Information</h3>
          <p>Fill in your personal details, work experience, education, skills, and more.</p>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">2</div>
          <h3>Customize Your Design</h3>
          <p>Choose your preferred layout and styling options to match your personal brand.</p>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">3</div>
          <h3>Preview & Export</h3>
          <p>Review your CV in real-time and download it as a professional PDF document.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Ready to Build Your Professional CV?</h2>
        <p class="cta-description">
          Become a professional who created their perfect resume with our free, easy-to-use CV
          generator.
        </p>
        <button @click="navigateToCreate" class="cta-button">
          Create Your Personal CV
          <span class="button-arrow">→</span>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2025 J. Feser. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #fafafa;
  position: relative;
  overflow-x: hidden;
}

/* Hero Section - Schlichte Farben */
.hero-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  background: #2c3e50;
  color: white;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  position: relative;
}

.hero-title {
  font-size: 5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  letter-spacing: -2px;
  opacity: 0;
  animation: fadeInUp 1s ease-out forwards;
}

.hero-subtitle {
  font-size: 1.75rem;
  font-weight: 300;
  margin: 0 0 2rem 0;
  opacity: 0;
  animation: fadeInUp 1s ease-out 0.3s forwards;
  color: rgba(255, 255, 255, 0.9);
}

.hero-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  opacity: 0;
  animation: fadeInUp 1s ease-out 0.6s forwards;
}

.decoration-line {
  width: 120px;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.6;
  z-index: 1;
  animation: gentleBounce 3s ease-in-out infinite;
}

.scroll-indicator span {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.scroll-arrow {
  font-size: 1.5rem;
}

@keyframes gentleBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

/* Features Section */
.features-section {
  padding: 6rem 2rem;
  background: #fafafa;
  position: relative;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2.5rem;
  background: white;
  border-radius: 12px;
  transition: all 0.5s ease;
  border: 1px solid #e5e7eb;
  position: relative;
  opacity: 0;
  transform: translateY(30px);
}

.feature-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: inline-block;
  transition: transform 0.5s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
  transition: color 0.3s ease;
}

.feature-card:hover h2 {
  color: #475569;
}

.feature-card p {
  font-size: 1rem;
  line-height: 1.7;
  color: #64748b;
  margin: 0;
}

.dev-badge {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #94a3b8;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: background 0.3s ease;
}

.feature-card:hover .dev-badge {
  background: #64748b;
}

/* How It Works Section */
.how-it-works-section {
  padding: 6rem 2rem;
  background: #f1f5f9;
  position: relative;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  text-align: center;
  margin: 0 0 4rem 0;
  color: #1e293b;
}

.steps-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.step {
  flex: 1;
  min-width: 250px;
  text-align: center;
  padding: 2rem;
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.6s ease;
}

.step.animate-in {
  opacity: 1;
  transform: scale(1);
}

.step-number {
  width: 60px;
  height: 60px;
  background: #2c3e50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  margin: 0 auto 1.5rem auto;
  position: relative;
  transition: all 0.4s ease;
}

.step:hover .step-number {
  transform: scale(1.1);
  box-shadow: 0 8px 16px rgba(44, 62, 80, 0.2);
}

.step h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.step p {
  font-size: 1rem;
  line-height: 1.7;
  color: #64748b;
  margin: 0;
}

.step-arrow {
  font-size: 2rem;
  color: #cbd5e1;
}

/* CTA Section */
.cta-section {
  padding: 8rem 2rem;
  background: #fafafa;
  position: relative;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
}

.cta-description {
  font-size: 1.25rem;
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 3rem 0;
}

.cta-button {
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  background: #2c3e50;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.4s ease;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.15);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(44, 62, 80, 0.25);
  background: #34495e;
}

.cta-button:active {
  transform: translateY(-1px);
}

.button-arrow {
  font-size: 1.5rem;
  transition: transform 0.4s ease;
  display: inline-block;
}

.cta-button:hover .button-arrow {
  transform: translateX(5px);
}

/* Footer */
.footer {
  padding: 2rem;
  text-align: center;
  background: #1e293b;
  color: #94a3b8;
}

.footer p {
  margin: 0;
  font-size: 0.875rem;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .steps-container {
    flex-direction: column;
  }

  .step-arrow {
    transform: rotate(90deg);
  }

  .features-container {
    grid-template-columns: 1fr;
  }
}
</style>
