require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Verify JWT Token
// const verifyToken = async (req, res, next) => {
//   const token = req?.cookies?.token;

//   if (!token) {
//     return res.status(401).send({ message: "Unauthorized Access" });
//   }

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       console.log(err);
//       return res.status(401).send({ message: "Unauthorized Access" });
//     }
//     req.user = decoded;
//     next();
//   });
// };

// Verify JWT Token (Middlewares)
const verifyToken = (req, res, next) => {
  // console.log("Inside verify token", req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.decoded = decoded;
    next();
  });
};

// Use verify admin after verifyToken
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  const isAdmin = user?.role === "admin";
  if (!isAdmin) {
    return res.status(403).send({ message: "Forbidden access" });
  }
  next();
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.baizo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    // await client.connect();

    // All Collections of Database
    const db = client.db("primeScopeNewsDB");
    const userCollection = db.collection("users");

    // Generate JWT token
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res.send({ token });
    });

    // Logout || Clear Cookie from Browser
    // app.get("/logout", async (req, res) => {
    //   try {
    //     res
    //       .clearCookie("token", {
    //         maxAge: 0,
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === "production",
    //         sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //       })
    //       .send({ success: true });
    //   } catch (err) {
    //     res.status(500).send(err);
    //   }
    // });

    // Save or Update a User on Database
    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };
      // Check if User is already exist in DB
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        return res.status(200).send({
          success: true,
          exists: true,
          message: "User already exists",
        });
      }

      const result = await userCollection.insertOne(user);
      res.status(201).send({
        success: true,
        exists: false,
        insertedId: result.insertedId,
      });
    });

    // Get All Users Data from Database
    app.get("/users", async (req, res) => {
      // console.log(req.headers);
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Assignment 12 Server...");
});

app.listen(port, () => {
  console.log(`Assignment 12 Server is running on port ${port}`);
});
