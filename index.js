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

// Verify JWT Token (Middlewares)
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }

  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }

    // Attach decoded user ID to the request object
    req.userId = decoded.id; // Ensure the token includes the `id` field
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
    const publisherCollection = db.collection("publishers");
    const articleCollection = db.collection("articles");

    // Generate JWT token
    app.post("/jwt", async (req, res) => {
      const user = req.body; // Expect `user` to have `id` and `email`
      const token = jwt.sign(
        { id: user._id, email: user.email }, // Include `id`
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "365d" }
      );
      res.send({ token });
    });

    // Save all Users on Database
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

    // Get Admin Data from Database
    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Forbidden access" });
      }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = true;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    app.patch("/users/admin/:id", verifyToken, async (req, res) => {
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

    app.get("/profile", verifyToken, async (req, res) => {
      try {
        const userId = req.userId; // Extracted from token middleware
        const user = await userCollection.findOne({
          _id: new ObjectId(userId),
        });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Failed to fetch profile", error });
      }
    });

    app.put("/profile", verifyToken, async (req, res) => {
      try {
        const userId = req.userId; // Extracted from token middleware
        const updatedData = req.body;

        const result = await userCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: updatedData }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).json({ message: "Profile update failed" });
        }

        res.status(200).json({ message: "Profile updated successfully" });
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile", error });
      }
    });

    // Publishers Related API
    app.post("/publishers", async (req, res) => {
      const publisher = req.body;
      const result = await publisherCollection.insertOne(publisher);
      res.send(result);
    });

    app.get("/publishers", async (req, res) => {
      const publishers = await publisherCollection.find().toArray();
      res.send(publishers);
    });

    // app.get("/articles", async (req, res) => {
    //   const articles = await articleCollection.find().toArray();
    //   res.send(articles);
    // });

    // Get All Approved Articles with Search and Filter
    // app.get("/articles", async (req, res) => {
    //   const {
    //     page = 1,
    //     limit = 6,
    //     search = "",
    //     publisher = "",
    //     tags = "",
    //   } = req.query;

    //   const query = {
    //     status: "Approved", // Fetch only approved articles
    //     ...(search && { title: { $regex: search, $options: "i" } }),
    //     ...(publisher && { publisher: { $regex: publisher, $options: "i" } }),
    //     ...(tags && { tags: { $in: tags.split(",") } }), // Assumes tags are stored as arrays
    //   };

    //   const articles = await articleCollection
    //     .find(query)
    //     .skip((page - 1) * limit)
    //     .limit(parseInt(limit))
    //     .toArray();

    //   const total = await articleCollection.countDocuments(query);

    //   res.send({ articles, total });
    // });

    app.get("/articles", async (req, res) => {
      const {
        page = 1,
        limit = 6,
        search = "",
        publisher = "",
        tags = "",
      } = req.query;

      // Build the query
      const query = {
        status: "approved", // Only fetch approved articles
        ...(search && { title: { $regex: search, $options: "i" } }), // Case-insensitive search
        ...(publisher && { "publisher.publisherName": publisher }),
        ...(tags && { tags: { $in: tags.split(",") } }), // Match any tag
      };

      try {
        const total = await articleCollection.countDocuments(query);
        const articles = await articleCollection
          .find(query)
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .toArray();

        res.status(200).json({ articles, total });
      } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // app.get("/articles", async (req, res) => {
    //   const {
    //     page = 1,
    //     limit = 6,
    //     search = "",
    //     publisher = "",
    //     tags = "",
    //     myArticles = false, // New flag to filter logged-in user's articles
    //   } = req.query;

    //   // Build the query
    //   const query = {
    //     status: "approved", // Only fetch approved articles
    //     ...(search && { title: { $regex: search, $options: "i" } }), // Case-insensitive search
    //     ...(publisher && { "publisher.publisherName": publisher }), // Match publisher
    //     ...(tags && { tags: { $in: tags.split(",") } }), // Match tags
    //     ...(myArticles === "true" && { "author.email": req.decoded.email }), // Match logged-in user's email
    //   };

    //   try {
    //     const total = await articleCollection.countDocuments(query);
    //     const articles = await articleCollection
    //       .find(query)
    //       .skip((page - 1) * limit)
    //       .limit(parseInt(limit))
    //       .toArray();

    //     res.status(200).json({ articles, total });
    //   } catch (error) {
    //     console.error("Error fetching articles:", error);
    //     res.status(500).json({ message: "Internal server error" });
    //   }
    // });

    /**
     * GET /myArticles
     * Fetch all articles created by the current user.
     */
    app.get("/myArticles", async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ message: "User email is required." });
      }

      try {
        const articles = await articleCollection
          .find({ "author.email": email })
          .toArray();

        res.status(200).json(articles);
      } catch (error) {
        console.error("Error fetching user articles:", error);
        res.status(500).json({ message: "Failed to fetch user articles." });
      }
    });

    /**
     * DELETE /articles/:id
     * Delete an article by ID.
     */
    app.delete("/articles/:id", async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid article ID." });
      }

      try {
        const result = await articleCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Article not found." });
        }

        res.status(200).json({ message: "Article deleted successfully." });
      } catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).json({ message: "Failed to delete the article." });
      }
    });

    // app.get("/articles/:id", async (req, res) => {
    //   const { id } = req.params;
    //   try {
    //     const article = await articleCollection.findOne({
    //       _id: new ObjectId(id),
    //     });
    //     if (!article)
    //       return res.status(404).json({ message: "Article not found" });
    //     res.status(200).json(article);
    //   } catch (error) {
    //     res.status(500).json({ message: "Failed to fetch article" });
    //   }
    // });

    // app.put("/articles/:id", async (req, res) => {
    //   const { id } = req.params;
    //   const updatedData = req.body;

    //   try {
    //     const result = await articleCollection.updateOne(
    //       { _id: new ObjectId(id) },
    //       { $set: updatedData }
    //     );

    //     if (result.modifiedCount === 0) {
    //       return res.status(404).json({ message: "Article not found" });
    //     }

    //     res.status(200).json({ message: "Article updated successfully" });
    //   } catch (error) {
    //     res.status(500).json({ message: "Failed to update article" });
    //   }
    // });

    app.put("/articles/:id", async (req, res) => {
      const { id } = req.params;
      const updatedArticle = req.body;

      try {
        const result = await articleCollection.updateOne(
          { _id: new ObjectId(id) }, // Ensure _id is converted to ObjectId
          { $set: updatedArticle } // Update with new values
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Article not found" });
        }

        res.status(200).json({ message: "Article updated successfully" });
      } catch (error) {
        console.error("Error updating article:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });




    


    app.get("/articles/:id", async (req, res) => {
      const { id } = req.params;

      try {
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid Article ID" });
        }

        const article = await articleCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!article) {
          return res.status(404).json({ message: "Article not found" });
        }

        res.status(200).json(article);
      } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.patch("/articles/:id/view", async (req, res) => {
      const { id } = req.params;

      try {
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid Article ID" });
        }

        const result = await articleCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { views: 1 } } // Increment the view count by 1
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Article not found" });
        }

        res.status(200).json({ message: "View count updated successfully" });
      } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/articles", async (req, res) => {
      const article = req.body;
      const result = await articleCollection.insertOne(article);
      res.send(result);
    });

    app.get("/adminArticles", async (req, res) => {
      const result = await articleCollection.find().toArray();
      res.send(result);
    });

    // Pagination for Admin Articles: Fetch paginated articles for the admin route.
    // app.get("/articles/admin", async (req, res) => {
    //   const { page = 1, limit = 6 } = req.query;

    //   const articles = await articleCollection
    //     .find()
    //     .skip((page - 1) * limit)
    //     .limit(parseInt(limit))
    //     .toArray();

    //   const total = await articleCollection.countDocuments();

    //   res.send({ articles, total });
    // });

    // Approve Article
    app.patch("/articles/approve/:id", async (req, res) => {
      const id = req.params.id;
      const result = await articleCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "approved" } }
      );
      res.send(result);
    });

    // Decline Article with Reason
    app.patch("/articles/decline/:id", async (req, res) => {
      const id = req.params.id;
      const { reason } = req.body;

      const result = await articleCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "declined", declineReason: reason } }
      );

      res.send(result);
    });

    // Delete Article
    app.delete("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const result = await articleCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Set Premium
    app.patch("/articles/premium/:id", async (req, res) => {
      const id = req.params.id;

      const result = await articleCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isPremium: true } }
      );

      res.send(result);
    });

    app.get("/premium-articles", async (req, res) => {
      try {
        const premiumArticles = await articleCollection
          .find({ status: "approved", isPremium: true })
          .toArray();

        res.status(200).json(premiumArticles);
      } catch (error) {
        console.error("Error fetching premium articles:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // app.get("/articles", async (req, res) => {
    //   const { search, publisher, tags, page = 1, limit = 6 } = req.query;

    //   const query = {
    //     ...(search && { title: { $regex: search, $options: "i" } }),
    //     ...(publisher && { publisher }),
    //     ...(tags && { tags: { $in: tags.split(",") } }),
    //     status: "approved",
    //   };

    //   const articles = await articleCollection
    //     .find(query)
    //     .skip((page - 1) * limit)
    //     .limit(parseInt(limit))
    //     .toArray();

    //   const total = await articleCollection.countDocuments(query);

    //   res.send({ articles, total });
    // });

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
