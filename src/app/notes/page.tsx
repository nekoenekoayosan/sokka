'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import NoteEditor from '../components/NoteEditor';
import { useAuth } from '../components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'edit'>('list');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchNotes = useCallback(async () => {
    if (!supabaseBrowser || !user) return;
    const { data } = await supabaseBrowser
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setNotes(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user, fetchNotes]);

  const handleNew = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setView('edit');
  };

  const handleSelect = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setView('edit');
  };

  const handleSave = async () => {
    if (!supabaseBrowser || !user) return;
    setSaving(true);

    if (selectedNote) {
      await supabaseBrowser
        .from('notes')
        .update({ title: title || '無題のノート', content, updated_at: new Date().toISOString() })
        .eq('id', selectedNote.id);
    } else {
      const { data } = await supabaseBrowser
        .from('notes')
        .insert({ user_id: user.id, title: title || '無題のノート', content })
        .select()
        .single();
      if (data) setSelectedNote(data);
    }

    setSaving(false);
    await fetchNotes();
  };

  const handleDelete = async () => {
    if (!supabaseBrowser || !selectedNote) return;
    if (!confirm('このノートを削除しますか？')) return;

    await supabaseBrowser.from('notes').delete().eq('id', selectedNote.id);
    setSelectedNote(null);
    setView('list');
    await fetchNotes();
  };

  const handleBack = () => {
    setView('list');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getPreview = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.slice(0, 50) || 'メモなし';
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-4">

        {view === 'list' && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-[#1A1A1A]">🌱 マイノート</h1>
              <button
                onClick={handleNew}
                className="bg-[#57C0F3] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#3aaee0] transition-colors shadow-sm"
              >
                ＋ 新規作成
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-[#888888] text-center py-12">読み込み中...</p>
            ) : notes.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center gap-3">
                <span className="text-4xl">📝</span>
                <p className="text-sm text-[#888888]">まだノートがありません</p>
                <button
                  onClick={handleNew}
                  className="text-sm text-[#227298] hover:opacity-70 transition-opacity"
                >
                  最初のノートを作成する →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelect(note)}
                    className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <p className="text-sm font-bold text-[#1A1A1A] truncate">{note.title}</p>
                    <p className="text-xs text-[#888888] mt-1 truncate">{getPreview(note.content)}</p>
                    <p className="text-[10px] text-[#888888] mt-2">{formatDate(note.updated_at)}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'edit' && (
          <>
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="text-sm text-[#227298] hover:opacity-70 transition-opacity"
              >
                ← ノート一覧
              </button>
              <div className="flex items-center gap-2">
                {selectedNote && (
                  <button
                    onClick={handleDelete}
                    className="text-xs text-[#A72929] hover:opacity-70 transition-opacity px-3 py-1.5"
                  >
                    削除
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#57C0F3] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#3aaee0] transition-colors shadow-sm disabled:opacity-40"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>

            {/* タイトル */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ノートのタイトル"
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-base font-bold text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition"
            />

            {/* エディタ */}
            <NoteEditor content={content} onChange={setContent} />
          </>
        )}
      </main>
    </div>
  );
}
