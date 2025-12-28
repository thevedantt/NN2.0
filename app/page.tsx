"use client"

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Menu, X, CheckCircle, Users, Brain, Heart, Shield, Zap, TrendingUp } from 'lucide-react';
import DoctorModelWrapper from "@/components/DoctorModelWrapper";
import Image from 'next/image';

export default function NeuraNetLanding() {
  const [isDark, setIsDark] = useState(false);
  const [isHindi, setIsHindi] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const content = {
    en: {
      nav: {
        features: 'Features',
        howItWorks: 'How It Works',
        therapists: 'For Therapists',
        ngos: 'For NGOs',
        about: 'About Us',
        cta: 'Get Started'
      },
      hero: {
        headline: 'Mental Wellness, Reimagined for Real Life',
        subheadline: 'NeuroNet is an AI-powered mental wellness platform that combines AI companionship, human support, and professional care — all in one safe, accessible space.',
        supporting: 'Built for individuals, therapists, and communities across India.',
        primaryCta: 'Start Your Journey',
        secondaryCta: 'Explore as Therapist',
        trust: ['Privacy-first', 'India-focused care', 'AI + Human-in-the-loop']
      },
      why: {
        heading: 'Why NeuroNet?',
        cards: [
          { title: 'Always There', desc: '24/7 AI Companion to listen, guide, and support — without judgment.' },
          { title: 'Right Help, Right Time', desc: 'AI intelligently connects you to a Buddy or Therapist based on your needs.' },
          { title: 'Built for Real People', desc: 'Designed for everyday stress, anxiety, and life challenges — not just emergencies.' }
        ]
      },
      how: {
        heading: 'How It Works',
        steps: [
          { title: 'Talk Freely', desc: 'Start with an AI companion that understands emotions and responds with care.' },
          { title: 'Understand Yourself', desc: 'Take simple self-assessments and get meaningful insights — not labels.' },
          { title: 'Get Human Support', desc: 'Connect with trained buddies or verified therapists when you\'re ready.' },
          { title: 'Heal at Your Pace', desc: 'From calming content to professional sessions — you stay in control.' }
        ]
      },
      roles: {
        therapist: {
          title: 'For Therapists',
          desc: 'Join NeuroNet to reach people who genuinely need support.',
          points: ['Verified onboarding', 'Flexible availability', 'Ethical AI assistance', 'Fair, transparent session fees'],
          cta: 'Join as Therapist'
        },
        buddy: {
          title: 'For Buddies',
          desc: 'Be there for someone. Sometimes, listening is enough.',
          points: ['Peer support training', 'Interest-based matching', 'Safe & guided conversations'],
          cta: 'Become a Buddy'
        }
      },
      ngo: {
        heading: 'Partnering for Mental Health at Scale',
        desc: 'NeuroNet collaborates with NGOs, educational institutions, and community organizations to make mental wellness accessible where it\'s needed most.',
        useCases: ['Community mental health programs', 'Student wellness initiatives', 'Rural & underserved support', 'Crisis-prevention outreach'],
        models: ['White-labeled access', 'Sponsored therapy sessions', 'Data-driven impact reports (privacy-safe)'],
        cta: 'Partner with NeuroNet'
      },
      business: {
        heading: 'A Sustainable, Ethical SaaS Model',
        points: ['Free AI companion access', 'Pay-per-session therapy', 'Subscription plans for organizations', 'NGO-sponsored access for communities'],
        tagline: 'Care remains accessible. Growth remains responsible.'
      },
      about: {
        heading: 'About NeuroNet',
        text: 'NeuroNet was built with a simple belief — mental health support should be accessible, respectful, and human. We combine AI, psychology, and community-driven care to reduce the gap between people and help.'
      },
      footer: {
        tagline: 'Your space. Your pace.',
        links: ['Privacy Policy', 'Terms of Use', 'Safety & Disclaimers'],
        contact: ['Contact', 'For Therapists', 'For NGOs']
      }
    },
    hi: {
      nav: {
        features: 'विशेषताएं',
        howItWorks: 'कैसे काम करता है',
        therapists: 'चिकित्सकों के लिए',
        ngos: 'एनजीओ के लिए',
        about: 'हमारे बारे में',
        cta: 'शुरू करें'
      },
      hero: {
        headline: 'मानसिक स्वास्थ्य, वास्तविक जीवन के लिए नया रूप',
        subheadline: 'NeuroNet एक AI-संचालित मानसिक स्वास्थ्य मंच है जो AI साथी, मानवीय सहायता और पेशेवर देखभाल को एक सुरक्षित, सुलभ स्थान में जोड़ता है।',
        supporting: 'भारत भर में व्यक्तियों, चिकित्सकों और समुदायों के लिए बनाया गया।',
        primaryCta: 'अपनी यात्रा शुरू करें',
        secondaryCta: 'चिकित्सक के रूप में देखें',
        trust: ['गोपनीयता-प्रथम', 'भारत-केंद्रित देखभाल', 'AI + मानव-सहायक']
      },
      why: {
        heading: 'NeuroNet क्यों?',
        cards: [
          { title: 'हमेशा उपलब्ध', desc: '24/7 AI साथी सुनने, मार्गदर्शन करने और समर्थन करने के लिए — बिना किसी निर्णय के।' },
          { title: 'सही मदद, सही समय', desc: 'AI आपकी जरूरतों के आधार पर आपको एक साथी या चिकित्सक से जोड़ता है।' },
          { title: 'वास्तविक लोगों के लिए', desc: 'रोजमर्रा के तनाव, चिंता और जीवन की चुनौतियों के लिए डिज़ाइन किया गया।' }
        ]
      },
      how: {
        heading: 'कैसे काम करता है',
        steps: [
          { title: 'स्वतंत्र रूप से बात करें', desc: 'एक AI साथी के साथ शुरू करें जो भावनाओं को समझता है।' },
          { title: 'खुद को समझें', desc: 'सरल आत्म-मूल्यांकन लें और सार्थक अंतर्दृष्टि प्राप्त करें।' },
          { title: 'मानवीय सहायता प्राप्त करें', desc: 'जब आप तैयार हों तो प्रशिक्षित साथियों या सत्यापित चिकित्सकों से जुड़ें।' },
          { title: 'अपनी गति से ठीक हों', desc: 'शांत सामग्री से लेकर पेशेवर सत्र तक — आप नियंत्रण में रहते हैं।' }
        ]
      },
      roles: {
        therapist: {
          title: 'चिकित्सकों के लिए',
          desc: 'उन लोगों तक पहुंचने के लिए NeuroNet में शामिल हों जिन्हें वास्तव में सहायता की आवश्यकता है।',
          points: ['सत्यापित ऑनबोर्डिंग', 'लचीली उपलब्धता', 'नैतिक AI सहायता', 'निष्पक्ष सत्र शुल्क'],
          cta: 'चिकित्सक के रूप में जुड़ें'
        },
        buddy: {
          title: 'साथियों के लिए',
          desc: 'किसी के लिए वहां रहें। कभी-कभी, सुनना ही काफी है।',
          points: ['सहकर्मी सहायता प्रशिक्षण', 'रुचि-आधारित मिलान', 'सुरक्षित बातचीत'],
          cta: 'साथी बनें'
        }
      },
      ngo: {
        heading: 'मानसिक स्वास्थ्य के लिए साझेदारी',
        desc: 'NeuroNet एनजीओ, शैक्षणिक संस्थानों और सामुदायिक संगठनों के साथ सहयोग करता है।',
        useCases: ['सामुदायिक मानसिक स्वास्थ्य कार्यक्रम', 'छात्र कल्याण पहल', 'ग्रामीण सहायता', 'संकट-रोकथाम'],
        models: ['व्हाइट-लेबल पहुंच', 'प्रायोजित चिकित्सा सत्र', 'डेटा-संचालित रिपोर्ट'],
        cta: 'साझेदार बनें'
      },
      business: {
        heading: 'एक स्थायी, नैतिक SaaS मॉडल',
        points: ['मुफ्त AI साथी', 'प्रति-सत्र चिकित्सा', 'संगठनों के लिए सदस्यता', 'एनजीओ-प्रायोजित पहुंच'],
        tagline: 'देखभाल सुलभ रहती है। विकास जिम्मेदार रहता है।'
      },
      about: {
        heading: 'NeuroNet के बारे में',
        text: 'NeuroNet एक सरल विश्वास के साथ बनाया गया था — मानसिक स्वास्थ्य सहायता सुलभ, सम्मानजनक और मानवीय होनी चाहिए।'
      },
      footer: {
        tagline: 'आपकी जगह। आपकी गति।',
        links: ['गोपनीयता नीति', 'उपयोग की शर्तें', 'सुरक्षा और अस्वीकरण'],
        contact: ['संपर्क करें', 'चिकित्सकों के लिए', 'एनजीओ के लिए']
      }
    }
  };

  const t = isHindi ? content.hi : content.en;

  const theme = isDark ? {
    bg: 'bg-[#113E53]',
    text: 'text-white',
    primary: 'bg-[#F1626B] hover:bg-[#F1626B]/90',
    secondary: 'bg-[#EFC18F] hover:bg-[#EFC18F]/90 text-[#113E53]',
    card: 'bg-[#113E53]/50 border-[#F1626B]/20',
    accent: 'text-[#F1626B]',
    softAccent: 'text-[#EFC18F]'
  } : {
    bg: 'bg-[#F9E7C9]',
    text: 'text-[#280B0B]',
    primary: 'bg-[#781C2E] hover:bg-[#781C2E]/90 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-[#781C2E] border-2 border-[#781C2E]',
    card: 'bg-white border-[#781C2E]/10',
    accent: 'text-[#781C2E]',
    softAccent: 'text-[#781C2E]/70'
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300`}>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? (isDark ? 'bg-[#113E53]/95 backdrop-blur-md shadow-lg' : 'bg-white/95 backdrop-blur-md shadow-lg') : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold flex items-center gap-2">
              <Image src="/nn.png" alt="NeuroNet Logo" width={32} height={32} className="w-8 h-8 object-contain" />
              <span>NeuroNet</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="hover:opacity-70 transition-opacity">{t.nav.features}</a>
              <a href="#how" className="hover:opacity-70 transition-opacity">{t.nav.howItWorks}</a>
              <a href="#therapists" className="hover:opacity-70 transition-opacity">{t.nav.therapists}</a>
              <a href="#about" className="hover:opacity-70 transition-opacity">{t.nav.about}</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setIsHindi(!isHindi)} className="px-3 py-1 rounded-lg hover:bg-black/5 transition-colors flex items-center gap-1">
                <Globe size={16} />
                <span className="text-sm font-medium">{isHindi ? 'HI' : 'EN'}</span>
              </button>
              <button onClick={() => window.location.href = '/auth/login'} className={`hidden md:block px-6 py-2 rounded-full font-medium transition-all ${theme.primary}`}>
                {t.nav.cta}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 flex flex-col gap-3">
              <a href="#features" className="py-2 hover:opacity-70">{t.nav.features}</a>
              <a href="#how" className="py-2 hover:opacity-70">{t.nav.howItWorks}</a>
              <a href="#therapists" className="py-2 hover:opacity-70">{t.nav.therapists}</a>
              <a href="#about" className="py-2 hover:opacity-70">{t.nav.about}</a>
              <button onClick={() => window.location.href = '/auth/login'} className={`px-6 py-2 rounded-full font-medium transition-all ${theme.primary} mt-2`}>
                {t.nav.cta}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {t.hero.headline}
            </h1>
            <p className="text-lg md:text-xl opacity-80 leading-relaxed">
              {t.hero.subheadline}
            </p>
            <p className={`text-sm md:text-base font-medium ${theme.softAccent}`}>
              {t.hero.supporting}
            </p>
            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <button onClick={() => window.location.href = '/auth/login'} className={`px-8 py-3 rounded-full font-semibold transition-all ${theme.primary}`}>
                {t.hero.primaryCta}
              </button>
              <button className={`px-8 py-3 rounded-full font-semibold transition-all ${theme.secondary}`}>
                {t.hero.secondaryCta}
              </button>
            </div>
            <div className="flex flex-wrap gap-6 pt-6 justify-center md:justify-start">
              {t.hero.trust.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className={theme.accent} size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center">
            {/* 3D Model Integrated Here */}
            <div className="w-full max-w-[400px] md:max-w-[600px] aspect-square relative z-0 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-current/5 to-transparent rounded-full blur-3xl -z-10" />
              <DoctorModelWrapper />
            </div>
          </div>
        </div>
      </section>

      {/* Why NeuraNet */}
      <section id="features" className="py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">{t.why.heading}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.why.cards.map((card, i) => {
              const IconComponent = i === 0 ? Heart : i === 1 ? Zap : Users;
              return (
                <div key={i} className={`p-8 rounded-2xl border-2 ${theme.card} transition-transform hover:scale-105`}>
                  <div className={`w-12 h-12 rounded-full ${theme.primary} flex items-center justify-center mb-4`}>
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                  <p className="opacity-80 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-12 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">{t.how.heading}</h2>
          <div className="space-y-12">
            {t.how.steps.map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${theme.primary} flex items-center justify-center text-white font-bold text-lg`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="opacity-80 text-lg leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Therapists & Buddies */}
      <section id="therapists" className="py-12 md:py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {[t.roles.therapist, t.roles.buddy].map((role, i) => (
            <div key={i} className={`p-10 rounded-2xl border-2 ${theme.card}`}>
              <h3 className="text-2xl font-bold mb-4">{role.title}</h3>
              <p className="opacity-80 mb-6 leading-relaxed">{role.desc}</p>
              <ul className="space-y-3 mb-8">
                {role.points.map((point, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle className={theme.accent} size={20} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full px-6 py-3 rounded-full font-semibold transition-all ${theme.primary}`}>
                {role.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* NGOs Section */}
      <section id="ngos" className="py-12 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.ngo.heading}</h2>
          <p className="text-lg opacity-80 mb-12 leading-relaxed">{t.ngo.desc}</p>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className={`text-xl font-bold mb-4 ${theme.accent}`}>Use Cases</h4>
              <ul className="space-y-2">
                {t.ngo.useCases.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Shield size={20} className={`${theme.accent} flex-shrink-0 mt-0.5`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`text-xl font-bold mb-4 ${theme.accent}`}>Partnership Models</h4>
              <ul className="space-y-2">
                {t.ngo.models.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <TrendingUp size={20} className={`${theme.accent} flex-shrink-0 mt-0.5`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className={`px-8 py-3 rounded-full font-semibold transition-all ${theme.primary}`}>
            {t.ngo.cta}
          </button>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">{t.business.heading}</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {t.business.points.map((point, i) => (
              <div key={i} className={`p-6 rounded-xl border-2 ${theme.card}`}>
                <CheckCircle className={theme.accent} size={28} style={{ margin: '0 auto 12px' }} />
                <p className="font-medium">{point}</p>
              </div>
            ))}
          </div>
          <p className={`text-lg font-medium ${theme.softAccent} italic`}>{t.business.tagline}</p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-12 md:py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t.about.heading}</h2>
          <p className="text-lg md:text-xl opacity-80 leading-relaxed">{t.about.text}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t-2 ${isDark ? 'border-[#F1626B]/20' : 'border-[#781C2E]/10'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold flex items-center gap-2 mb-2">
                <Image src="/nn.png" alt="NeuroNet Logo" width={28} height={28} className="w-7 h-7 object-contain" />
                <span>NeuroNet</span>
              </div>
              <p className={`text-sm ${theme.softAccent}`}>{t.footer.tagline}</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm opacity-70">
                {t.footer.links.map((link, i) => (
                  <li key={i}><a href="#" className="hover:opacity-100 transition-opacity">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Connect</h4>
              <ul className="space-y-2 text-sm opacity-70">
                {t.footer.contact.map((link, i) => (
                  <li key={i}><a href="#" className="hover:opacity-100 transition-opacity">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center text-sm opacity-60 pt-8 border-t border-current/10">
            © 2025 NeuroNet. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
