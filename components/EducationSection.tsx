
import React from 'react';

const EducationSection: React.FC = () => {
  const redFlags = [
    {
      title: "Urgency & Threats",
      desc: "Scammers create a sense of panic. 'Act now or your account will be closed forever.'",
      icon: "🚨"
    },
    {
      title: "Unusual Payment Methods",
      desc: "Legitimate companies will never ask for payment in Gift Cards, Bitcoin, or Wire Transfers.",
      icon: "💳"
    },
    {
      title: "Too Good to be True",
      desc: "Unexpected lottery wins, inheritance from unknown relatives, or high-return investments.",
      icon: "🎁"
    },
    {
      title: "Poor Grammar & Spelling",
      desc: "Many international scams contain subtle errors or use awkward phrasing and generic greetings.",
      icon: "✍️"
    },
    {
      title: "Spoofed Links",
      desc: "Links that look real but point elsewhere. Example: 'arnazon.com' instead of 'amazon.com'.",
      icon: "🔗"
    },
    {
      title: "Personal Info Requests",
      desc: "Asking for your Social Security Number, bank password, or MFA code over text or call.",
      icon: "🕵️"
    }
  ];

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-3xl mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Master the Art of Detection</h2>
        <p className="text-slate-500 text-lg">
          The best defense is an informed mind. Scammers use psychology to bypass logic. Recognizing these patterns is your first step to total protection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {redFlags.map((flag, i) => (
          <div key={i} className="group bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{flag.icon}</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{flag.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{flag.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-indigo-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-4">Think you've been scammed?</h3>
          <p className="text-indigo-200 mb-8 max-w-xl">
            Don't wait. Time is critical. Follow our emergency checklist to secure your assets and identity immediately.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
              Emergency Checklist
            </button>
            <button className="bg-indigo-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors border border-indigo-700">
              Report a Scam
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>
    </div>
  );
};

export default EducationSection;
