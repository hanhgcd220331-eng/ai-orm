import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Dấu @ đại diện cho thư mục gốc
export async function GET() {
  try {
    // Lấy tất cả review có trạng thái 'Pending' từ Supabase
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'Pending');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map lại dữ liệu cho đúng format Dashboard
    const formattedReviews = (data || []).map((r: any) => ({
      id: r.id.toString(),
      customer: r.customer_name,
      content: r.content,
      status: r.status
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}