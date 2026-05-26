import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { hotelName } = await req.json();

    if (!hotelName) {
      return NextResponse.json({ error: "Vui lòng nhập tên khách sạn" }, { status: 400 });
    }

    // Truy vấn Supabase: Tìm review theo tên khách sạn, lấy 5 cái mới nhất
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .ilike('content', `%${hotelName}%`) // Tìm kiếm tương đối (không phân biệt hoa thường)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    // Map lại format cho Dashboard
    const formatted = (data || []).map((r: any) => ({
      id: r.id.toString(),
      customer: r.customer_name || "Khách hàng ẩn danh",
      content: r.content || "",
      status: r.status || "Pending"
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}