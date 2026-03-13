
const Footer = () => {
    return (
        <footer className="border-t border-purple-900/40 mt-24 bg-[#0d0a1a]">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

                    {/* ── Brand ── */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-600/40 flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="2" y="3"  width="12" height="2" rx="1" fill="#a78bfa"/>
                                    <rect x="2" y="7"  width="8"  height="2" rx="1" fill="#a78bfa" opacity="0.7"/>
                                    <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4"/>
                                </svg>
                            </div>
                            <span className="text-white font-medium text-base tracking-tight">
                                Task<span className="text-purple-400">Flow</span>
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-light">
                            A daily task management system that automates your end-of-day
                            workflow — archiving tasks, computing summaries, and keeping
                            your history organized.
                        </p>
                    </div>

                    {/* ── Product ── */}
                    <div>
                        <h4 className="text-gray-300 text-xs font-medium tracking-[0.1em] uppercase mb-4">
                            Product
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#features" className="text-gray-500 text-sm hover:text-gray-300 transition-colors font-light">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="text-gray-500 text-sm hover:text-gray-300 transition-colors font-light">
                                    How it works
                                </a>
                            </li>
                        </ul>
                    </div>

                    
                </div>

                {/* ── Bottom ── */}
                <div className="border-t border-purple-900/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-600 text-xs font-light">
                        © {new Date().getFullYear()} TaskFlow. Built with React, Node.js & MongoDB.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-600 text-xs hover:text-gray-400 transition-colors font-light">Privacy</a>
                        <a href="#" className="text-gray-600 text-xs hover:text-gray-400 transition-colors font-light">Terms</a>
                        <a href="#" className="text-gray-600 text-xs hover:text-gray-400 transition-colors font-light">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;