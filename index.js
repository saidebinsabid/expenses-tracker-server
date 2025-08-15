const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// const crypto = require('crypto');
// const secret = crypto.randomBytes(65).toString('hex');
// console.log('Your 65-byte secret:', secret);


const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173", ""],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());


const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-8majy7x-shard-00-00.z95nrcs.mongodb.net:27017,ac-8majy7x-shard-00-01.z95nrcs.mongodb.net:27017,ac-8majy7x-shard-00-02.z95nrcs.mongodb.net:27017/?ssl=true&replicaSet=atlas-xt6l7r-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


// JWT verification
const verifyJWT = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

// verifyEmail middleware
const verifyEmail = (req, res, next) => {
  const token = req.cookies?.accessToken; 
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }

    req.user = { email: decoded.email }; 
    next();
  });
};



async function run() {
  try {
    await client.connect();
    const db = client.db("expenseTracker");
    const usersCollection = db.collection("users");
    const expensesCollection = db.collection("expenses");

// Logout user and clear JWT cookie
app.get("/logout", (req, res) => {
  res
    .clearCookie("token", {              
      httpOnly: true,                     
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Lax",                   
    })
    .json({ message: "Logged out successfully" });
});

// Create a user in MongoDB if not exists
app.post("/users", async (req, res) => {
  const user = req.body;
  try {
    const existingUser = await usersCollection.findOne({ email: user.email });
    if (existingUser) {
      return res.status(200).send({ message: "User already exists" });
    }
    const result = await usersCollection.insertOne(user);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to create user", error });
  }
});

// Issue JWT for existing user
app.post("/jwt", async (req, res) => {
  const { email } = req.body;
  console.log("JWT request for email:", email); 
  const user = await usersCollection.findOne({ email });
  console.log("Found user:", user); 
  if (!user) {
    return res.status(401).send({ message: "User not found" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.cookie("accessToken", token, {
    httpOnly: true,       
    secure: false,       
    sameSite: "lax",  
  }).send({ success: true, token });
});


//Get all expenses
app.get("/expenses", verifyEmail, async (req, res) => {
  try {
    const { email } = req.user;
    const { category } = req.query;

    const filter = { email };
    if (category && category !== "All") filter.category = category;

    const list = await expensesCollection.find(filter).sort({ date: -1 }).toArray();
    res.json(list);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Add a new expense
app.post("/expenses", verifyEmail, async (req, res) => {
  try {
    const expense = req.body;
    expense.email = req.user.email;
    expense.created_at = new Date();

    const result = await expensesCollection.insertOne(expense);

    res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Update an existing expense
app.put("/expenses/:id", verifyEmail, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const filter = { _id: new ObjectId(id), email: req.user.email };
    const result = await expensesCollection.updateOne(filter, { $set: updateData });

    if (result.matchedCount === 0) return res.status(404).json({ message: "Expense not found" });

    res.json({ success: true, message: "Expense updated successfully" });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete an expense
app.delete("/expenses/:id", verifyEmail, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    const result = await expensesCollection.deleteOne({ _id: new ObjectId(id), email: req.user.email });

    if (result.deletedCount === 0) return res.status(404).json({ message: "Expense not found" });

    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

    console.log("MongoDB connected successfully");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => res.send("Expense Tracker Server is running"));
app.listen(port, () => console.log(`Server running on port ${port}`));
