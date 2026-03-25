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
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 backdrop-blur-sm">
                🚀 Powered by Advanced AI
              </span>
            </motion.div>

            <h1 className="mb-6 font-['Space_Grotesk'] text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              <span className="text-white">Mongolian</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Translation AI
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
              Bridge language barriers with neural machine translation. 
              Powered by deep learning models trained on millions of bilingual texts.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDemo(true)}
                className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/50"
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
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {[
              { value: '10M+', label: 'Tokens Trained' },
              { value: '50+', label: 'Languages' },
              { value: '98.5%', label: 'Accuracy' },
              { value: '<2s', label: 'Avg. Response' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <div className="font-['Space_Grotesk'] text-3xl font-bold text-white md:text-4xl">
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
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-sm focus:border-indigo-500 focus:outline-none"
                      >
                        {Object.entries(LANGUAGES).map(([code, lang]) => (
                          <option key={code} value={code}>
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
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-sm focus:border-indigo-500 focus:outline-none"
                      >
                        {Object.entries(LANGUAGES).map(([code, lang]) => (
                          <option key={code} value={code}>
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
                        className="h-64 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 pt-12 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                      />
                      <div className="absolute bottom-4 right-4 text-sm text-gray-600">
                        {inputText.length} chars
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-4 text-sm text-gray-500">
                        {LANGUAGES[targetLang].flag} {targetLang.toUpperCase()}
                      </div>
                      <div className="flex h-64 w-full resize-none rounded-xl border border-white/10 bg-indigo-500/5 p-4 pt-12 text-white">
                        {isTranslating ? (
                          <div className="flex items-center gap-3 text-indigo-400">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
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
                      className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl disabled:opacity-50"
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
              className="mb-16 text-center font-['Space_Grotesk'] text-4xl font-bold text-white md:text-5xl"
            >
              Why Choose{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Our Platform
              </span>
            </motion.h2>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: '🧠', title: 'Neural Machine Translation', description: 'State-of-the-art transformer models trained specifically for Mongolian language nuances.' },
                { icon: '⚡', title: 'Real-time Processing', description: 'Lightning-fast translations with optimized inference pipelines.' },
                { icon: '🔒', title: 'Privacy First', description: 'Your text is never stored. All processing happens securely with encryption.' },
                { icon: '📚', title: 'Context Aware', description: 'Understands idioms, cultural references, and domain-specific terminology.' },
                { icon: '🌐', title: '50+ Languages', description: 'Translate between Mongolian and major world languages with high accuracy.' },
                { icon: '📱', title: 'API Access', description: 'Integrate translation into your applications with our developer-friendly API.' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20"
                >
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <h3 className="mb-2 font-['Space_Grotesk'] text-xl font-semibold text-white">
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
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500" />
                <span className="font-['Space_Grotesk'] text-xl font-semibold text-white">
                  MongolAI
                </span>
              </div>

              <div className="flex gap-8 text-sm text-gray-500">
                <a href="#" className="hover:text-white transition-colors">Documentation</a>
                <a href="#" className="hover:text-white transition-colors">API</a>
                <a href="#" className="hover:text-white transition-colors">Pricing</a>
                <a href="#" className="hover:text-white transition-colors">GitHub</a>
              </div>

              <div className="text-sm text-gray-500">
                © 2026 MongolAI. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
