import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const conditions = await db.collection("conditions").find({}).toArray();

    const mapped = conditions.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      scores: item.scores,
      subConditions: item.subConditions ?? [],
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("conditions").insertOne({
      name: body.name,
      scores: body.scores,
      subConditions: body.subConditions ?? [],
      createdAt: new Date(),
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      name: body.name,
      scores: body.scores,
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
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    await db.collection("conditions").updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: body.name, scores: body.scores, subConditions: body.subConditions ?? [] } }
    );

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
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    await db.collection("conditions").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
