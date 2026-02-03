import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const UserAnswersTable = ({ user, roomId, apiUrl, onClose }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${apiUrl}/api/room/${roomId}/answers-table/${user.username}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user, roomId, apiUrl]);

  if (!user) return null;
  if (loading || !data)
    return (
      <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-2xl shadow-2xl max-w-2xl w-full p-8 text-center border border-white/30 backdrop-blur-md">
          {t('leaderboard.matrix.loading')}
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative border border-white/30 backdrop-blur-md">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold"
          onClick={onClose}
        >×</button>
<h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-3">
  <img
    src={user.avatarImage || "https://www.svgrepo.com/show/341256/user-avatar-filled.svg"}
    alt={user.fullname || user.username}
    className="w-8 h-8 rounded-full border border-white shadow"
    referrerPolicy="no-referrer"
  />
  {t('leaderboard.matrix.userAnswersTitle', { name: user.fullname || user.username })} <span className="text-xs text-slate-500">@{user.username}</span>
</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700">
                <th className="px-3 py-2 font-semibold text-left rounded-tl-xl">#</th>
                <th className="px-3 py-2 font-semibold text-left">{t('leaderboard.matrix.table.question')}</th>
                <th className="px-3 py-2 font-semibold text-left rounded-tr-xl">{t('leaderboard.matrix.table.answer')}</th>
              </tr>
            </thead>
            <tbody>
              {data.questions.map((q, idx) => (
                <tr key={q.id} className="border-b border-slate-100 last:border-b-0 hover:bg-violet-50/40 transition">
                  <td className="px-3 py-2 text-center text-slate-700">{q.number || idx + 1}</td>
                  <td className="px-3 py-2 text-slate-700 whitespace-pre-line">{q.text}</td>
                  <td className="px-3 py-2">
                    {data.answers[idx]
                      ? <span className={data.answers[idx].isCorrect ? "text-green-700 font-semibold" : "text-red-600"}>
                          {data.answers[idx].value}
                        </span>
                      : <span className="text-slate-400 italic">{t('leaderboard.matrix.table.notAnswered')}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserAnswersTable;