import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

function getWeekStart(offset = 0) {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekStart, setWeekStart] = useState(getWeekStart(0));

  useEffect(() => {
    setWeekStart(getWeekStart(weekOffset));
  }, [weekOffset]);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/lessons/public?weekStart=${weekStart}`)
      .then(r => setLessons(r.data))
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }, [weekStart]);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0d1a10] transition-colors duration-300">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-800 to-primary-950 dark:from-primary-950 dark:to-[#0a1208] py-14 px-4">
          <div className="max-w-5xl mx-auto text-center" dir="rtl">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-primary-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <i className="fas fa-book-open text-gold-400"></i>
              خطط الدروس الأسبوعية
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3">جدول الدروس الأسبوعي</h1>
            <p className="text-primary-200 text-sm sm:text-base">اطلع على خطط الدروس لجميع المعلمين لهذا الأسبوع</p>
          </div>
        </section>

        {/* Week navigator */}
        <div className="max-w-5xl mx-auto px-4 py-6" dir="rtl">
          <div className="flex items-center justify-between bg-white dark:bg-[#1a2d1e] rounded-2xl shadow-sm dark:shadow-black/20 px-5 py-3 dark:border dark:border-primary-900/40">
            <button onClick={() => setWeekOffset(w => w - 1)}
              className="flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/40">
              <i className="fas fa-chevron-right text-xs"></i>
              الأسبوع السابق
            </button>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">الأسبوع الحالي</p>
              <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{formatDate(weekStart)}</p>
            </div>
            <button onClick={() => setWeekOffset(w => w + 1)}
              className="flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/40">
              الأسبوع التالي
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 pb-16" dir="rtl">
          {loading ? (
            <div className="text-center py-20 text-primary-500">
              <i className="fas fa-circle-notch fa-spin text-4xl mb-3"></i>
              <p>جاري تحميل الخطط...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-20 text-gray-400 dark:text-gray-500 bg-white dark:bg-[#1a2d1e] rounded-2xl shadow-sm dark:border dark:border-primary-900/40">
              <i className="fas fa-calendar-times text-5xl mb-4"></i>
              <p className="font-semibold text-lg mb-1">لا توجد خطط لهذا الأسبوع</p>
              <p className="text-sm">لم يقم أي معلم بإضافة خطة دروس لهذا الأسبوع بعد</p>
            </div>
          ) : (
            <div className="space-y-6">
              {lessons.map(lesson => (
                <div key={lesson._id} className="bg-white dark:bg-[#1a2d1e] rounded-2xl shadow-md dark:shadow-black/30 overflow-hidden dark:border dark:border-primary-900/40">
                  {/* Header */}
                  <div className="px-6 py-4 bg-gradient-to-l from-primary-600 to-primary-800 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-chalkboard-teacher text-white"></i>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{lesson.teacher?.name || 'معلم'}</p>
                        <p className="text-primary-200 text-xs">{lesson.class?.name || 'الصف'}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
                      {formatDate(lesson.weekStart)}
                    </span>
                  </div>

                  {/* Days grid */}
                  <div className="divide-y dark:divide-primary-900/40">
                    {lesson.days?.filter(d => d.topic || d.course || d.description).map((d, i) => (
                      <div key={i} className="px-6 py-4 flex items-start gap-4 flex-wrap hover:bg-gray-50 dark:hover:bg-primary-900/10 transition-colors">
                        <div className="w-20 flex-shrink-0">
                          <span className="inline-block bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-bold px-2.5 py-1 rounded-lg">{d.day}</span>
                          {d.time && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center" dir="ltr">{d.time}</p>}
                        </div>
                        <div className="flex-1 min-w-0">
                          {d.course && <p className="text-xs text-gold-600 dark:text-gold-400 font-semibold mb-0.5">{d.course}</p>}
                          {d.topic && <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-0.5">{d.topic}</p>}
                          {d.description && <p className="text-xs text-gray-500 dark:text-gray-400">{d.description}</p>}
                        </div>
                      </div>
                    ))}
                    {lesson.days?.every(d => !d.topic && !d.course && !d.description) && (
                      <div className="px-6 py-4 text-center text-gray-400 dark:text-gray-500 text-sm">
                        لا توجد تفاصيل مدخلة لهذه الخطة
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
