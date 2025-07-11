import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Example: delete employee logic
  // await deleteEmployee(params.id);
  return NextResponse.json({ success: true });
} 