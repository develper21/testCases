// app/api/companies/benefit/[benefit]/route.js
import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
  const { benefit } = params;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const companies = await db
    .collection("companies")
    .find({ benefits: { $elemMatch: { $regex: new RegExp(benefit, "i") } } })
    .toArray();

  return Response.json(companies);
}
