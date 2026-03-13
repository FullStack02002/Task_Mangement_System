import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { Link } from "react-router-dom";
import { useAppSelector } from "../app/hook";
import { ROUTES } from "../routes/routePaths";

const features = [
    {
        tag: "Core",
        title: "Today's Board",
        description: "A focused view of tasks created today. When midnight hits, the board resets automatically — no manual refresh needed.",
    },
    {
        tag: "History",
        title: "Calendar Archive",
        description: "Browse any past date using the date picker and see exactly what was created, completed, or left pending that day.",
    },
    {
        tag: "Insights",
        title: "Daily Summary",
        description: "Every day ends with a computed report — total tasks, completion rate, pending count — delivered straight to your inbox.",
    },
];

const steps = [
    {
        number: "01",
        title: "Create your tasks",
        desc: "Add tasks for the day with a title, optional description, and status. Takes seconds.",
    },
    {
        number: "02",
        title: "Work through the day",
        desc: "Update statuses as you progress — Pending, In Progress, or Completed.",
    },
    {
        number: "04",
        title: "Review past days",
        desc: "Use the calendar view to browse any previous date and see the full archived task list.",
    },
];

const stats = [
    { value: "100%", label: "Atomic archiving" },
    { value: "24h",  label: "Daily cycle automation" },
];

const Home = () => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const user = useAppSelector((state) => state.auth.user);

    return (
        <div className="min-h-screen bg-[#0d0a1a] font-sans">
            <Header />

            {/* ── Hero ── */}
            <section className="max-w-3xl mx-auto px-6 pt-32 pb-24">

                <span className="block font-mono text-xs tracking-[0.14em] text-purple-400 uppercase mb-8">
                    Daily Task Management System
                </span>

                <h1 className="text-5xl md:text-6xl font-light leading-[1.1] tracking-tight text-white mb-6">
                    Your day,{" "}
                    <span className="italic text-purple-400">structured.</span>
                    <br />Every day.
                </h1>

                <p className="text-base text-gray-300 leading-relaxed max-w-lg mb-11 font-light">
                    Create tasks, track progress, and let the system handle the rest.
                    At midnight, an automated job closes your day — archiving tasks,
                    computing a summary, and delivering it to your inbox.
                </p>

                {isAuthenticated ? (
                    <div className="inline-flex items-center gap-3 px-5 py-3 border border-purple-900 rounded-lg bg-purple-950/40">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-sm text-gray-300">
                            Signed in as{" "}
                            <span className="text-white font-medium">{user?.name}</span>
                        </span>
                        {/* <Link
                            to={ROUTES.DASHBOARD}
                            className="text-xs text-purple-400 ml-2 pl-3 border-l border-purple-900 hover:text-white transition-colors"
                        >
                            Go to dashboard →
                        </Link> */}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 flex-wrap">
                        <Link
                            to={ROUTES.REGISTER}
                            className="inline-flex items-center gap-2 px-7 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all hover:-translate-y-px shadow-lg shadow-purple-900/50"
                        >
                            Get started free →
                        </Link>
                        <Link
                            to={ROUTES.LOGIN}
                            className="inline-flex items-center gap-2 px-7 py-3 border border-purple-800 text-gray-300 text-sm rounded-lg hover:border-purple-600 hover:text-white transition-all"
                        >
                            Sign in
                        </Link>
                    </div>
                )}
            </section>

            <div className="max-w-4xl mx-auto px-6">
                <div className="h-px bg-purple-900/50" />
            </div>

            {/* ── Stats ── */}
            <section className="max-w-4xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row border-l border-r border-purple-900/50">
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            className={`flex-1 text-center py-10 px-6 ${
                                i < stats.length - 1
                                    ? "border-b sm:border-b-0 sm:border-r border-purple-900/50"
                                    : ""
                            }`}
                        >
                            <div className="font-mono text-4xl font-light tracking-tight text-white mb-2">
                                {s.value}
                            </div>
                            <div className="font-mono text-xs tracking-widest text-purple-400 uppercase">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-px bg-purple-900/50" />
            </section>

            {/* ── Features ── */}
            <section className="max-w-4xl mx-auto px-6 py-20" id="features">
                <div className="mb-12">
                    <span className="block font-mono text-xs tracking-[0.12em] text-purple-400 uppercase mb-3">
                        Features
                    </span>
                    <h2 className="text-3xl font-light tracking-tight text-white">
                        Everything the system handles for you
                    </h2>
                </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-purple-900/30 border border-purple-900/50 rounded-2xl overflow-hidden">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="bg-[#110d20] hover:bg-[#17103a] transition-colors duration-200 p-7 group"
                        >
                            <span className="inline-block font-mono text-[10px] font-medium tracking-[0.1em] uppercase px-2.5 py-1 rounded-md bg-purple-900/50 border border-purple-700/40 text-purple-300 mb-5">
                                {f.tag}
                            </span>
                            <h3 className="text-base font-medium text-white mb-3 tracking-tight">
                                {f.title}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-light">
                                {f.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6">
                <div className="h-px bg-purple-900/50" />
            </div>

            {/* ── How it works ── */}
            <section className="max-w-4xl mx-auto px-6 py-20" id="how-it-works">
                <div className="mb-12">
                    <span className="block font-mono text-xs tracking-[0.12em] text-purple-400 uppercase mb-3">
                        How it works
                    </span>
                    <h2 className="text-3xl font-light tracking-tight text-white">
                        One daily cycle, fully automated
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {steps.map((s) => (
                        <div
                            key={s.number}
                            className="flex gap-5 p-6 border border-purple-900/50 rounded-xl bg-[#110d20] hover:border-purple-700/60 hover:bg-[#17103a] transition-all duration-200 items-start"
                        >
                            <span className="font-mono text-sm font-medium text-purple-500 tracking-widest pt-0.5 min-w-[32px]">
                                {s.number}
                            </span>
                            <div>
                                <h3 className="text-base font-medium text-white mb-2">
                                    {s.title}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed font-light">
                                    {s.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            {!isAuthenticated && (
                <>
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="h-px bg-purple-900/50" />
                    </div>
                    <section className="max-w-4xl mx-auto px-6 py-20">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-10 border border-purple-800/50 rounded-2xl bg-purple-950/30">
                            <div>
                                <h2 className="text-2xl font-light tracking-tight text-white mb-2">
                                    Start managing your day with clarity.
                                </h2>
                                <p className="text-sm text-gray-400 font-light">
                                    Free to use. No credit card required.
                                </p>
                            </div>
                            <Link
                                to={ROUTES.REGISTER}
                                className="shrink-0 inline-flex items-center gap-2 px-7 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all hover:-translate-y-px shadow-lg shadow-purple-900/50"
                            >
                                Create account →
                            </Link>
                        </div>
                    </section>
                </>
            )}

            <Footer />
        </div>
    );
};

export default Home;