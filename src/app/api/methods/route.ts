import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const methods = await db.collection("methods").find({}).toArray();

    const mapped = methods.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      conditionIds: item.conditionIds ?? [],
      steps: item.steps ?? [],
      createdAt: item.createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("methods").insertOne({
      name: body.name,
      conditionIds: body.conditionIds ?? [],
      steps: body.steps ?? [],
      createdAt: new Date(),
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      name: body.name,
      conditionIds: body.conditionIds ?? [],
      steps: body.steps ?? [],
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
    await db.collection("methods").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: body.name,
          conditionIds: body.conditionIds ?? [],
          steps: body.steps ?? [],
        },
      }
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
    await db.collection("methods").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
