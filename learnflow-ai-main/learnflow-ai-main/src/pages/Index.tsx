import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Eye, MousePointer2, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-display font-bold tracking-tight">NeuroLearn</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-6 tracking-wide uppercase">
              <Zap className="w-3 h-3 fill-current" /> Next-Gen AI Learning
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-tight mb-6">
              Master Complex Topics with AI that <span className="text-primary italic">Understands</span> Your Focus.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
              NeuroLearn tracks your cognitive load in real-time using facial AI and interaction analysis, adapting every lesson to your personal pace.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="h-14 px-8 text-lg gradient-primary text-primary-foreground border-0 shadow-lg shadow-primary/20 group" onClick={() => navigate('/register')}>
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
                Explore Features
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse-glow" />
            <div className="relative bg-card border rounded-3xl shadow-elevated overflow-hidden aspect-[4/3] flex items-center justify-center">
               {/* Decorative UI elements representing the platform */}
               <div className="w-[80%] space-y-4 opacity-50 select-none pointer-events-none">
                  <div className="h-4 bg-muted rounded-full w-3/4" />
                  <div className="aspect-video bg-muted rounded-2xl w-full flex items-center justify-center">
                     <Brain className="w-16 h-16 text-primary/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="h-20 bg-muted rounded-xl" />
                     <div className="h-20 bg-muted rounded-xl" />
                  </div>
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="bg-card shadow-xl border rounded-2xl p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                       <Zap className="text-success" />
                    </div>
                    <div>
                       <p className="text-xs text-muted-foreground font-medium">Optimal Pace Detected</p>
                       <p className="text-sm font-bold">Deep Focus State (92%)</p>
                    </div>
                  </motion.div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our specialized algorithms monitor three key channels of your learning environment to ensure you never feel overwhelmed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                title: "Facial Attention",
                desc: "AI-driven expression analysis detects signs of confusion or stress before you even realize them."
              },
              {
                icon: MousePointer2,
                title: "Behavioral Patterns",
                desc: "We monitor mouse jitter and navigation pauses to identify sticking points in complex topics."
              },
              {
                icon: Zap,
                title: "Real-time Adaptation",
                desc: "The platform suggests breaks or simpler explanations exactly when your cognitive load spikes."
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-card p-8 rounded-2xl border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight font-display">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-primary/5 rounded-2xl p-6 h-40 flex flex-col justify-end">
                <span className="text-4xl font-bold text-primary mb-2">40%</span>
                <span className="text-sm font-medium">Faster Retention</span>
             </div>
             <div className="bg-success/5 rounded-2xl p-6 h-40 flex flex-col justify-end">
                <span className="text-4xl font-bold text-success mb-2">2x</span>
                <span className="text-sm font-medium">Better Focus</span>
             </div>
             <div className="bg-info/5 rounded-2xl p-6 h-40 lg:col-span-2 flex flex-col justify-end">
                <span className="text-4xl font-bold text-info mb-2">100%</span>
                <span className="text-sm font-medium">Personalized Path</span>
             </div>
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">Built for the Modern Learner</h2>
            <div className="space-y-4 mb-8">
               {[
                 "Stop wasting time on lessons that are too easy or too hard.",
                 "Gain insights into your own attention and focus habits.",
                 "Earn certificates in half the time by mastering topics efficiently.",
                 "A tutor that actually 'sees' when you are struggling."
               ].map((text, i) => (
                 <div key={i} className="flex items-start gap-3">
                   <div className="mt-1 bg-success/20 rounded-full p-0.5">
                     <CheckCircle className="w-4 h-4 text-success" />
                   </div>
                   <p className="text-muted-foreground font-medium">{text}</p>
                 </div>
               ))}
            </div>
            <Button size="lg" className="rounded-full px-8" onClick={() => navigate('/register')}>Join the Revolution</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 text-center text-muted-foreground">
        <p className="text-sm">© 2026 NeuroLearn AI Adaptive Learning. All rights reserved.</p>
      </footer>
    </div>
  );
}
