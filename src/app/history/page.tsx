'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Course {
  id: string;
  name: string;
  created_at: string;
}

export default function HistoryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-6">学習履歴</h1>

        {loading ? (
          <p className="text-sm text-[#888888] text-center py-12">読み込み中...</p>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-sm text-[#888888]">コースがまだありません</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/history/${course.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow block"
              >
                <p className="font-bold text-[#1A1A1A]">{course.name}</p>
                <p className="text-xs text-[#888888] mt-1">
                  {new Date(course.created_at).toLocaleDateString('ja-JP')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
