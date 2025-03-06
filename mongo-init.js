db = db.getSiblingDB(process.env.MONGO_DB || "social-listening");

db.createUser({
  user: process.env.MONGO_USERNAME || "root",
  pwd: process.env.MONGO_PASSWORD || "password123",
  roles: [
    { role: "readWrite", db: process.env.MONGO_DB || "social-listening" },
  ],
});

db.createCollection("users");
db.createCollection("videos");

print("✅ Database initialized successfully!");
