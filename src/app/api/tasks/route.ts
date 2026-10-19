import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const tasks = await db.collection("urgent_tasks").find({}).toArray();

    const mapped = tasks.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      dueTime: item.dueTime,
      priority: item.priority || "MEDIUM",
      status: item.status || "PENDING",
      note: item.note || "",
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: "Tiêu đề công việc là bắt buộc" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const newTask = {
      title: body.title.trim(),
      dueTime: body.dueTime || new Date().toISOString(),
      priority: body.priority || "MEDIUM",
      status: body.status || "PENDING",
      note: body.note ? body.note.trim() : "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("urgent_tasks").insertOne(newTask);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newTask,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get("id");
    const body = await request.json();
    const id = queryId || body.id;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID công việc" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const updateFields: any = {
      updatedAt: new Date(),
    };
    if (body.title !== undefined) updateFields.title = body.title.trim();
    if (body.dueTime !== undefined) updateFields.dueTime = body.dueTime;
    if (body.priority !== undefined) updateFields.priority = body.priority;
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.note !== undefined) updateFields.note = body.note ? body.note.trim() : "";

    await db.collection("urgent_tasks").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get("id");
    const queryIds = searchParams.get("ids");

    // Case 1: Single id from query param
    if (queryId) {
      await db.collection("urgent_tasks").deleteOne({ _id: new ObjectId(queryId) });
      return NextResponse.json({ success: true, count: 1 });
    }

    // Case 2: Comma-separated ids in query param
    if (queryIds) {
      const idsArray = queryIds.split(",").map((id) => new ObjectId(id.trim()));
      const res = await db.collection("urgent_tasks").deleteMany({ _id: { $in: idsArray } });
      return NextResponse.json({ success: true, count: res.deletedCount });
    }

    // Case 3: Body JSON with ids array
    try {
      const body = await request.json();
      if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
        const idsArray = body.ids.map((id: string) => new ObjectId(id));
        const res = await db.collection("urgent_tasks").deleteMany({ _id: { $in: idsArray } });
        return NextResponse.json({ success: true, count: res.deletedCount });
      }
    } catch {
      // Body might be empty
    }

    return NextResponse.json({ error: "Không tìm thấy id cần xóa" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
