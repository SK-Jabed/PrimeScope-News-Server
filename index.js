require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const cron = require("node-cron");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
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

// Use verify Admin for Admin Verification
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
    const subscriptionCollection = db.collection("subscriptions");

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
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // Get a particular user's data by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;

      if (!email) {
        return res
          .status(400)
          .send({ success: false, message: "Email is required" });
      }

      try {
        const query = { email: email };
        const user = await userCollection.findOne(query);

        if (!user) {
          return res
            .status(404)
            .send({ success: false, message: "User not found" });
        }

        res.send({ success: true, user });
      } catch (error) {
        console.error("Error fetching user by email:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      }
    });

    // Get Admin Data from Database
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Forbidden access" });
      }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    // Update User Role from User to Admin
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

    // Get User Data for Profile
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

    // Update Profile Data for Users
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

    // Add Publisher in The Database
    app.post("/publishers", async (req, res) => {
      const publisher = req.body;
      const result = await publisherCollection.insertOne(publisher);
      res.send(result);
    });

    // Get Publishers Data from Database
    app.get("/publishers", async (req, res) => {
      const publishers = await publisherCollection.find().toArray();
      res.send(publishers);
    });

    app.get("/trending-articles", async (req, res) => {
      try {
        const articles = await articleCollection
          .find({ status: "approved" })
          .sort({ views: -1 })
          .limit(6)
          .toArray(); // Convert BSON to plain JS objects

        res.status(200).json(articles);
      } catch (error) {
        console.error("Error fetching trending articles:", error);
        res.status(500).json({ message: "Failed to fetch trending articles" });
      }
    });

    app.get("/articles", async (req, res) => {
      const { search = "", publisher = "", tags = "" } = req.query;

      const query = {
        status: "approved",
        ...(search && { title: { $regex: search, $options: "i" } }),
        ...(publisher && { "publisher.publisherName": publisher }),
        ...(tags && { tags: { $in: tags.split(",") } }),
      };

      try {
        const articles = await articleCollection.find(query).toArray();
        res.status(200).json({ articles });
      } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/allArticles", async (req, res) => {
      const articles = await articleCollection.find().toArray();
      res.send(articles);
    });

    // GET all articles created by the current user
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

    // Delete an Article by its Id
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

    // Update an Article Data by its Id
    app.patch("/articles/:id", async (req, res) => {
      const { id } = req.params;
      const updatedArticle = req.body;

      try {
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid Article ID" });
        }

        // Remove _id from the update payload if it exists
        delete updatedArticle._id;

        const result = await articleCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedArticle }
        );

        res.status(200).json({
          message: "Update operation completed",
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        });
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

    app.put("/articles/:id/view", async (req, res) => {
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

    // Add Article (with Limit Post Logic)
    app.post("/articles", async (req, res) => {
      const { author, ...articleData } = req.body;

      try {
        // Fetch the user's details from the database to check if they are premium
        const user = await userCollection.findOne({ email: author.email });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found. Please log in to continue.",
          });
        }

        // Check if the user is not premium
        if (!user.isPremium) {
          // Check if the user has already posted an article
          const existingArticle = await articleCollection.findOne({
            "author.email": author.email,
          });

          if (existingArticle) {
            return res.status(403).json({
              success: false,
              message:
                "Normal users can only publish one article. Upgrade to premium to post more.",
            });
          }
        }

        // Insert the new article
        const result = await articleCollection.insertOne({
          ...articleData,
          author,
          declineReason: null, // Initially null
          isPremium: false, // Initially not premium
          postedDate: new Date().toISOString(),
          status: "pending", // Default status
          views: 0, // Default view count
        });

        res.status(201).json({
          success: true,
          message: "Article submitted successfully!",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding article:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error. Please try again later.",
        });
      }
    });

    app.get("/adminArticles", async (req, res) => {
      const result = await articleCollection.find().toArray();
      res.send(result);
    });

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

    // Delete an Article from Database
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

    // Create Payment Intent (POST Operation)
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, "Inside the payment intent");

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/subscriptions", async (req, res) => {
      const subscription = req.body;

      const subscriptionResult = await subscriptionCollection.insertOne(
        subscription
      );

      res.send(subscriptionResult);
    });

    app.patch("/users/:email", async (req, res) => {
      const { email } = req.params;
      const { premiumTaken, isPremium, premiumPeriodDays } = req.body;

      const premiumExpiration = new Date(
        new Date(premiumTaken).getTime() +
          premiumPeriodDays * 24 * 60 * 60 * 1000
      );

      const updateResult = await userCollection.updateOne(
        { email },
        {
          $set: {
            premiumTaken,
            premiumExpiration,
            isPremium,
          },
        }
      );

      res.send(updateResult);
    });

    cron.schedule("0 0 * * *", async () => {
      try {
        const currentTime = new Date();

        // Find users whose premium subscription has expired
        const expiredUsers = await userCollection
          .find({ premiumExpiration: { $lt: currentTime } })
          .toArray();

        if (expiredUsers.length > 0) {
          const expiredUserIds = expiredUsers.map((user) => user._id);

          // Reset premium status for expired users
          const result = await userCollection.updateMany(
            { _id: { $in: expiredUserIds } },
            {
              $set: { isPremium: false },
              $unset: { premiumTaken: "", premiumExpiration: "" },
            }
          );

          console.log(
            `Premium status reset for ${result.modifiedCount} expired users.`
          );
        } else {
          console.log("No expired premium users found.");
        }
      } catch (error) {
        console.error("Error handling expired users:", error);
      }
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
