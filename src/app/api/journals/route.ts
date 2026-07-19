import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const journals = await db.collection("journals").find({}).sort({ timestamp: -1 }).toArray();
    
    const mapped = journals.map((item) => ({
      id: item._id.toString(),
      direction: item.direction,
      symbol: item.symbol ?? null,
      totalScore: item.totalScore,
      maxScore: item.maxScore,
      createdAt: item.createdAt,
      conditions: item.conditions,
      entry: item.entry,
      sl: item.sl,
      tp: item.tp,
      vol: item.vol,
      note: item.note,
      profit: item.profit,
      result: item.result,
      methodId: item.methodId ?? null,
      methodName: item.methodName ?? null,
    }));
    
    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.direction || body.totalScore === undefined || body.maxScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const doc = {
      direction: body.direction,
      symbol: body.symbol ?? null,
      totalScore: body.totalScore,
      maxScore: body.maxScore,
      createdAt: new Date().toLocaleString("vi-VN"),
      conditions: body.conditions || [],
      entry: body.entry ?? null,
      sl: body.sl ?? null,
      tp: body.tp ?? null,
      vol: body.vol ?? null,
      note: body.note ?? "",
      profit: null,
      result: null,
      methodId: body.methodId ?? null,
      methodName: body.methodName ?? null,
      timestamp: new Date(),
    };

    const result = await db.collection("journals").insertOne(doc);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...doc,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing journal id" }, { status: 400 });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const updateFields: Record<string, any> = {};
    if (body.direction !== undefined) updateFields.direction = body.direction;
    if (body.symbol !== undefined) updateFields.symbol = body.symbol;
    if (body.totalScore !== undefined) updateFields.totalScore = body.totalScore;
    if (body.maxScore !== undefined) updateFields.maxScore = body.maxScore;
    if (body.conditions !== undefined) updateFields.conditions = body.conditions;
    if (body.entry !== undefined) updateFields.entry = body.entry;
    if (body.sl !== undefined) updateFields.sl = body.sl;
    if (body.tp !== undefined) updateFields.tp = body.tp;
    if (body.vol !== undefined) updateFields.vol = body.vol;
    if (body.note !== undefined) updateFields.note = body.note;
    if (body.profit !== undefined) updateFields.profit = body.profit;
    if (body.result !== undefined) updateFields.result = body.result;
    if (body.methodId !== undefined) updateFields.methodId = body.methodId;
    if (body.methodName !== undefined) updateFields.methodName = body.methodName;

    const result = await db.collection("journals").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing journal id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection("journals").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

