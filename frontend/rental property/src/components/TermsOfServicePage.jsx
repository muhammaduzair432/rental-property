import React from "react";
import { useNavigate } from "react-router-dom";

export default function TermsOfServicePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-[#131313] text-[#e5e2e1] flex flex-col antialiased font-sans selection:bg-[#5ddda1]/30 selection:text-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-5xl mx-auto space-y-10">
                
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between border-b border-[#353535] pb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-xs font-bold uppercase tracking-widest text-[#5ddda1] hover:underline flex items-center gap-2 cursor-pointer transition-all"
                    >
                        ← Back to Previous Page
                    </button>
                    <span className="text-[10px] font-bold text-[#c4c7c7] uppercase tracking-[0.25em]">
                        LEGAL BINDING AGREEMENT
                    </span>
                </div>

                {/* Header Title Section */}
                <div className="space-y-3 border-b border-[#353535] pb-8">
                    <span className="text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        USER & HOST GOVERNANCE
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-serif font-bold uppercase tracking-tight text-[#e5e2e1]">
                        Terms of Service
                    </h1>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] leading-relaxed max-w-3xl">
                        Effective Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. 
                        By accessing or using our marketplace platform, you agree to be legally bound by these terms, escrow rules, and operational guidelines.
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-8 text-xs sm:text-sm text-[#c4c7c7] leading-relaxed">
                    
                    {/* Section 1 */}
                    <div className="bg-[#1c1b1b] border border-[#353535] p-6 sm:p-8 space-y-4 shadow-xl">
                        <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-[#e5e2e1] flex items-center gap-2">
                            <span className="text-[#5ddda1]">01.</span> Account Registration & Security Standards
                        </h2>
                        <p>
                            To maintain platform integrity, all users must register with valid credentials. Registration constraints include:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-[#c4c7c7]">
                            <li><strong>Usernames:</strong> Must be between 3 and 20 characters long, can only contain letters, numbers, underscores (_), and hyphens (-), and must contain at least one letter and one number.</li>
                            <li><strong>Passwords:</strong> Must be securely generated and consist of a minimum of 8 characters.</li>
                            <li><strong>Account Responsibility:</strong> You are fully responsible for maintaining the confidentiality of your session and account credentials.</li>
                        </ul>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-[#1c1b1b] border border-[#353535] p-6 sm:p-8 space-y-4 shadow-xl">
                        <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-[#e5e2e1] flex items-center gap-2">
                            <span className="text-[#5ddda1]">02.</span> Escrow & Checkout-Completion Revenue Payouts
                        </h2>
                        <p>
                            Our platform acts as a secure intermediary for short and long-term rental properties:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-[#c4c7c7]">
                            <li><strong>Escrow Holding:</strong> Funds submitted by tenants upon booking confirmation are held securely in platform escrow. They are not instantly accessible or credited as available owner revenue.</li>
                            <li><strong>Checkout Completion:</strong> Rental revenue remains locked and uncounted on the property owner's dashboard earnings overview until the official <strong>checkout date and time have safely elapsed</strong> without disruption.</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-[#1c1b1b] border border-[#353535] p-6 sm:p-8 space-y-4 shadow-xl">
                        <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-[#e5e2e1] flex items-center gap-2">
                            <span className="text-[#5ddda1]">03.</span> Cancellation, Early Departures & Concession Rules
                        </h2>
                        <p>
                            Property owners list assets under uniform cancellation and risk-protection policies:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-[#c4c7c7]">
                            <li><strong>Mid-Stay Cancellations (Early Checkouts):</strong> If a tenant terminates a stay prematurely, the host retains earnings for nights actively utilized, plus a mandatory <strong>10% owner concession fee</strong> calculated on the remaining unused block value as compensation for calendar block disruption.</li>
                            <li><strong>Self-Booking Prohibition:</strong> Property owners are strictly prohibited from booking or reserving their own published asset listings through the tenant marketplace.</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="bg-[#1c1b1b] border border-[#353535] p-6 sm:p-8 space-y-4 shadow-xl">
                        <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-[#e5e2e1] flex items-center gap-2">
                            <span className="text-[#5ddda1]">04.</span> Platform Moderation & Termination
                        </h2>
                        <p>
                            Administrators hold absolute authority to audit system logs, review disputes, moderate feedback, and suspend or permanently purge user accounts that violate safety guidelines, submit fraudulent reviews, or breach escrow regulations.
                        </p>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="pt-6 border-t border-[#353535] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-[10px] text-[#8e9192] uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} RENTAL PROPERTY. ALL RIGHTS RESERVED.
                    </span>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-3 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer shadow-lg"
                    >
                        Return to Portal Dashboard →
                    </button>
                </div>

            </div>
        </div>
    );
}