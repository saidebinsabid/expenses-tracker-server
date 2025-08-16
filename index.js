const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
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

async function run() {
  try {
    await client.connect();
    const db = client.db("expenseTracker");
    const usersCollection = db.collection("users");
    const expensesCollection = db.collection("expenses");

    // Middleware
    // ------------------

    //Verify JWT from cookie middleware
    const verifyJWT = (req, res, next) => {
      const token = req.cookies?.accessToken;
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.decoded = decoded;
        next();
      });
    };

    //Verify email middleware
    const verifyEmail = (req, res, next) => {
      if (!req.decoded?.email)
        return res.status(401).json({ message: "Invalid token" });
      req.user = { email: req.decoded.email };
      next();
    };

    //Routes
    //------------------

    //Create/Get user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const existingUser = await usersCollection.findOne({ email: user.email });
      if (existingUser) return res.status(200).json({ message: "User exists" });

      const result = await usersCollection.insertOne(user);
      res.status(201).json(result);
    });

    //Issue JWT and set cookie
    app.post("/jwt", async (req, res) => {
      const { email } = req.body;
      // console.log("JWT request email:", email);

      const user = await usersCollection.findOne({ email });
      // console.log("Found user:", user);

      if (!user) return res.status(401).json({ message: "User not found" });

      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("accessToken", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          maxAge: 60 * 60 * 1000,
        })
        .json({ success: true, token });
    });

    //Logout
    app.get("/logout", (req, res) => {
      res
        .clearCookie("accessToken", {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        })
        .json({ message: "Logged out" });
    });

    //------------------
    //Protected Routes
    //------------------

    //Get expenses
    app.get("/expenses", verifyJWT, verifyEmail, async (req, res) => {
      const { email } = req.user;
      const { category } = req.query;
      const filter = { email };
      if (category && category !== "All") filter.category = category;

      const list = await expensesCollection
        .find(filter)
        .sort({ date: -1 })
        .toArray();
      res.json(list);
    });

    //Add expense
    app.post("/expenses", verifyJWT, verifyEmail, async (req, res) => {
      const expense = {
        ...req.body,
        email: req.user.email,
        created_at: new Date(),
      };
      const result = await expensesCollection.insertOne(expense);
      res.status(201).json({ success: true, insertedId: result.insertedId });
    });

    //Update expense
    app.put("/expenses/:id", verifyJWT, verifyEmail, async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      const updateData = { ...req.body, updatedAt: new Date() };
      delete updateData._id;

      const result = await expensesCollection.updateOne(
        { _id: new ObjectId(id), email: req.user.email },
        { $set: updateData }
      );
      if (result.matchedCount === 0)
        return res.status(404).json({ message: "Expense not found" });

      res.json({ success: true, message: "Updated" });
    });

    //Delete expense
    app.delete("/expenses/:id", verifyJWT, verifyEmail, async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      const result = await expensesCollection.deleteOne({
        _id: new ObjectId(id),
        email: req.user.email,
      });
      if (result.deletedCount === 0)
        return res.status(404).json({ message: "Expense not found" });

      res.json({ success: true, message: "Deleted" });
    });

    console.log("MongoDB connected successfully");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => res.send("Expense Tracker Server is running"));
app.listen(port, () => console.log(`Server running on port ${port}`));
