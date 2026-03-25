'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero3D from '../components/Hero3D';

type Language = 'en' | 'mn';

const LANGUAGES: Record<Language, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  mn: { label: 'Монгол', flag: '🇲🇳' },
};

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState<Language>('en');
  const [targetLang, setTargetLang] = useState<Language>('mn');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText('');
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const mockTranslations: Record<string, string> = {
      'hello': 'сайн байна уу',
      'world': 'дэлхий',
      'thank': 'баярлалаа',
      'please': 'хүсье',
      'good': 'сайн',
      'love': 'хараал',
      'art': 'урлаг',
      'translation': 'орчуулга',
    };

    let result = inputText;
    Object.entries(mockTranslations).forEach(([en, mn]) => {
      result = result.replace(new RegExp(en, 'gi'), mn);
    });

    if (result === inputText) {
      result = `[AI → ${targetLang.toUpperCase()}]: ${inputText}`;
    }

    setOutputText(result);
    setIsTranslating(false);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0a0a0f]">
      <Hero3D />

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-cyan-900/10" />
      </div>

      <div className="relative z-10">
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="mb-6 font-['Space_Grotesk'] text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              <span className="text-white">Mongolian</span>
              <br />
              <span className="bg-gradient-to-r from-[#64ffda] via-[#00bfa5] to-[#00bfa5] bg-clip-text text-transparent">
                Translation AI
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
              Bridge language barriers with neural machine translation.
              Built specifically for Mongolian Cyrillic with context-aware AI.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDemo(true)}
                className="rounded-xl bg-gradient-to-r from-[#64ffda] to-[#00bfa5] px-8 py-4 font-semibold text-[#0a0a0f] shadow-lg shadow-[#64ffda]/30 transition-all hover:shadow-xl hover:shadow-[#64ffda]/50"
              >
                Start Translating →
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDemo(!showDemo)}
                className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                {showDemo ? 'Hide Demo' : 'See Live Demo'}
              </motion.button>

              <a
                href="mailto:misheel@gebifirm.info"
                className="rounded-xl border border-[#64ffda]/30 bg-[#64ffda]/10 px-8 py-4 font-semibold text-[#64ffda] backdrop-blur-sm transition-all hover:bg-[#64ffda]/20"
              >
                Contact Us
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>Supported by</span>
              <span className="font-semibold text-[#64ffda]">NVIDIA Inception</span>
              <span>&</span>
              <span className="font-semibold text-[#64ffda]">Microsoft for Startup</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-3"
          >
            {[
              { value: '10M+', label: 'Characters' },
              { value: '98.5%', label: 'Accuracy' },
              { value: '<3s', label: 'Avg. Time' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[#64ffda] md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <AnimatePresence>
          {showDemo && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-20"
            >
              <div className="mx-auto max-w-5xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <select
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value as Language)}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-sm focus:border-[#64ffda] focus:outline-none"
                      >
                        {Object.entries(LANGUAGES).map(([code, lang]) => (
                          <option key={code} value={code} className="bg-[#1a1a2e]">
                            {lang.flag} {lang.label}
                          </option>
                        ))}
                      </select>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSwap}
                        className="rounded-full border border-white/10 bg-white/5 p-2 backdrop-blur-sm transition-colors hover:bg-white/10"
                      >
                        ⇄
                      </motion.button>

                      <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value as Language)}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-sm focus:border-[#64ffda] focus:outline-none"
                      >
                        {Object.entries(LANGUAGES).map(([code, lang]) => (
                          <option key={code} value={code} className="bg-[#1a1a2e]">
                            {lang.flag} {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="relative">
                      <div className="absolute left-4 top-4 text-sm text-gray-500">
                        {LANGUAGES[sourceLang].flag} {sourceLang.toUpperCase()}
                      </div>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter text to translate..."
                        className="h-64 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 pt-12 text-white placeholder-gray-600 focus:border-[#64ffda] focus:outline-none"
                      />
                      <div className="absolute bottom-4 right-4 text-sm text-gray-600">
                        {inputText.length} chars
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-4 text-sm text-gray-500">
                        {LANGUAGES[targetLang].flag} {targetLang.toUpperCase()}
                      </div>
                      <div className="flex h-64 w-full resize-none rounded-xl border border-white/10 bg-[#64ffda]/5 p-4 pt-12 text-white">
                        {isTranslating ? (
                          <div className="flex items-center gap-3 text-[#64ffda]">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#64ffda] border-t-transparent" />
                            Translating...
                          </div>
                        ) : outputText ? (
                          <p>{outputText}</p>
                        ) : (
                          <span className="text-gray-600">Translation will appear here...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={() => { setInputText(''); setOutputText(''); }}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                    >
                      Clear
                    </button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTranslate}
                      disabled={!inputText.trim() || isTranslating}
                      className="rounded-xl bg-gradient-to-r from-[#64ffda] to-[#00bfa5] px-8 py-3 font-semibold text-[#0a0a0f] shadow-lg shadow-[#64ffda]/30 transition-all hover:shadow-xl disabled:opacity-50"
                    >
                      {isTranslating ? 'Translating...' : 'Translate →'}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center text-4xl font-bold text-white md:text-5xl"
            >
              Why Choose{' '}
              <span className="bg-gradient-to-r from-[#64ffda] to-[#00bfa5] bg-clip-text text-transparent">
                Our Platform
              </span>
            </motion.h2>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: '🤖', title: 'Neural Machine Translation', description: 'State-of-the-art deep learning models trained specifically for Mongolian language nuances.' },
                { icon: '📚', title: 'Book Translation', description: 'Specialized in long-form content translation with context preservation across chapters.' },
                { icon: '⚡', title: 'Fast Processing', description: 'Optimized pipeline handles entire books efficiently with batch translation technology.' },
                { icon: '🎯', title: 'Context Aware', description: 'Understands context from surrounding sentences for more accurate translations.' },
                { icon: '🔄', title: 'PDF Support', description: 'Directly translate PDF documents while preserving formatting and images.' },
                { icon: '🌐', title: 'Mongolian Native', description: 'Built specifically for Mongolian Cyrillic with proper grammatical structure.' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-[#64ffda]/30"
                >
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#64ffda] to-[#00bfa5]">
                  <span className="text-lg font-bold text-[#0a0a0f]">М</span>
                </div>
                <span className="text-xl font-semibold text-white">
                  Gebi AI
                </span>
              </div>

              <div className="flex items-center gap-8">
              </div>

              <div className="text-sm text-gray-500">
                © 2026 Gebi AI. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
