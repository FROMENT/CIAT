import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Database, 
  Clock, 
  History, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Sparkles,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { CIAT_DIMENSIONS, CIAT_CRITERIA, CIATLevel } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [step, setStep] = useState<number>(0);
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [selections, setSelections] = useState<Record<string, CIATLevel>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [showGlossary, setShowGlossary] = useState(false);

  const totalSteps = CIAT_CRITERIA.length + 2; // Intro + Name/Desc + Criteria + Result

  const handleSelection = (criteriaId: string, level: CIATLevel) => {
    setSelections(prev => ({ ...prev, [criteriaId]: level }));
  };

  const currentCriteria = step >= 2 && step < totalSteps - 1 ? CIAT_CRITERIA[step - 2] : null;

  const chartData = useMemo(() => {
    return CIAT_DIMENSIONS.map(dim => {
      const criteria = CIAT_CRITERIA.find(c => c.dimensionId === dim.id);
      const value = criteria ? (selections[criteria.id] || 1) : 1;
      return {
        subject: dim.label,
        A: value,
        fullMark: 4,
      };
    });
  }, [selections]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 2: return 'text-blue-500 bg-blue-50 border-blue-200';
      case 3: return 'text-orange-500 bg-orange-50 border-orange-200';
      case 4: return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const analyzeWithAI = async () => {
    if (!assetDescription) return;
    setIsAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `En tant qu'expert en cybersécurité, analyse l'asset suivant et suggère les niveaux CIAT (1 à 4) appropriés.
        Nom: ${assetName}
        Description: ${assetDescription}
        
        Réponds en français avec une brève justification pour chaque critère (C, I, A, T).`,
      });
      setAiAnalysis(response.text || "Désolé, l'analyse a échoué.");
    } catch (error) {
      console.error(error);
      setAiAnalysis("Erreur lors de l'analyse IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAssetName('');
    setAssetDescription('');
    setSelections({});
    setAiAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-indigo-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">CIAT Evaluator</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Security Asset Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-500">Progression</span>
              <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
                />
              </div>
            </div>
            {step > 0 && (
              <button 
                onClick={reset}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                title="Réinitialiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                  Évaluez la criticité de vos <span className="text-indigo-600">assets</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Déterminez les niveaux de Confidentialité, Intégrité, Accessibilité et Traçabilité requis pour vos systèmes d'information en fonction des impacts métiers.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                {CIAT_DIMENSIONS.map((dim, i) => (
                  <div key={dim.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                        {dim.id}
                      </div>
                      <span className="font-bold text-slate-800">{dim.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{dim.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="group relative inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 w-full sm:w-auto"
                >
                  Commencer l'évaluation
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowGlossary(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 w-full sm:w-auto"
                >
                  <Info className="w-5 h-5" />
                  Comprendre les niveaux
                </button>
              </div>
            </motion.div>
          )}

          {/* Glossary Modal */}
          <AnimatePresence>
            {showGlossary && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setShowGlossary(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8 md:p-12 space-y-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Glossaire CIAT</h3>
                      <p className="text-slate-500">Définitions et critères d'évaluation des niveaux de sécurité.</p>
                    </div>
                    <button 
                      onClick={() => setShowGlossary(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <RefreshCw className="w-6 h-6 text-slate-400 rotate-45" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {CIAT_DIMENSIONS.map((dim) => (
                      <div key={dim.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-100">
                            {dim.id}
                          </div>
                          <h4 className="text-xl font-bold text-slate-800">{dim.label}</h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          {dim.description}
                        </p>
                        <div className="space-y-2">
                          {CIAT_CRITERIA.find(c => c.dimensionId === dim.id)?.options.map((opt) => (
                            <div key={opt.level} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="font-black text-indigo-600 w-4">{opt.level}</span>
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-800">{opt.label}</div>
                                <p className="text-[11px] text-slate-500 leading-tight">{opt.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setShowGlossary(false)}
                      className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                    >
                      J'ai compris
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Informations de l'Asset</h3>
                  <p className="text-slate-500 text-sm">Décrivez l'asset que vous souhaitez évaluer.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nom de l'asset</label>
                    <input 
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="Ex: Base de données Clients, Portail RH..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Description métier</label>
                    <textarea 
                      rows={4}
                      value={assetDescription}
                      onChange={(e) => setAssetDescription(e.target.value)}
                      placeholder="À quoi sert cet asset ? Quelles données manipule-t-il ?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!assetName}
                    className="flex-[2] px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuer
                  </button>
                </div>
              </div>

              {assetDescription && (
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">Besoin d'aide ?</span>
                  </div>
                  <p className="text-sm text-indigo-600/80">
                    L'IA peut analyser votre description pour suggérer des niveaux CIAT préliminaires.
                  </p>
                  <button
                    onClick={analyzeWithAI}
                    disabled={isAnalyzing}
                    className="w-full py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Analyser avec Gemini
                  </button>
                  
                  {aiAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white/50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed overflow-hidden"
                    >
                      <div className="prose prose-sm max-w-none">
                        {aiAnalysis}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {currentCriteria && (
            <motion.div 
              key={currentCriteria.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
                        Dimension {currentCriteria.dimensionId}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 text-xs font-medium">Étape {step - 1} sur {CIAT_CRITERIA.length}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{currentCriteria.label}</h3>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    {currentCriteria.dimensionId === 'C' && <Shield className="w-6 h-6 text-indigo-600" />}
                    {currentCriteria.dimensionId === 'I' && <Database className="w-6 h-6 text-indigo-600" />}
                    {currentCriteria.dimensionId === 'A' && <Clock className="w-6 h-6 text-indigo-600" />}
                    {currentCriteria.dimensionId === 'T' && <History className="w-6 h-6 text-indigo-600" />}
                  </div>
                </div>

                <div className="grid gap-4">
                  {currentCriteria.options.map((option) => (
                    <button
                      key={option.level}
                      onClick={() => handleSelection(currentCriteria.id, option.level)}
                      className={cn(
                        "group p-5 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden",
                        selections[currentCriteria.id] === option.level
                          ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50"
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors",
                          selections[currentCriteria.id] === option.level
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        )}>
                          {option.level}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800">{option.label}</div>
                          <p className="text-sm text-slate-500 leading-relaxed">{option.description}</p>
                        </div>
                      </div>
                      {selections[currentCriteria.id] === option.level && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Précédent
                  </button>
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!selections[currentCriteria.id]}
                    className="flex-[2] px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Suivant
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === totalSteps - 1 && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1 space-y-8 w-full">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-widest">
                        <CheckCircle2 className="w-5 h-5" />
                        Évaluation Terminée
                      </div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight">{assetName}</h2>
                      <p className="text-slate-500 line-clamp-2">{assetDescription}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {CIAT_DIMENSIONS.map(dim => {
                        const criteria = CIAT_CRITERIA.find(c => c.dimensionId === dim.id);
                        const level = criteria ? selections[criteria.id] : 1;
                        return (
                          <div key={dim.id} className={cn("p-4 rounded-2xl border-2 flex flex-col gap-1", getLevelColor(level))}>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{dim.label}</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black">{level}</span>
                              <span className="text-xs font-bold opacity-70">/ 4</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button 
                        onClick={() => window.print()}
                        className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                      >
                        <Download className="w-5 h-5" />
                        Exporter PDF
                      </button>
                      <button 
                        onClick={reset}
                        className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Nouvelle Évaluation
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 w-full aspect-square max-w-[400px] bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 4]} 
                          tick={false} 
                          axisLine={false}
                        />
                        <Radar
                          name="CIAT"
                          dataKey="A"
                          stroke="#4F46E5"
                          fill="#4F46E5"
                          fillOpacity={0.2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4 items-start">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-900">Recommandations de sécurité</h4>
                    <p className="text-sm text-amber-800/80 leading-relaxed">
                      {Math.max(...Object.values(selections)) >= 3 
                        ? "Cet asset présente une criticité élevée. Des mesures de sécurité renforcées (chiffrement, authentification forte, sauvegardes immuables) sont fortement recommandées."
                        : "Le niveau de criticité est modéré. Appliquez les bonnes pratiques d'hygiène informatique et surveillez les accès."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Info className="w-4 h-4" />
            <span>Basé sur les standards de gestion des risques IT</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Méthodologie</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
