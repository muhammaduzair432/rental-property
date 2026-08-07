import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
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
                        ← Back to Dashboard
                    </button>
                    <span className="text-[10px] font-bold text-[#c4c7c7] uppercase tracking-[0.25em]">
                        LEGAL REPOSITORY
                    </span>
                </div>

                {/* Header Title Section */}
                <div className="space-y-3 border-b border-[#353535] pb-8">
                    <span className="text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        GOVERNANCE & COMPLIANCE
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-serif font-bold uppercase tracking-tight text-[#e5e2e1]">
                        Privacy Policy & Platform Rules
                    </h1>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] leading-relaxed max-w-3xl">
                        Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. 
                        Review our operational guidelines, escrow security measures, cancellation frameworks, and user accountability standards.
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-8 text-xs sm:text-sm text-[#c4c7c7] leading-relaxed">
                    
                    {/* Section 1 */}
                    <div className="bg-[#1c1b1b] border border-[#353535] p-6 sm:p-8 space-y-4 shadow-xl">
                        <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-[#e5e2e1] flex items-center gap-2">
                            <span className="text-[#5ddda1]">01.</span> Data Collection & Security Architecture
                        </h2>
                        <p>
                            Our platform collects essential profile information (names, emails, credentials, avatars) and booking transaction metadata to maintain secure ledger logs. All sensitive records are safeguarded within our encrypted database repository. We do not sell or trade user information to third-party marketing brokers.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-[#1c1b1b] border border-[#353535] p-6 sm:p-8 space-y-4 shadow-xl">
                        <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-[#e5e2e1] flex items-center gap-2">
                            <span className="text-[#5ddda1]">02.</span> Escrow & Revenue Payout Rules
                        </h2>
                        <p>
                            To protect both travelers and property hosts, our system operates on a strict escrow-completion model:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-[#c4c7c7]">
                            <li>Bookings made by tenants are held securely in platform escrow.</li>
                            <li>Revenue remains locked and does not count toward an owner's available earnings balance until the official <strong>checkout date and time have safely passed</strong>.</li>
                            <li>Hosts can view upcoming revenue under their pending analytics portfolio until unlocked.</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-[#1c1b1b] border border-[#353535] p-6 sm:p-8 space-y-4 shadow-xl">
                        <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-[#e5e2e1] flex items-center gap-2">
                            <span className="text-[#5ddda1]">03.</span> Universal Cancellation & Concession Policy
                        </h2>
                        <p>
                            Our cancellation framework applies uniformly across all short and long-term bookings:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-[#c4c7c7]">
                            <li><strong>Early Cancellations:</strong> Canceling before check-in outside the danger zone releases calendar dates instantly without penalties.</li>
                            <li><strong>Mid-Stay Cancellations (Early Departures):</strong> If a guest cuts a stay short, the owner keeps earnings for the days actually used, plus a <strong>10% owner concession fee</strong> calculated from the remaining unused block value as compensation for holding the calendar space.</li>
                            <li><strong>Record Preservation:</strong> Cancelled reservations are preserved as non-destructive database audit logs rather than being permanently deleted, ensuring transparent financial history.</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="bg-[#1c1b1b] border border-[#353535] p-6 sm:p-8 space-y-4 shadow-xl">
                        <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-[#e5e2e1] flex items-center gap-2">
                            <span className="text-[#5ddda1]">04.</span> User Conduct & Portal Roles
                        </h2>
                        <p>
                            Users may switch dynamically between roles (User, Owner) depending on their portal privileges. Misuse of property publishing rights, submission of fraudulent reviews, or violation of safety standards will result in immediate account suspension or administrative purge by system moderators.
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