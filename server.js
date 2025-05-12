const bcrypt = require('bcrypt');
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const QRCode = require("qrcode");
const app = express();
const session = require("express-session");
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = process.env.PORT || 4000;
// After app.use(session(...))
app.use(session({
    secret: "aj93Hk2Lw0iQx#z!Y@82lMn01",
    resave: false,
    saveUninitialized: false
}));

// MongoDB Connection
const MONGO_URI = "mongodb+srv://project701379:6hZsIzc81F8R5uzu@clusternew.snn8v.mongodb.net/fundraising_db?retryWrites=true&w=majority&appName=ClusterNew";
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Failed:", err));

// Define Recipient Schema
// Define User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

// Define Recipient Schema
const RecipientSchema = new mongoose.Schema({
    name: String,
    medical_condition: String,
    hospital_name: String,
    document_url: String,
    upi_id: String, 
    verified: { type: Boolean, default: false }
});
const Recipient = mongoose.model("Recipient", RecipientSchema);

// GET: Signup Form
app.get("/signup", (req, res) => {
    res.send(`
        <html>
        <head><title>Sign Up</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background: linear-gradient(to right, #ff7e5f, #feb47b);
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                text-align: center;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
                width: 400px;
                text-align: center;
            }
            h1 {
                color: #3498db;
                margin-bottom: 20px;
            }
            h2 {
                font-size: 36px;
                color: #ffffff;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .title {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 40px;
                color: #fff;
                text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.3);
                font-family: 'Roboto', sans-serif;
                letter-spacing: 3px;
            }
            input {
                width: 80%;
                padding: 10px;
                margin: 10px 0;
                border-radius: 5px;
                border: 1px solid #ccc;
            }
            button {
                background-color: #3498db;
                color: white;
                padding: 12px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                width: 80%;
                margin-top: 10px;
            }
            button:hover {
                background-color: #2980b9;
            }
            p {
                margin-top: 20px;
                color: #666;
            }
            a {
                color: #3498db;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
        </head>
        <body>
            <div class="title"><strong>
                Welcome to Fund: Peer 2 Peer Fundraising App
            <strong></div>
            <div class="container">
                <h1>Create an Account</h1>
                <form action="/signup" method="POST">
                    <input type="text" name="username" placeholder="Username" required><br>
                    <input type="password" name="password" placeholder="Password" required><br>
                    <button type="submit">Sign Up</button>
                </form>
                <p>Already have an account? <a href="/login">Login</a></p>
            </div>
        </body>
        </html>
    `);
});


// POST: Handle Signup
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    // Make sure to check if username and password are correctly received
    console.log(username, password);

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.send("User already exists. <a href='/login'>Login</a>");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    req.session.userId = newUser._id;
    res.redirect("/");
});

// GET: Login Form
app.get("/login", (req, res) => {
    res.send(`
        <html>
        <head><title>Login</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background: linear-gradient(to right, #ff7e5f, #feb47b);
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                text-align: center;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
                width: 400px;
                text-align: center;
            }
            h1 {
                color: #3498db;
                margin-bottom: 20px;
            }
            h2 {
                font-size: 36px;
                color: #ffffff;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .title {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 40px;
                color: #fff;
                text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.3);
                font-family: 'Roboto', sans-serif;
                letter-spacing: 3px;
            }
            input {
                width: 80%;
                padding: 10px;
                margin: 10px 0;
                border-radius: 5px;
                border: 1px solid #ccc;
            }
            button {
                background-color: #3498db;
                color: white;
                padding: 12px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                width: 80%;
                margin-top: 10px;
            }
            button:hover {
                background-color: #2980b9;
            }
            p {
                margin-top: 20px;
                color: #666;
            }
            a {
                color: #3498db;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
        </head>
        <body>
            <div class="title"><strong>
                Welcome to Fund: Peer 2 Peer Fundraising App
            <strong> </div>
            <div class="container">
                <h1>Login to Your Account</h1>
                <form action="/login" method="POST">
                    <input type="text" name="username" placeholder="Username" required><br>
                    <input type="password" name="password" placeholder="Password" required><br>
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <a href="/signup">Sign Up</a></p>
            </div>
        </body>
        </html>
    `);
});


// POST: Handle Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.send("User not found. <a href='/signup'>Sign up</a>");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.send("Incorrect password. <a href='/login'>Try again</a>");
    }

    req.session.userId = user._id;
    res.redirect("/");
});

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.redirect("/login");
};

// Home Page
app.get("/", isAuthenticated, (req, res) => {

    res.send(`
        <html>
        <head>
            <title>Fundraising Platform</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; background: linear-gradient(to right, #ff7e5f, #feb47b); color: white; }
                .container { max-width: 500px; margin: 50px auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); color: black; }
                button { background: #3498db; color: white; padding: 10px; border: none; cursor: pointer; border-radius: 5px; margin: 10px; }
                input { display: block; width: 90%; padding: 10px; margin: 10px auto; border-radius: 5px; border: 1px solid #ddd; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to Emergency Medical Fundraising</h1>
                <button onclick="window.location.href='/donate'">I'm a Donor</button>
                <button onclick="showRecipientForm()">I'm a Recipient</button>
                <div id="recipientForm" style="display:none;">
                    <h2>Recipient Verification</h2>
                    <label>Full Name</label>
                    <input type="text" id="name">
                    <label>Medical Condition</label>
                    <input type="text" id="medical_condition">
                    <label>Hospital Name</label>
                    <input type="text" id="hospital_name">
                    <label>Document URL</label>
                    <input type="text" id="document_url">
                    <button type="button" onclick="verifyDocument()">Verify Document</button>
    
                     <div id="verificationMessage"></div>
    
                    <!-- Only show this section if document is verified -->
                     <div id="upiSection" style="display: none;">
                      <input type="text" id="upi_id" placeholder="Enter UPI ID" required>
                        <button type="button" onclick="submitForm()">Submit</button>
                       </div>
                </div>
            </div>
            <script>
                function showRecipientForm() {
                    document.getElementById("recipientForm").style.display = "block";
                }
                async function verifyRecipient() {
                    const name = document.getElementById("name").value;
                    const medical_condition = document.getElementById("medical_condition").value;
                    const hospital_name = document.getElementById("hospital_name").value;
                    const document_url = document.getElementById("document_url").value;
                    const upi_id = document.getElementById("upi_id").value;

                    const response = await fetch("/verify-recipient", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, medical_condition, hospital_name, document_url,upi_id })
                    });
                    const result = await response.json();
                    document.getElementById("verificationMessage").innerText = result.message || result.error;
                }
            </script>
        </body>
        </html>
    `);
});

// Show verified recipients
app.get("/donate", async (req, res) => {
    try {
        const recipients = await Recipient.find({ verified: true });

        if (recipients.length === 0) {
            return res.send("<h2>No verified recipients available for donation.</h2>");
        }

        let recipientListHTML = `
            <html>
            <head>
                <title>Choose Recipient</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; background: linear-gradient(to right, #ff7e5f, #feb47b); color: white; }
                    .container { max-width: 600px; margin: 50px auto; background: white; padding: 20px; border-radius: 10px; color: black; }
                    .recipient-card { padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 10px 0; text-align: left; }
                    button { background: #3498db; color: white; padding: 8px; border: none; cursor: pointer; border-radius: 5px; }
                </style>
            </head>
            <body>
                        <div class="container">
    <h1>Select a Recipient to Donate</h1>
    ${recipients.map(r => `
        <div class="recipient-card">
            <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${r.name}</span>
            </div><br>
            <div class="info-row">
                <span class="label">Condition:</span>
                <span class="value">${r.medical_condition}</span>
            </div><br>
            <div class="info-row">
                <span class="label">Hospital:</span>
                <span class="value">${r.hospital_name}</span>
            </div><br>
            <div class="info-row">
                <span class="label">upi_id:</span>
                <span class="value">${r.upi_id}</span>
            </div><br>
            <button onclick="window.location.href='/donate/${r._id}'">Donate</button>
        </div>
    `).join("")}
</div>


            </body>
            </html>
        `;
        res.send(recipientListHTML);
    } catch (error) {
        console.error("❌ Error fetching recipients:", error);
        res.status(500).send("<h2>Internal Server Error</h2>");
    }
});

// Donate to a specific recipient
// const QRCode = require('qrcode');
app.get("/donate/:id", async (req, res) => {
    try {
        const recipient = await Recipient.findById(req.params.id);
        if (!recipient) return res.send("<h2>Recipient not found.</h2>");

        const upi_id = recipient.upi_id; // Make sure this field exists in your schema
        const name = recipient.name;

        const upiLink = `upi://pay?pa=${upi_id}&pn=${encodeURIComponent(name)}&mc=0000&tid=1234567890&url=https://donate.com`;  // Add necessary UPI parameters

        const qrCodeUrl = await QRCode.toDataURL(upiLink);

        res.send(`
            <html>
            <head>
                <title>Donate Now</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; background: #f5f7fa; }
                    .container { max-width: 400px; margin: 50px auto; background: white; padding: 20px; border-radius: 10px; }
                    button { background: #2ecc71; color: white; padding: 10px; border: none; cursor: pointer; border-radius: 5px; }
                    img { margin: 20px 0; width: 200px; height: 200px; }
                    .receipt { text-align: left; background: #eee; padding: 10px; border-radius: 5px; margin-top: 20px; }
                    a { color: #2980b9; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Donate to Help ${name}</h1>
                    <p>Scan this QR code in your UPI app to send money:</p>
                    <img src="${qrCodeUrl}" alt="UPI QR Code">
                    

                    <div class="receipt">
                        <h3>Recipient Verification Receipt</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Medical Condition:</strong> ${recipient.medical_condition}</p>
                        <p><strong>Hospital:</strong> ${recipient.hospital_name}</p>
                        <hr>
                       <h3>📣 Share This Cause</h3>
                       <p>You can help even more by sharing this urgent request with your friends.</p>

                        <a href="https://wa.me/?text=${encodeURIComponent(
                       `🚨 Urgent Help Needed! 🚨\n\nPlease support ${name}, who is currently battling ${recipient.medical_condition}.\nHospital: ${recipient.hospital_name}\n\nYou can donate directly using the link below:\nhttp://localhost:4000/donate/${recipient.upi_id}\nEvery contribution counts! 🙏`
                        )}" target="_blank">Share on WhatsApp</a><br><br>

                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
                         `Support ${name} (Hospital: ${recipient.hospital_name}) who urgently needs help for ${recipient.medical_condition}. Donate now: http://localhost:4000/donate/${recipient.upi_id}`
                          )}" target="_blank">Share on Twitter</a><br><br>

                         <a href="https://www.facebook.com/sharer/sharer.php?u=http://localhost:4000/donate/${recipient.upi_id}&quote=${encodeURIComponent(
                              `Urgent Fundraiser!\nSupport ${name} (${recipient.medical_condition}) at ${recipient.hospital_name}. Your donation can save a life!`
                            )}" target="_blank">Share on Facebook</a>

                        <p><strong>UPI ID:</strong> ${upi_id}</p>
                        <p><strong>Document URL:</strong> <a href="${recipient.document_url}" target="_blank">View Document</a></p>
                    </div>
                    <p><button onclick="window.print()">Download Receipt</button></p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("❌ Error fetching recipient:", error);
        res.status(500).send("<h2>Internal Server Error</h2>");
    }
});


// Verify Recipient
app.post("/verify-recipient", async (req, res) => {
    try {
        const { name, medical_condition, hospital_name, document_url, upi_id } = req.body;  // Capture UPI ID
        if (!name || !medical_condition || !hospital_name || !document_url || !upi_id) {  // Check for UPI ID
            return res.status(400).json({ error: "❌ Missing required fields" });
        }

        const existing = await Recipient.findOne({ name, hospital_name });
        if (existing) {
            return res.status(200).json({ message: "✅ Recipient is already verified!" });
        }

        const newRecipient = new Recipient({
            name, medical_condition, hospital_name, document_url, upi_id, verified: true  // Store UPI ID
        });
        await newRecipient.save();
        res.status(201).json({ message: "✅ Verification Successful!" });
    } catch (error) {
        console.error("❌ Error verifying recipient:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});



