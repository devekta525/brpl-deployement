const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./model/user.model');
const Payment = require('./model/payment.model');
require('dotenv').config();

// CORRECT DB URI from server.js / .env
const dbURI = "mongodb+srv://brpl-dev-write:YnJwbC1kZXYtd3JpdGU@brpl-dev.nj1umik.mongodb.net/brpl";

async function createAbhishekDalalUser() {
    try {
        await mongoose.connect(dbURI);
        console.log("Connected to MongoDB (Correct Cluster)");

        const userData = {
            fname: "Abhishek",
            lname: "Dalal",
            email: "dalal.abhishek22@gmail.com",
            mobile: "7042418592",
            city: "Rohtak",
            state: "Haryana",
            playerRole: "All Rounder",
            isPaid: true,
            isFromLandingPage: true,
            paymentAmount: 1499,
            paymentId: "395017047724",
            conversionType: 'none',
            country: "India"
        };

        const passwordPlain = "Abhishek@123";

        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { email: userData.email.toLowerCase() },
                { mobile: userData.mobile }
            ]
        });

        if (user) {
            console.log(`User already exists: ${user.email} (${user.mobile})`);
            console.log("Updating user details...");

            // Update fields
            user.fname = userData.fname;
            user.lname = userData.lname;
            user.email = userData.email.toLowerCase();
            user.mobile = userData.mobile;
            user.isPaid = userData.isPaid;
            user.isFromLandingPage = userData.isFromLandingPage;
            user.paymentAmount = userData.paymentAmount;
            user.paymentId = userData.paymentId;
            user.city = userData.city;
            user.state = userData.state;
            user.playerRole = userData.playerRole;

            // Re-hash password to be sure it matches what we expect
            const hashedPassword = await bcrypt.hash(passwordPlain, 10);
            user.password = hashedPassword;

            const savedUser = await user.save();
            console.log("User updated successfully:", savedUser._id);
        } else {
            console.log("Creating new user...");
            const hashedPassword = await bcrypt.hash(passwordPlain, 10);

            user = new User({
                ...userData,
                password: hashedPassword
            });

            const savedUser = await user.save();
            console.log("User created successfully with ID:", savedUser._id);
        }

        // Create or Update Payment Record
        const existingPayment = await Payment.findOne({ transactionId: userData.paymentId });
        if (existingPayment) {
            console.log("Payment record already exists for Transaction ID:", userData.paymentId);
            if (existingPayment.userId.toString() !== user._id.toString()) {
                console.log("WARNING: Payment record linked to different user! Updating to current user.");
                existingPayment.userId = user._id;
                await existingPayment.save();
            }
        } else {
            const newPayment = new Payment({
                userId: user._id,
                transactionId: userData.paymentId,
                amount: userData.paymentAmount,
                type: 'registration',
                status: 'completed',
                paymentGateway: 'manual_upi'
            });

            const savedPayment = await newPayment.save();
            console.log("Payment record created successfully with ID:", savedPayment._id);
        }

        process.exit(0);
    } catch (err) {
        console.error("Error creating/updating user:", err);
        process.exit(1);
    }
}

createAbhishekDalalUser();
