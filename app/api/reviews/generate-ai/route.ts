import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { reviewText } = await req.json();
    const API_KEY = process.env.GEMINI_API_KEY;
    
    // Gọi thẳng model 3.5 mới nhất của năm 2026
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Bạn là trợ lý DEPO. Hãy viết 3 phản hồi (standard, friendly, crisis) bằng Tiếng Việt cho review: "${reviewText}". Trả về JSON có 3 key: standard, friendly, crisis. Chỉ trả về JSON sạch.` }] }]
      })
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    let aiText = result.candidates[0].content.parts[0].text.trim();
    
    // Làm sạch JSON
    if (aiText.includes("{")) {
      aiText = aiText.substring(aiText.indexOf("{"), aiText.lastIndexOf("}") + 1);
    }
    
    return NextResponse.json(JSON.parse(aiText));

  } catch (error: any) {
    return NextResponse.json({ 
      standard: "LỖI KẾT NỐI 3.5: " + error.message,
      friendly: "Nếu vẫn báo 404, hãy thử đổi tên model trong URL thành gemini-2.5-flash xem sao nhé.",
      crisis: "Hãy đảm bảo mạng của bạn ổn định."
    });
  }
}