// app/api/companies/by-skill/[skill]/route.js
import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
  const { skill } = params;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const companies = await db
    .collection("companies")
    .find({ "hiringCriteria.skills": { $regex: new RegExp(skill, "i") } })
    .toArray();

  return Response.json(companies);
}
