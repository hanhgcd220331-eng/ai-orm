'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [aiResponses, setAiResponses] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // BIẾN MỚI: Để lưu tên khách sạn người dùng nhập
  const [hotelSearch, setHotelSearch] = useState("");

  // 1. SỬA LẠI: Lấy 5 dữ liệu mới nhất từ Supabase theo tên khách sạn
  const fetchFromSupabase = async () => {
    if (!hotelSearch.trim()) {
      alert("Vui lòng nhập tên khách sạn để Fetch!");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .ilike('content', `%${hotelSearch}%`) // Lọc nội dung có chứa tên khách sạn
        .order('created_at', { ascending: false }) // Mới nhất lên đầu
        .limit(5); // CHỈ LẤY 5 REVIEW

      if (error) throw error;

      const formatted = (data || []).map(r => ({
        id: r.id,
        customer: r.customer_name,
        content: r.content,
        status: r.status
      }));

      setReviews(formatted);
      setSelectedReview(null); // Reset lại vùng chi tiết khi fetch mới
      setAiResponses(null);
      
      if (formatted.length === 0) {
        alert("Không tìm thấy review nào cho khách sạn này!");
      }
    } catch (err: any) {
      alert("Lỗi Fetch DB: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleApprove = async (id: number, responseText: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ ai_response: responseText, status: 'Resolved' })
        .eq('id', id);

      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== id));
      setSelectedReview(null);
      setAiResponses(null);
      alert('Đã duyệt thành công!');
    } catch (err: any) {
      alert("Lỗi Update DB: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ color: '#1a73e8', margin: 0, fontSize: '24px' }}>DEPO ORM - 2026</h1>
          <p style={{ color: '#5f6368', margin: '5px 0 0 0' }}>Hệ thống phản hồi khách hàng thông minh</p>
        </div>
        
        {/* THANH SEARCH MỚI: Đúng yêu cầu DP-01 */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text"
            placeholder="Nhập tên khách sạn..."
            value={hotelSearch}
            onChange={(e) => setHotelSearch(e.target.value)}
            style={{ 
              padding: '12px 15px', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0', 
              width: '250px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <button 
            onClick={fetchFromSupabase}
            disabled={loading}
            style={{ 
              padding: '12px 25px', 
              background: '#1a73e8', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: '600',
              boxShadow: '0 2px 6px rgba(26,115,232,0.3)'
            }}
          >
            {loading ? '⌛ Đang Fetch...' : '🔍 Fetch'}
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '25px' }}>
        <aside style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '80vh', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '15px', color: '#3c4043' }}>
            Kết quả mới nhất (Max: 5)
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', marginTop: '10px' }}>
            {reviews.map(review => (
              <div 
                key={review.id} 
                onClick={() => { setSelectedReview(review); setAiResponses(null); }}
                style={{ 
                  padding: '15px', border: '1px solid #eee', marginBottom: '12px', borderRadius: '10px', 
                  cursor: 'pointer', backgroundColor: selectedReview?.id === review.id ? '#f1f7fe' : '#fff',
                  borderLeft: selectedReview?.id === review.id ? '5px solid #1a73e8' : '1px solid #eee',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a73e8' }}>{review.customer}</div>
                <p style={{ fontSize: '13px', color: '#5f6368', margin: '8px 0', lineHeight: '1.4' }}>
                  {review.content ? review.content.substring(0, 90) : "Nội dung trống"}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                   <span style={{ fontSize: '10px', background: '#e8f0fe', color: '#1967d2', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {review.status}
                  </span>
                </div>
              </div>
            ))}
            {reviews.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#dadce0' }}>
                <div style={{ fontSize: '40px' }}>🔎</div>
                <p>Nhập tên khách sạn và bấm Fetch để xem dữ liệu</p>
              </div>
            )}
          </div>
        </aside>

        <main style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {selectedReview ? (
            <div>
              <h2 style={{ marginTop: 0, color: '#202124' }}>Xử lý phản hồi khách hàng</h2>
              <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #f1f3f4', marginBottom: '30px' }}>
                <p style={{ margin: '0 0 10px 0', color: '#5f6368' }}><strong>Khách hàng:</strong> {selectedReview.customer}</p>
                <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#202124', fontStyle: 'italic' }}>"{selectedReview.content}"</p>
                <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={() => handleGenerateAI(selectedReview.content)}
                    disabled={loading}
                    style={{ background: '#1a73e8', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    {loading ? '✨ Đang tạo...' : '🤖 Soạn phản hồi bằng AI'}
                  </button>
                </div>
              </div>

              {aiResponses && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {[
                    { key: 'standard', label: 'Tiêu chuẩn', color: '#1a73e8', desc: 'Phản hồi lịch sự, đúng mực.' },
                    { key: 'friendly', label: 'Thân thiện', color: '#188038', desc: 'Gần gũi, tạo cảm giác thân thiết.' },
                    { key: 'crisis', label: 'Xử lý khủng hoảng', color: '#d93025', desc: 'Dùng khi khách không hài lòng.' }
                  ].map(style => (
                    <div key={style.key} style={{ border: `1px solid #dadce0`, padding: '20px', borderRadius: '12px', backgroundColor: '#fff', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: style.color, fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>{style.label}</span>
                        <span style={{ fontSize: '12px', color: '#70757a' }}>{style.desc}</span>
                      </div>
                      <p style={{ fontSize: '15px', color: '#3c4043', lineHeight: '1.6', marginBottom: '20px', padding: '10px', background: '#fcfcfc', borderRadius: '8px' }}>{aiResponses[style.key]}</p>
                      <button 
                        onClick={() => handleApprove(selectedReview.id, aiResponses[style.key])}
                        style={{ background: style.color, color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                      >
                        Sử dụng nội dung này
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bdc1c6' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.5 }}>📊</div>
              <h3 style={{ color: '#dadce0' }}>Chưa có nội dung nào được chọn</h3>
              <p>Vui lòng tìm kiếm khách sạn và chọn một đánh giá cụ thể để AI phân tích.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}