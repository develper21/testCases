// app/api/companies/headcount-range/route.js
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const min = parseInt(searchParams.get("min")) || 0;
  const max = searchParams.get("max") ? parseInt(searchParams.get("max")) : null;

  let filter = { headcount: { $gte: min } };
  if (max !== null) filter.headcount.$lte = max;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const companies = await db.collection("companies").find(filter).toArray();

  return Response.json(companies);
}
