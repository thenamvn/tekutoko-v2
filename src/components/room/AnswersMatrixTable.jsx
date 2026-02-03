import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const AnswersMatrixTable = ({users, roomId, apiUrl, onClose }) => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${apiUrl}/api/room/${roomId}/answers-table`)
            .then(res => res.json())
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [roomId, apiUrl]);

    if (!data) return null;
    if (loading) return <div className="p-8 text-center">{t('leaderboard.matrix.loading')}</div>;

    return (
        <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl sm:max-w-5xl max-h-[95vh] p-0 relative backdrop-blur-xl overflow-y-auto">
                {/* Header giống modal khác */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl bg-gradient-to-r from-violet-600 to-indigo-600">
                    <div className="flex items-center gap-2 text-white text-lg sm:text-xl font-bold">
                        <span className="text-xl sm:text-2xl">📋</span>
                        {t('leaderboard.matrix.allUsersAnswersTitle')}
                    </div>
                    <button
                        className="text-white text-2xl font-bold hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition"
                        onClick={onClose}
                    >×</button>
                </div>
                <div className="p-2 sm:p-6 overflow-x-auto">
                    <table className="min-w-[600px] sm:min-w-full text-xs sm:text-sm rounded-xl overflow-hidden shadow border border-slate-100 bg-white/90">
                        <thead>
                            <tr className="bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700">
                                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-left rounded-tl-xl min-w-[120px] sm:min-w-[180px]"></th>
                                {data.questions.map(q => (
                                    <th key={q.id} className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-center">{q.number}</th>
                                ))}
                            </tr>
                            <tr className="bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700">
                                <th className="px-2 sm:px-4 py-1 sm:py-2 font-semibold text-left">{t('leaderboard.matrix.table.playerQuestion')}</th>
                                {data.questions.map(q => (
                                    <th key={q.id} className="px-2 sm:px-4 py-1 sm:py-2 font-semibold text-center whitespace-pre-line">{q.text}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.table.map(user => (
                                <tr key={user.username} className="border-b border-slate-100 last:border-b-0 hover:bg-violet-50/60 transition">
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-slate-800 flex items-center gap-2 sm:gap-3 min-w-[120px] sm:min-w-[180px]">
                                        <img
                                            src={users.find(u => u.username === user.username)?.avatarImage || "https://www.svgrepo.com/show/341256/user-avatar-filled.svg"}
                                            alt={user.fullname}
                                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white shadow"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div>
                                            <div className="text-xs sm:text-base">{user.fullname}</div>
                                            <div className="text-[10px] sm:text-xs text-slate-500">@{user.username}</div>
                                        </div>
                                    </td>
                                    {user.answers.map((ans, idx) => (
                                        <td key={idx} className="px-2 sm:px-4 py-2 sm:py-3 text-center align-middle">
                                            {ans
                                                ? <span className={ans.isCorrect ? "text-green-700 font-semibold" : "text-red-600"}>
                                                    {ans.value}
                                                </span>
                                                : <span className="text-slate-400 italic">-</span>
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnswersMatrixTable;