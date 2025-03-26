import { MongoClient } from "mongodb"
import { config } from "dotenv"
config()

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB as string

let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectToDatabase() {
  // If we have the cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // If no cached connection, create a new one
  const client = new MongoClient(MONGODB_URI)
  await client.connect()

  const db = client.db(MONGODB_DB)
  
  // Cache the connection
  cachedClient = client
  cachedDb = db

  return { client, db }
}

