// app/api/companies/by-location/[location]/route.js
import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
  const { location } = params;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const companies = await db
    .collection("companies")
    .find({ location: { $regex: new RegExp(location, "i") } })
    .toArray();

  return Response.json(companies);
}
