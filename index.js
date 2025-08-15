const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
dotenv.config();
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
async function run() {
  try {
    await client.connect();
    const db = client.db("expenseTracker");
    const usersCollection = db.collection("users");
    const expensesCollection = db.collection("expenses");

    // Middleware: Verify JWT token from cookies to protect private routes
    const verifyJWT = (req, res, next) => {
      const token = req.cookies?.accessToken;
      if (!token) {
        return res.status(401).send({ message: "unauthorized access" });
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "forbidden access" });
        }
        req.user = decoded; // <— this fixes it
        next();
      });
    };

    // Route: Logout the user by clearing the access token cookie
    app.get("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
        })
        .json({ message: "Logged out successfully" });
    });

    // Route: Generate a new JWT token and send it as an HTTP-only cookie
    app.post("/jwt", (req, res) => {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res
        .cookie("accessToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
        .send({ success: true });
    });

    // Route: Create a new user in the database if they don’t already exist
    app.post("/users", async (req, res) => {
      try {
        const { name, email } = req.body;
        if (!name || !email) {
          return res
            .status(400)
            .json({ message: "Name and email are required" });
        }

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(200).json({ message: "User already exists" });
        }

        const newUser = {
          name,
          email,
          createdAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);
        console.log(result);
        res.status(201).json({
          message: "User added successfully",
          userId: result.insertedId,
        });
      } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    //Route: GET /expenses?category=Food|Transport|Shopping|Others|All
    app.get("/expenses", verifyJWT, async (req, res) => {
      const { email } = req.user;
      const { category } = req.query;

      const filter = { email };
      if (category && category !== "All") {
        filter.category = category;
      }

      const list = await expensesCollection
        .find(filter)
        .sort({ date: -1 }) // latest first
        .toArray();

      res.json(list);
    });

    //Route: POST /expenses
    app.post("/expenses", verifyJWT, async (req, res) => {
      const { email } = req.user;
      const { title, amount, category, date } = req.body || {};
      if (!title || amount == null || !category || !date) {
        return res
          .status(400)
          .json({ message: "title, amount, category, date are required" });
      }
      const numericAmount = Number(amount);
      if (Number.isNaN(numericAmount) || numericAmount < 0) {
        return res
          .status(400)
          .json({ message: "amount must be a non-negative number" });
      }

      const doc = {
        title: String(title).trim(),
        amount: numericAmount,
        category,
        date: new Date(date),
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await expensesCollection.insertOne(doc);
      res.status(201).json({ _id: result.insertedId, ...doc });
    });


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Expense Tracker Server is running");
});

// Start the server
app.listen(port, () => {
  console.log(`Expense Tracker Server is running ${port}`);
});
