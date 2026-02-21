import Link from "next/link";
import { ArrowRight, Rocket, Users, Building2, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen gradient-subtle gradient-mesh relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-navy-100/20 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gold-200/15 blur-3xl animate-float-delayed pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Stark</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-navy-600 rounded-xl px-5 py-2.5 shadow-md shadow-navy-600/25 hover:bg-navy-500 hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold-50 border border-gold-200 px-4 py-1.5 mb-8">
            <Zap className="w-3.5 h-3.5 text-gold-600" />
            <span className="text-xs font-semibold text-navy-600 tracking-wide uppercase">National Innovation Platform</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
            Where Innovation
            <span className="text-gradient block mt-1">Meets Opportunity</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10">
            The unified ecosystem connecting visionary startups, strategic investors, and technology companies to build the future — together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-navy-600 rounded-xl px-8 py-3.5 shadow-lg shadow-navy-600/25 hover:bg-navy-500 hover:shadow-xl hover:shadow-gold/20 transition-all duration-200 active:scale-[0.98]"
            >
              Join the Ecosystem <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-8 py-3.5 shadow-sm hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        <div className="glass rounded-2xl p-1">
          <div className="grid grid-cols-3 divide-x divide-slate-200/50">
            <div className="text-center py-6 px-4">
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900">500+</div>
              <div className="text-xs lg:text-sm text-slate-500 mt-1 font-medium">Startups Registered</div>
            </div>
            <div className="text-center py-6 px-4">
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900">$2.4M</div>
              <div className="text-xs lg:text-sm text-slate-500 mt-1 font-medium">Investments Facilitated</div>
            </div>
            <div className="text-center py-6 px-4">
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900">120+</div>
              <div className="text-xs lg:text-sm text-slate-500 mt-1 font-medium">Active Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Built for Every Stakeholder</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">One platform, three powerful experiences — each tailored to your role in the ecosystem.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Startup Card */}
          <div className="group bento-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-navy-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center mb-5">
                <Rocket className="w-6 h-6 text-navy-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2.5">For Startups</h3>
              <p className="text-slate-500 leading-relaxed text-[15px]">
                Showcase your innovation, connect with investors, and access resources to accelerate your growth trajectory.
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-navy-600 group-hover:gap-3 transition-all duration-300">
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Investor Card */}
          <div className="group bento-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gold-50 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-gold-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2.5">For Investors</h3>
              <p className="text-slate-500 leading-relaxed text-[15px]">
                Discover promising startups, evaluate opportunities with data-driven insights, and build your portfolio.
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-gold-600 group-hover:gap-3 transition-all duration-300">
                <span>Explore deals</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* IT Company Card */}
          <div className="group bento-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-navy-50/30 to-gold-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6 text-navy-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2.5">For IT Companies</h3>
              <p className="text-slate-500 leading-relaxed text-[15px]">
                Partner with innovative startups, offer technology solutions, and expand your business network.
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-navy-500 group-hover:gap-3 transition-all duration-300">
                <span>Find partners</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="relative z-10 border-t border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Enterprise-grade Security</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Real-time Collaboration</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>AI-powered Matching</span>
          </div>
        </div>
      </section>
    </div>
  );
}
