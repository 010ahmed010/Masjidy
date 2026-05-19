import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const emptyDays = () => DAYS.map(d => ({ day: d, time: '', topic: '', description: '', course: '' }));

export default function TeacherLessons() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [days, setDays] = useState(emptyDays());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const teacherId = user._id || user.id;
    axios.get(`/api/classes?teacherId=${teacherId}`)
      .then(r => setClasses(r.data))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!selectedClass) { setDays(emptyDays()); return; }
    setFetching(true);
    axios.get(`/api/lessons?classId=${selectedClass}`)
      .then(r => {
        const existing = r.data[0];
        if (existing?.days?.length) {
          setDays(DAYS.map(d => existing.days.find(e => e.day === d) || { day: d, time: '', topic: '', description: '', course: '' }));
        } else {
          setDays(emptyDays());
        }
      })
      .catch(() => setDays(emptyDays()))
      .finally(() => setFetching(false));
  }, [selectedClass]);

  const updateDay = (index, field, value) => {
    setDays(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const handleSubmit = async () => {
    if (!selectedClass) return;
    setLoading(true);
    await axios.post('/api/lessons', { classId: selectedClass, days }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
  };

  const inputCls = "w-full border border-gray-300 dark:border-primary-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white dark:bg-[#0d1a10] text-gray-800 dark:text-gray-100";
  const selectedClassName = classes.find(c => c._id === selectedClass)?.name;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
        <i className="fas fa-book-open text-primary-600 dark:text-primary-400 ml-2"></i>خطة الدروس الأسبوعية
      </h1>

      <div className="bg-white dark:bg-[#1a2d1e] rounded-2xl shadow-md dark:shadow-black/30 p-5 mb-6 dark:border dark:border-primary-900/40">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">اختر الصف</label>
        {classes.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-2">لا توجد صفوف مسندة إليك</p>
        ) : (
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={inputCls}>
            <option value="">-- اختر الصف لعرض أو تعديل خطته --</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {!selectedClass ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-[#1a2d1e] rounded-2xl shadow-md dark:border dark:border-primary-900/40">
          <i className="fas fa-book-open text-5xl mb-3"></i>
          <p>اختر صفاً لعرض أو تعديل خطة دروسه</p>
        </div>
      ) : fetching ? (
        <div className="text-center py-16 text-primary-500 bg-white dark:bg-[#1a2d1e] rounded-2xl shadow-md dark:border dark:border-primary-900/40">
          <i className="fas fa-circle-notch fa-spin text-4xl mb-3"></i>
          <p>جاري تحميل الخطة...</p>
        </div>
      ) : (
        <>
          {selectedClassName && (
            <div className="mb-4 flex items-center gap-2" dir="rtl">
              <span className="text-xs bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700/50 px-3 py-1 rounded-full font-semibold">
                <i className="fas fa-chalkboard ml-1"></i>{selectedClassName}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">— أدخل أو عدّل خطة الدروس أدناه ثم احفظها</span>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {days.map((d, i) => (
              <div key={d.day} className="bg-white dark:bg-[#1a2d1e] rounded-2xl shadow-md dark:shadow-black/30 overflow-hidden dark:border dark:border-primary-900/40">
                <div className="px-5 py-3 bg-primary-50 dark:bg-primary-900/30 border-b dark:border-primary-900/40 flex items-center gap-2">
                  <i className="fas fa-calendar-day text-primary-600 dark:text-primary-400"></i>
                  <span className="font-bold text-primary-800 dark:text-gray-100">{d.day}</span>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">الوقت</label>
                    <input type="time" value={d.time} onChange={e => updateDay(i, 'time', e.target.value)} className={inputCls} dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">الدورة / المادة</label>
                    <input type="text" value={d.course} onChange={e => updateDay(i, 'course', e.target.value)} placeholder="مثال: القرآن الكريم" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">موضوع الدرس</label>
                    <input type="text" value={d.topic} onChange={e => updateDay(i, 'topic', e.target.value)} placeholder="موضوع الدرس لهذا اليوم..." className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">تفاصيل إضافية</label>
                    <input type="text" value={d.description} onChange={e => updateDay(i, 'description', e.target.value)} placeholder="ملاحظات أو تفاصيل..." className={inputCls} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {saved && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl p-3 text-sm font-semibold mb-4">
              <i className="fas fa-check-circle ml-2"></i>تم حفظ خطة الدروس بنجاح!
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full sm:w-auto bg-primary-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-800 disabled:opacity-60">
            {loading
              ? <><i className="fas fa-spinner fa-spin ml-2"></i>جاري الحفظ...</>
              : <><i className="fas fa-save ml-2"></i>حفظ خطة الدروس</>}
          </button>
        </>
      )}
    </div>
  );
}
