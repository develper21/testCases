// app/api/companies/count/route.js
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const location = searchParams.get("location");
  const skill = searchParams.get("skill");

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const collection = db.collection("companies");

  let filter = {};
  if (name) filter.name = new RegExp(name, "i");
  if (location) filter.location = new RegExp(location, "i");
  if (skill) filter["hiringCriteria.skills"] = { $regex: new RegExp(skill, "i") };

  const total = await collection.countDocuments(filter);

  return Response.json({ total });
}
