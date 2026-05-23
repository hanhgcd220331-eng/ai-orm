'use client';

import { useState } from 'react';

// Dữ liệu mẫu (Sample Data) theo đúng PRD để bạn test luồng nhanh
const initialReviews = [
  { id: '1', customer: 'Nguyễn Văn A', content: 'Giày rất đẹp nhưng giao hàng hơi chậm.', status: 'Pending' },
  { id: '2', customer: 'Trần Thị B', content: 'Sản phẩm tuyệt vời, nhân viên nhiệt tình!', status: 'Pending' },
];

export default function Dashboard() {
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [aiResponses, setAiResponses] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Epic 2: Xử lý AI
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
      alert('Lỗi gọi AI!');
    } finally {
      setLoading(false);
    }
  };

  // Epic 3: UI-02 Duyệt câu trả lời (Approve)
  const handleApprove = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, status: 'Resolved' } : r
    ));
    setSelectedReview(null);
    setAiResponses(null);
    alert('Đã Approve & Chuyển trạng thái thành Resolved!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #0070f3' }}>
        <h1 style={{ color: '#0070f3' }}>DEPO ORM - QUẢN TRỊ ĐÁNH GIÁ</h1>
        <p>Người phụ trách: UCTalent Labs (MVP 0)</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* CỘT TRÁI: DANH SÁCH REVIEW (UI-01) */}
        <section style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3>Danh sách Review (Pending)</h3>
          {reviews.filter(r => r.status === 'Pending').map(review => (
            <div 
              key={review.id} 
              onClick={() => { setSelectedReview(review); setAiResponses(null); }}
              style={{ 
                padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '5px', 
                cursor: 'pointer', backgroundColor: selectedReview?.id === review.id ? '#eef6ff' : '#fff' 
              }}
            >
              <strong>{review.customer}</strong>
              <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>{review.content.substring(0, 40)}...</p>
              <span style={{ fontSize: '12px', background: '#fff3cd', padding: '2px 6px', borderRadius: '4px' }}>{review.status}</span>
            </div>
          ))}
          {reviews.filter(r => r.status === 'Pending').length === 0 && <p>Hết review cần xử lý!</p>}
        </section>

        {/* CỘT PHẢI: CHI TIẾT & XỬ LÝ AI (AI-01 & UI-02) */}
        <section style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          {selectedReview ? (
            <>
              <h3>Chi tiết Review</h3>
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '6px' }}>
                <p><strong>Khách hàng:</strong> {selectedReview.customer}</p>
                <p><strong>Nội dung:</strong> {selectedReview.content}</p>
                <button 
                  onClick={() => handleGenerateAI(selectedReview.content)}
                  disabled={loading}
                  style={{ background: '#0070f3', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  {loading ? 'AI Đang suy nghĩ...' : '🤖 Generate AI Response'}
                </button>
              </div>

              {aiResponses && (
                <div style={{ marginTop: '20px' }}>
                  <h3>Gợi ý từ AI (Chọn 1 để Approve)</h3>
                  {[
                    { key: 'standard', label: 'Tiêu chuẩn', color: '#0070f3' },
                    { key: 'friendly', label: 'Thân thiện', color: '#28a745' },
                    { key: 'crisis', label: 'Khắc phục lỗi', color: '#dc3545' }
                  ].map(style => (
                    <div key={style.key} style={{ border: `1px solid ${style.color}`, padding: '15px', borderRadius: '6px', marginBottom: '10px' }}>
                      <strong style={{ color: style.color }}>Phong cách {style.label}:</strong>
                      <p>{aiResponses[style.key]}</p>
                      <button 
                        onClick={() => handleApprove(selectedReview.id)}
                        style={{ background: style.color, color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', marginTop: '100px' }}>Chọn một review bên trái để bắt đầu xử lý.</p>
          )}
        </section>
      </div>
    </div>
  );
}