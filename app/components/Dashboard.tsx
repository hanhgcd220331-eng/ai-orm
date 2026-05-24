'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [aiResponses, setAiResponses] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Lấy dữ liệu từ Supabase khi vừa vào trang hoặc bấm Fetch
  const fetchFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'Pending') // Chỉ lấy những cái chưa xử lý
        .order('id', { ascending: false });

      if (error) throw error;

      // Map lại format để hiển thị trên UI
      const formatted = (data || []).map(r => ({
        id: r.id,
        customer: r.customer_name,
        content: r.content,
        status: r.status
      }));

      setReviews(formatted);
    } catch (err: any) {
      alert("Lỗi Fetch DB: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetch lần đầu khi load trang
  useEffect(() => {
    fetchFromSupabase();
  }, []);

  // 2. Gọi Gemini AI xử lý nội dung
  const handleGenerateAI = async (content: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/reviews/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewText: content })
      });
      const data = await response.json();
      setAiResponses(data);
    } catch (error) {
      alert('Lỗi gọi Gemini AI!');
    } finally {
      setLoading(false);
    }
  };

  // 3. Duyệt (Approve) và Cập nhật lại Supabase
  const handleApprove = async (id: number, responseText: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          ai_response: responseText, 
          status: 'Resolved' 
        })
        .eq('id', id);

      if (error) throw error;

      // Cập nhật UI: Xóa review đã duyệt khỏi danh sách hiển thị
      setReviews(prev => prev.filter(r => r.id !== id));
      setSelectedReview(null);
      setAiResponses(null);
      alert('Đã duyệt và cập nhật Supabase thành công!');
    } catch (err: any) {
      alert("Lỗi Update DB: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#1a73e8', margin: 0 }}>DEPO ORM - DATABASE MODE</h1>
          <p style={{ color: '#5f6368' }}>Hệ thống quản trị phản hồi khách hàng (MVP 0)</p>
        </div>
        <button 
          onClick={fetchFromSupabase}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          {loading ? '🔄 Loading...' : '🔄 Làm mới dữ liệu'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '25px' }}>
        
        {/* DANH SÁCH REVIEW TỪ SUPABASE */}
        <aside style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Reviews (Pending)</h3>
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {reviews.map(review => (
              <div 
                key={review.id} 
                onClick={() => { setSelectedReview(review); setAiResponses(null); }}
                style={{ 
                  padding: '15px', border: '1px solid #eee', marginBottom: '12px', borderRadius: '10px', 
                  cursor: 'pointer', backgroundColor: selectedReview?.id === review.id ? '#e8f0fe' : '#fff',
                  borderLeft: selectedReview?.id === review.id ? '5px solid #1a73e8' : '1px solid #eee',
                  transition: '0.3s'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{review.customer}</div>
                <p style={{ fontSize: '13px', color: '#5f6368', margin: '8px 0', lineHeight: '1.4' }}>
                  {review.content ? review.content.substring(0, 80) : "Nội dung trống"}...
                </p>
                <span style={{ fontSize: '11px', background: '#feefc3', color: '#af5d00', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {review.status}
                </span>
              </div>
            ))}
            {reviews.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                🎉 Đã xử lý hết dữ liệu!
              </div>
            )}
          </div>
        </aside>

        {/* CHI TIẾT & AI ENGINE */}
        <main style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {selectedReview ? (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <h2 style={{ marginTop: 0 }}>Phân tích phản hồi</h2>
              <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', marginBottom: '25px' }}>
                <p><strong>Khách hàng:</strong> {selectedReview.customer}</p>
                <p style={{ fontSize: '16px', lineHeight: '1.6' }}><strong>Nội dung:</strong> "{selectedReview.content}"</p>
                <button 
                  onClick={() => handleGenerateAI(selectedReview.content)}
                  disabled={loading}
                  style={{ background: '#1a73e8', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}
                >
                  {loading ? '✨ AI đang soạn thảo...' : '🤖 Yêu cầu AI soạn câu trả lời'}
                </button>
              </div>

              {aiResponses && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {[
                    { key: 'standard', label: 'Tiêu chuẩn (Lịch sự)', color: '#1a73e8' },
                    { key: 'friendly', label: 'Thân thiện (Gần gũi)', color: '#188038' },
                    { key: 'crisis', label: 'Khắc phục (Khi khách chê)', color: '#d93025' }
                  ].map(style => (
                    <div key={style.key} style={{ border: `1px solid ${style.color}`, padding: '20px', borderRadius: '10px', backgroundColor: '#fff' }}>
                      <div style={{ color: style.color, fontWeight: 'bold', marginBottom: '10px', fontSize: '14px', textTransform: 'uppercase' }}>
                        {style.label}
                      </div>
                      <p style={{ fontSize: '14px', color: '#3c4043', lineHeight: '1.5', marginBottom: '15px' }}>{aiResponses[style.key]}</p>
                      <button 
                        onClick={() => handleApprove(selectedReview.id, aiResponses[style.key])}
                        style={{ background: style.color, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Đồng ý câu trả lời này
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bdc1c6' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>📥</div>
              <p>Chọn một phản hồi từ danh sách bên trái để bắt đầu</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}