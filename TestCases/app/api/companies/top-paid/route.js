// app/api/companies/top-paid/route.js
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let limit = parseInt(searchParams.get("limit")) || 5;
  if (limit > 50) limit = 50;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const companies = await db
    .collection("companies")
    .find({})
    .sort({ "salaryBand.base": -1 })
    .limit(limit)
    .toArray();

  return Response.json(companies);
}
