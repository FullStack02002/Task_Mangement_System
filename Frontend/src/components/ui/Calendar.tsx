import { useState } from "react";
export const Calendar = ({
    archivedDates,
    selectedDate,
    onSelectDate,
}: {
    archivedDates: string[];
    selectedDate:  string | null;
    onSelectDate:  (date: string) => void;
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = new Date();

    const year        = currentMonth.getFullYear();
    const month       = currentMonth.getMonth();
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthLabel  = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => {
        if (isCurrentMonth) return;
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const hasData = (day: number): boolean => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return archivedDates.some((d) => {
            const localDate = new Date(d);
            const localStr  = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
            return localStr === dateStr;
        });
    };

    const isSelected = (day: number): boolean => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return selectedDate === dateStr;
    };

    const isToday = (day: number): boolean =>
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    const handleDayClick = (day: number) => {
        if (!hasData(day)) return;
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        onSelectDate(dateStr);
    };

    const days    = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const blanks  = Array(firstDay).fill(null);
    const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-5">
            {/* ── Month nav ── */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="text-gray-500 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-purple-900/30"
                >←</button>
                <p className="text-sm font-medium text-white">{monthLabel}</p>
                <button
                    onClick={nextMonth}
                    disabled={isCurrentMonth}
                    className={`px-2 py-1 rounded-lg transition-colors
                        ${isCurrentMonth
                            ? "text-gray-700 cursor-not-allowed"
                            : "text-gray-500 hover:text-white hover:bg-purple-900/30 cursor-pointer"
                        }`}
                >→</button>
            </div>

            {/* ── Day headers ── */}
            <div className="grid grid-cols-7 mb-2">
                {days.map((d) => (
                    <div key={d} className="text-center text-xs text-gray-600 font-light py-1">{d}</div>
                ))}
            </div>

            {/* ── Day cells ── */}
            <div className="grid grid-cols-7 gap-y-1">
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {dayNums.map((day) => (
                    <div
                        key={day}
                        onClick={() => handleDayClick(day)}
                        className={`
                            relative flex flex-col items-center justify-center
                            h-9 w-full rounded-lg text-xs transition-all
                            ${hasData(day) ? "cursor-pointer hover:bg-purple-900/40" : "cursor-default"}
                            ${isSelected(day)
                                ? "bg-purple-600 text-white font-medium"
                                : isToday(day)
                                    ? "text-purple-400"
                                    : hasData(day)
                                        ? "text-white"
                                        : "text-gray-700"
                            }
                        `}
                    >
                        {day}
                        {hasData(day) && !isSelected(day) && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-500" />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Legend ── */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-purple-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-xs text-gray-600 font-light">Has archived tasks</span>
            </div>
        </div>
    );
};