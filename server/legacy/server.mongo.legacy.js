// // server.js - Main server file
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// const crypto = require("crypto");
// const rateLimit = require("express-rate-limit");
// const helmet = require("helmet");
// const morgan = require("morgan");
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(helmet()); // Security headers
// app.use(morgan("combined")); // Logging
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
//   })
// );
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // Rate limiting
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit each IP to 5 requests per windowMs for auth routes
//   message: {
//     success: false,
//     message: "बहुत अधिक प्रयास। कृपया 15 मिनट बाद पुनः प्रयास करें।",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // MongoDB Connection
// mongoose.connect(
//   process.env.MONGODB_URI || "mongodb://localhost:27017/arya-pathshala",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// );

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", () => {
//   console.log("✅ MongoDB connected successfully");
// });

// // User Schema
// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "नाम आवश्यक है"],
//       trim: true,
//       minlength: [2, "नाम कम से कम 2 अक्षरों का होना चाहिए"],
//       maxlength: [50, "नाम 50 अक्षरों से अधिक नहीं हो सकता"],
//     },
//     email: {
//       type: String,
//       required: [true, "ई-मेल आवश्यक है"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [
//         /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//         "कृपया वैध ई-मेल पता दर्ज करें",
//       ],
//     },
//     phone: {
//       type: String,
//       required: [true, "फोन नंबर आवश्यक है"],
//       trim: true,
//       match: [/^[6-9]\d{9}$/, "कृपया वैध भारतीय मोबाइल नंबर दर्ज करें"],
//     },
//     password: {
//       type: String,
//       required: [true, "पासवर्ड आवश्यक है"],
//       minlength: [6, "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए"],
//     },
//     role: {
//       type: String,
//       enum: ["student", "teacher", "admin"],
//       default: "student",
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     verificationToken: String,
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
//     loginAttempts: {
//       type: Number,
//       default: 0,
//     },
//     lockUntil: Date,
//     lastLogin: Date,
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Virtual for account lock status
// userSchema.virtual("isLocked").get(function () {
//   return !!(this.lockUntil && this.lockUntil > Date.now());
// });

// // Pre-save middleware for password hashing
// userSchema.pre("save", async function (next) {
//   // Only hash password if it has been modified
//   if (!this.isModified("password")) return next();

//   try {
//     // Hash password with cost of 12
//     const hashedPassword = await bcrypt.hash(this.password, 12);
//     this.password = hashedPassword;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Method to compare password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   if (this.isLocked) {
//     throw new Error(
//       "खाता अस्थायी रूप से लॉक है। कृपया बाद में पुनः प्रयास करें।"
//     );
//   }

//   const isMatch = await bcrypt.compare(candidatePassword, this.password);

//   if (isMatch) {
//     // Reset login attempts and remove lock if password is correct
//     if (this.loginAttempts || this.lockUntil) {
//       this.loginAttempts = 0;
//       this.lockUntil = undefined;
//       this.lastLogin = new Date();
//       await this.save();
//     }
//     return true;
//   } else {
//     // Increment login attempts
//     this.loginAttempts += 1;

//     // Lock account after 5 failed attempts for 30 minutes
//     if (this.loginAttempts >= 5) {
//       this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
//     }

//     await this.save();
//     return false;
//   }
// };

// // Method to generate JWT token
// userSchema.methods.generateAuthToken = function () {
//   const token = jwt.sign(
//     {
//       userId: this._id,
//       email: this.email,
//       role: this.role,
//     },
//     process.env.JWT_SECRET || "arya-pathshala-secret-key",
//     {
//       expiresIn: process.env.JWT_EXPIRE || "7d",
//     }
//   );
//   return token;
// };

// const User = mongoose.model("User", userSchema);

// // Email Configuration
// const emailTransporter = nodemailer.createTransporter({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Utility function to send emails
// const sendEmail = async (options) => {
//   try {
//     const mailOptions = {
//       from: `आर्य पाठशाला <${process.env.EMAIL_USER}>`,
//       to: options.to,
//       subject: options.subject,
//       html: options.html,
//     };

//     await emailTransporter.sendMail(mailOptions);
//     console.log("📧 Email sent successfully to:", options.to);
//   } catch (error) {
//     console.error("❌ Email sending failed:", error);
//     throw new Error("ई-मेल भेजने में त्रुटि");
//   }
// };

// // Email Templates
// const getVerificationEmailTemplate = (name, verificationToken) => {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <title>आर्य पाठशाला - खाता सत्यापन</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #fdeaa8, #faf4e6); padding: 20px;">
//       <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(199, 54, 89, 0.1); overflow: hidden;">
//         <div style="background: linear-gradient(90deg, #c73659, #d4af37, #a8c66c); height: 5px;"></div>
//         <div style="padding: 40px;">
//           <div style="text-align: center; margin-bottom: 30px;">
//             <div style="width: 80px; height: 80px; background: #d4af37; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 20px;">🕉️</div>
//             <h1 style="color: #c73659; font-size: 28px; margin: 0;">आर्य पाठशाला</h1>
//             <p style="color: #b22222; font-size: 16px; margin: 10px 0 0 0;">शास्त्र ज्ञान एवं आध्यात्म का केंद्र</p>
//           </div>

//           <h2 style="color: #2e2e2e; margin-bottom: 20px;">नमस्ते ${name},</h2>

//           <p style="color: #2e2e2e; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
//             आर्य पाठशाला में आपका स्वागत है! कृपया अपने खाते को सत्यापित करने के लिए नीचे दिए गए बटन पर क्लिक करें:
//           </p>

//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}"
//                style="background: linear-gradient(135deg, #c73659, #b22222); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px;">
//               खाता सत्यापित करें
//             </a>
//           </div>

//           <p style="color: #666; font-size: 14px; line-height: 1.6;">
//             यदि आपने यह खाता नहीं बनाया है, तो कृपया इस ई-मेल को अनदेखा करें।<br>
//             यह लिंक 24 घंटे में समाप्त हो जाएगा।
//           </p>

//           <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

//           <p style="color: #999; font-size: 12px; text-align: center;">
//             © 2025 आर्य पाठशाला। सर्वाधिकार सुरक्षित।
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// const getPasswordResetEmailTemplate = (name, resetToken) => {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <title>आर्य पाठशाला - पासवर्ड रीसेट</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #fdeaa8, #faf4e6); padding: 20px;">
//       <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(199, 54, 89, 0.1); overflow: hidden;">
//         <div style="background: linear-gradient(90deg, #c73659, #d4af37, #a8c66c); height: 5px;"></div>
//         <div style="padding: 40px;">
//           <div style="text-align: center; margin-bottom: 30px;">
//             <div style="width: 80px; height: 80px; background: #d4af37; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 20px;">🕉️</div>
//             <h1 style="color: #c73659; font-size: 28px; margin: 0;">आर्य पाठशाला</h1>
//             <p style="color: #b22222; font-size: 16px; margin: 10px 0 0 0;">पासवर्ड रीसेट अनुरोध</p>
//           </div>

//           <h2 style="color: #2e2e2e; margin-bottom: 20px;">नमस्ते ${name},</h2>

//           <p style="color: #2e2e2e; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
//             आपने अपने आर्य पाठशाला खाते के लिए पासवर्ड रीसेट का अनुरोध किया है। कृपया नीचे दिए गए बटन पर क्लिक करें:
//           </p>

//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}"
//                style="background: linear-gradient(135deg, #c73659, #b22222); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px;">
//               नया पासवर्ड सेट करें
//             </a>
//           </div>

//           <p style="color: #666; font-size: 14px; line-height: 1.6;">
//             यदि आपने यह अनुरोध नहीं किया है, तो कृपया इस ई-मेल को अनदेखा करें।<br>
//             यह लिंक 1 घंटे में समाप्त हो जाएगा।
//           </p>

//           <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

//           <p style="color: #999; font-size: 12px; text-align: center;">
//             © 2025 आर्य पाठशाला। सर्वाधिकार सुरक्षित।
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// // Auth Middleware
// const authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "पहुंच टोकन आवश्यक है",
//       });
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || "arya-pathshala-secret-key"
//     );
//     const user = await User.findById(decoded.userId).select("-password");

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "अवैध टोकन",
//       });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     return res.status(403).json({
//       success: false,
//       message: "टोकन सत्यापन विफल",
//     });
//   }
// };

// // Routes

// // Health Check
// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "आर्य पाठशाला API चालू है",
//     timestamp: new Date().toISOString(),
//     version: "1.0.0",
//   });
// });

// // User Registration
// app.post("/api/auth/register", authLimiter, async (req, res) => {
//   try {
//     const { name, email, phone, password, confirmPassword } = req.body;

//     // Validation
//     if (!name || !email || !phone || !password || !confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "सभी फील्ड आवश्यक हैं",
//       });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "पासवर्ड मेल नहीं खाते",
//       });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
//       });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({
//       $or: [{ email }, { phone }],
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message:
//           existingUser.email === email
//             ? "यह ई-मेल पहले से पंजीकृत है"
//             : "यह फोन नंबर पहले से पंजीकृत है",
//       });
//     }

//     // Generate verification token
//     const verificationToken = crypto.randomBytes(32).toString("hex");

//     // Create new user
//     const user = new User({
//       name,
//       email,
//       phone,
//       password,
//       verificationToken,
//     });

//     await user.save();

//     // Send verification email
//     if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
//       await sendEmail({
//         to: email,
//         subject: "आर्य पाठशाला - खाता सत्यापन",
//         html: getVerificationEmailTemplate(name, verificationToken),
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: "पंजीकरण सफल! कृपया अपने ई-मेल की जाँच करें।",
//       data: {
//         userId: user._id,
//         name: user.name,
//         email: user.email,
//         isVerified: user.isVerified,
//       },
//     });
//   } catch (error) {
//     console.error("Registration error:", error);

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         message: messages[0] || "डेटा सत्यापन त्रुटि",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।",
//     });
//   }
// });

// // User Login
// app.post("/api/auth/login", authLimiter, async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "ई-मेल और पासवर्ड आवश्यक हैं",
//       });
//     }

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "अवैध ई-मेल या पासवर्ड",
//       });
//     }

//     // Check if account is locked
//     if (user.isLocked) {
//       return res.status(423).json({
//         success: false,
//         message:
//           "खाता अस्थायी रूप से लॉक है। कृपया 30 मिनट बाद पुनः प्रयास करें।",
//       });
//     }

//     // Verify password
//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: "अवैध ई-मेल या पासवर्ड",
//       });
//     }

//     // Check if email is verified
//     if (!user.isVerified) {
//       return res.status(401).json({
//         success: false,
//         message: "कृपया पहले अपने ई-मेल को सत्यापित करें",
//       });
//     }

//     // Generate token
//     const token = user.generateAuthToken();

//     res.json({
//       success: true,
//       message: "सफलतापूर्वक लॉग इन हो गए!",
//       data: {
//         token,
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           phone: user.phone,
//           role: user.role,
//           isVerified: user.isVerified,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।",
//     });
//   }
// });

// // Email Verification
// app.post("/api/auth/verify-email", async (req, res) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: "सत्यापन टोकन आवश्यक है",
//       });
//     }

//     const user = await User.findOne({ verificationToken: token });
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "अवैध या समाप्त सत्यापन टोकन",
//       });
//     }

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     await user.save();

//     res.json({
//       success: true,
//       message: "ई-मेल सफलतापूर्वक सत्यापित हो गया!",
//     });
//   } catch (error) {
//     console.error("Email verification error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।",
//     });
//   }
// });

// // Forgot Password
// app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "ई-मेल आवश्यक है",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       // Don't reveal that user doesn't exist
//       return res.json({
//         success: true,
//         message: "यदि यह ई-मेल पंजीकृत है, तो आपको रीसेट लिंक मिलेगा।",
//       });
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
//     await user.save();

//     // Send reset email
//     if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
//       await sendEmail({
//         to: email,
//         subject: "आर्य पाठशाला - पासवर्ड रीसेट",
//         html: getPasswordResetEmailTemplate(user.name, resetToken),
//       });
//     }

//     res.json({
//       success: true,
//       message: "रीसेट लिंक आपके ई-मेल पर भेज दिया गया है।",
//     });
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।",
//     });
//   }
// });

// // Reset Password
// app.post("/api/auth/reset-password", async (req, res) => {
//   try {
//     const { token, password, confirmPassword } = req.body;

//     if (!token || !password || !confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "सभी फील्ड आवश्यक हैं",
//       });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "पासवर्ड मेल नहीं खाते",
//       });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
//       });
//     }

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "अवैध या समाप्त रीसेट टोकन",
//       });
//     }

//     // Reset password
//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     user.loginAttempts = 0;
//     user.lockUntil = undefined;
//     await user.save();

//     res.json({
//       success: true,
//       message: "पासवर्ड सफलतापूर्वक रीसेट हो गया!",
//     });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।",
//     });
//   }
// });

// // Get User Profile
// app.get("/api/auth/profile", authenticateToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select(
//       "-password -verificationToken -resetPasswordToken -loginAttempts -lockUntil"
//     );

//     res.json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     console.error("Profile fetch error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि",
//     });
//   }
// });

// // Update User Profile
// app.put("/api/auth/profile", authenticateToken, async (req, res) => {
//   try {
//     const { name, phone } = req.body;
//     const updates = {};

//     if (name) updates.name = name;
//     if (phone) updates.phone = phone;

//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "अपडेट करने के लिए कुछ डेटा प्रदान करें",
//       });
//     }

//     const user = await User.findByIdAndUpdate(req.user._id, updates, {
//       new: true,
//       runValidators: true,
//     }).select(
//       "-password -verificationToken -resetPasswordToken -loginAttempts -lockUntil"
//     );

//     res.json({
//       success: true,
//       message: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!",
//       data: user,
//     });
//   } catch (error) {
//     console.error("Profile update error:", error);

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         message: messages[0] || "डेटा सत्यापन त्रुटि",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि",
//     });
//   }
// });

// // Change Password
// app.put("/api/auth/change-password", authenticateToken, async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmPassword } = req.body;

//     if (!currentPassword || !newPassword || !confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "सभी फील्ड आवश्यक हैं",
//       });
//     }

//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "नया पासवर्ड मेल नहीं खाता",
//       });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
//       });
//     }

//     const user = await User.findById(req.user._id);
//     const isCurrentPasswordValid = await bcrypt.compare(
//       currentPassword,
//       user.password
//     );

//     if (!isCurrentPasswordValid) {
//       return res.status(400).json({
//         success: false,
//         message: "वर्तमान पासवर्ड गलत है",
//       });
//     }

//     user.password = newPassword;
//     await user.save();

//     res.json({
//       success: true,
//       message: "पासवर्ड सफलतापूर्वक बदल गया!",
//     });
//   } catch (error) {
//     console.error("Change password error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि",
//     });
//   }
// });

// // Logout (optional - for token blacklisting if needed)
// app.post("/api/auth/logout", authenticateToken, async (req, res) => {
//   try {
//     // In a production app, you might want to blacklist the token
//     // For now, we'll just send a success response
//     res.json({
//       success: true,
//       message: "सफलतापूर्वक लॉग आउट हो गए!",
//     });
//   } catch (error) {
//     console.error("Logout error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि",
//     });
//   }
// });

// // Resend Verification Email
// app.post("/api/auth/resend-verification", authLimiter, async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "ई-मेल आवश्यक है",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "उपयोगकर्ता नहीं मिला",
//       });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "खाता पहले से सत्यापित है",
//       });
//     }

//     // Generate new verification token
//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     user.verificationToken = verificationToken;
//     await user.save();

//     // Send verification email
//     if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
//       await sendEmail({
//         to: email,
//         subject: "आर्य पाठशाला - खाता सत्यापन",
//         html: getVerificationEmailTemplate(user.name, verificationToken),
//       });
//     }

//     res.json({
//       success: true,
//       message: "सत्यापन ई-मेल पुनः भेज दिया गया है",
//     });
//   } catch (error) {
//     console.error("Resend verification error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि",
//     });
//   }
// });

// // Admin Routes (Protected)

// // Get All Users (Admin only)
// app.get("/api/admin/users", authenticateToken, async (req, res) => {
//   try {
//     // Check if user is admin
//     if (req.user.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "पहुंच अस्वीकृत",
//       });
//     }

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const users = await User.find()
//       .select(
//         "-password -verificationToken -resetPasswordToken -loginAttempts -lockUntil"
//       )
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const totalUsers = await User.countDocuments();
//     const totalPages = Math.ceil(totalUsers / limit);

//     res.json({
//       success: true,
//       data: {
//         users,
//         pagination: {
//           currentPage: page,
//           totalPages,
//           totalUsers,
//           hasNextPage: page < totalPages,
//           hasPrevPage: page > 1,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Get users error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि",
//     });
//   }
// });

// // Update User Role (Admin only)
// app.put(
//   "/api/admin/users/:userId/role",
//   authenticateToken,
//   async (req, res) => {
//     try {
//       if (req.user.role !== "admin") {
//         return res.status(403).json({
//           success: false,
//           message: "पहुंच अस्वीकृत",
//         });
//       }

//       const { userId } = req.params;
//       const { role } = req.body;

//       if (!["student", "teacher", "admin"].includes(role)) {
//         return res.status(400).json({
//           success: false,
//           message: "अवैध भूमिका",
//         });
//       }

//       const user = await User.findByIdAndUpdate(
//         userId,
//         { role },
//         { new: true }
//       ).select(
//         "-password -verificationToken -resetPasswordToken -loginAttempts -lockUntil"
//       );

//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: "उपयोगकर्ता नहीं मिला",
//         });
//       }

//       res.json({
//         success: true,
//         message: "उपयोगकर्ता भूमिका अपडेट हो गई",
//         data: user,
//       });
//     } catch (error) {
//       console.error("Update user role error:", error);
//       res.status(500).json({
//         success: false,
//         message: "सर्वर त्रुटि",
//       });
//     }
//   }
// );

// // Delete User (Admin only)
// app.delete("/api/admin/users/:userId", authenticateToken, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "पहुंच अस्वीकृत",
//       });
//     }

//     const { userId } = req.params;

//     // Prevent admin from deleting themselves
//     if (userId === req.user._id.toString()) {
//       return res.status(400).json({
//         success: false,
//         message: "आप अपना खाता नहीं हटा सकते",
//       });
//     }

//     const user = await User.findByIdAndDelete(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "उपयोगकर्ता नहीं मिला",
//       });
//     }

//     res.json({
//       success: true,
//       message: "उपयोगकर्ता सफलतापूर्वक हटा दिया गया",
//     });
//   } catch (error) {
//     console.error("Delete user error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि",
//     });
//   }
// });

// // Get Dashboard Stats (Admin only)
// app.get("/api/admin/stats", authenticateToken, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "पहुंच अस्वीकृत",
//       });
//     }

//     const totalUsers = await User.countDocuments();
//     const verifiedUsers = await User.countDocuments({ isVerified: true });
//     const studentsCount = await User.countDocuments({ role: "student" });
//     const teachersCount = await User.countDocuments({ role: "teacher" });
//     const adminsCount = await User.countDocuments({ role: "admin" });

//     // Users registered in last 30 days
//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
//     const recentUsers = await User.countDocuments({
//       createdAt: { $gte: thirtyDaysAgo },
//     });

//     // Users who logged in recently
//     const recentlyActiveUsers = await User.countDocuments({
//       lastLogin: { $gte: thirtyDaysAgo },
//     });

//     res.json({
//       success: true,
//       data: {
//         totalUsers,
//         verifiedUsers,
//         unverifiedUsers: totalUsers - verifiedUsers,
//         studentsCount,
//         teachersCount,
//         adminsCount,
//         recentUsers,
//         recentlyActiveUsers,
//         verificationRate:
//           totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0,
//       },
//     });
//   } catch (error) {
//     console.error("Get stats error:", error);
//     res.status(500).json({
//       success: false,
//       message: "सर्वर त्रुटि",
//     });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err);

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "आंतरिक सर्वर त्रुटि",
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
//   });
// });

// // Handle 404 routes
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "API एंडपॉइंट नहीं मिला",
//   });
// });

// // Graceful shutdown
// process.on("SIGTERM", () => {
//   console.log("SIGTERM received. Shutting down gracefully...");
//   server.close(() => {
//     console.log("Process terminated");
//     mongoose.connection.close(false, () => {
//       process.exit(0);
//     });
//   });
// });

// process.on("SIGINT", () => {
//   console.log("SIGINT received. Shutting down gracefully...");
//   server.close(() => {
//     console.log("Process terminated");
//     mongoose.connection.close(false, () => {
//       process.exit(0);
//     });
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, () => {
//   console.log(`🚀 आर्य पाठशाला API सर्वर पोर्ट ${PORT} पर चालू है`);
//   console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
//   console.log(
//     `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
//   );
// });

// module.exports = app;

// // ===================================
// // package.json
// // ===================================
// /*
// {
//   "name": "arya-pathshala-backend",
//   "version": "1.0.0",
//   "description": "Arya Pathshala Authentication Backend API",
//   "main": "server.js",
//   "scripts": {
//     "start": "node server.js",
//     "dev": "nodemon server.js",
//     "test": "jest",
//     "lint": "eslint .",
//     "lint:fix": "eslint . --fix"
//   },
//   "keywords": [
//     "nodejs",
//     "express",
//     "mongodb",
//     "authentication",
//     "jwt",
//     "education",
//     "sanskrit",
//     "vedic"
//   ],
//   "author": "Arya Pathshala Team",
//   "license": "MIT",
//   "dependencies": {
//     "express": "^4.18.2",
//     "mongoose": "^8.0.3",
//     "bcryptjs": "^2.4.3",
//     "jsonwebtoken": "^9.0.2",
//     "nodemailer": "^6.9.7",
//     "cors": "^2.8.5",
//     "helmet": "^7.1.0",
//     "express-rate-limit": "^7.1.5",
//     "morgan": "^1.10.0",
//     "dotenv": "^16.3.1",
//     "crypto": "^1.0.1"
//   },
//   "devDependencies": {
//     "nodemon": "^3.0.2",
//     "jest": "^29.7.0",
//     "supertest": "^6.3.3",
//     "eslint": "^8.55.0"
//   },
//   "engines": {
//     "node": ">=16.0.0"
//   }
// }
// */

// // ===================================
// // .env (Environment Variables)
// // ===================================
// /*
// # Server Configuration
// NODE_ENV=development
// PORT=5000
// FRONTEND_URL=http://localhost:3000

// # Database Configuration
// MONGODB_URI=mongodb://localhost:27017/arya-pathshala

// # JWT Configuration
// JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
// JWT_EXPIRE=7d

// # Email Configuration (Gmail example)
// EMAIL_USER=your-gmail@gmail.com
// EMAIL_PASS=your-app-specific-password

// # Rate Limiting
// MAX_LOGIN_ATTEMPTS=5
// LOCK_TIME=30

// # Security
// BCRYPT_ROUNDS=12
// */

// // ===================================
// // .env.example (Template for users)
// // ===================================
// /*
// # Server Configuration
// NODE_ENV=development
// PORT=5000
// FRONTEND_URL=http://localhost:3000

// # Database Configuration
// MONGODB_URI=mongodb://localhost:27017/arya-pathshala

// # JWT Configuration
// JWT_SECRET=change-this-to-a-secure-random-string
// JWT_EXPIRE=7d

// # Email Configuration
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASS=your-email-app-password

// # Optional: Email service (default: gmail)
// EMAIL_SERVICE=gmail
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587

// # Security Settings
// MAX_LOGIN_ATTEMPTS=5
// ACCOUNT_LOCK_TIME=30
// BCRYPT_ROUNDS=12
// */

// // ===================================
// // .gitignore
// // ===================================
// /*
// # Dependencies
// node_modules/
// npm-debug.log*
// yarn-debug.log*
// yarn-error.log*

// # Environment variables
// .env
// .env.local
// .env.development.local
// .env.test.local
// .env.production.local

// # Logs
// logs
// *.log

// # Runtime data
// pids
// *.pid
// *.seed
// *.pid.lock

// # Coverage directory used by tools like istanbul
// coverage/

// # nyc test coverage
// .nyc_output

// # ESLint cache
// .eslintcache

// # Optional REPL history
// .node_repl_history

// # Output of 'npm pack'
// *.tgz

// # Yarn Integrity file
// .yarn-integrity

// # dotenv environment variables file
// .env

// # IDE
// .vscode/
// .idea/
// *.swp
// *.swo

// # OS
// .DS_Store
// Thumbs.db
// */

// // ===================================
// // README.md
// // ===================================
// /*
// # आर्य पाठशाला - Backend API

// A comprehensive authentication backend for Arya Pathshala educational platform built with Node.js, Express, and MongoDB.

// ## Features

// ### 🔐 Authentication & Authorization
// - **User Registration** with email verification
// - **Secure Login** with JWT tokens
// - **Password Reset** functionality
// - **Account Lockout** after failed attempts
// - **Role-based Access Control** (Student, Teacher, Admin)

// ### 🛡️ Security
// - Password hashing with bcrypt (12 rounds)
// - JWT token-based authentication
// - Rate limiting on auth endpoints
// - Input validation and sanitization
// - Helmet.js security headers
// - CORS configuration

// ### 📧 Email Services
// - Beautiful HTML email templates
// - Email verification for new accounts
// - Password reset emails
// - Nodemailer integration

// ### 📊 Admin Features
// - User management dashboard
// - Statistics and analytics
// - Role management
// - User deletion capabilities

// ## Quick Start

// ### Prerequisites
// - Node.js (v16 or higher)
// - MongoDB (local or Atlas)
// - Gmail account for email services

// ### Installation

// 1. **Clone the repository**
// ```bash
// git clone <repository-url>
// cd arya-pathshala-backend
// ```

// 2. **Install dependencies**
// ```bash
// npm install
// ```

// 3. **Set up environment variables**
// ```bash
// cp .env.example .env
// # Edit .env with your configuration
// ```

// 4. **Start MongoDB**
// ```bash
// # Local MongoDB
// mongod

// # Or use MongoDB Atlas connection string
// ```

// 5. **Run the application**
// ```bash
// # Development mode
// npm run dev

// # Production mode
// npm start
// ```

// ## API Endpoints

// ### Authentication Routes

// #### Register User
// ```http
// POST /api/auth/register
// Content-Type: application/json

// {
//   "name": "राम शर्मा",
//   "email": "ram@example.com",
//   "phone": "9876543210",
//   "password": "password123",
//   "confirmPassword": "password123"
// }
// ```

// #### Login User
// ```http
// POST /api/auth/login
// Content-Type: application/json

// {
//   "email": "ram@example.com",
//   "password": "password123"
// }
// ```

// #### Verify Email
// ```http
// POST /api/auth/verify-email
// Content-Type: application/json

// {
//   "token": "verification-token-from-email"
// }
// ```

// #### Forgot Password
// ```http
// POST /api/auth/forgot-password
// Content-Type: application/json

// {
//   "email": "ram@example.com"
// }
// ```

// #### Reset Password
// ```http
// POST /api/auth/reset-password
// Content-Type: application/json

// {
//   "token": "reset-token-from-email",
//   "password": "newpassword123",
//   "confirmPassword": "newpassword123"
// }
// ```

// ### Protected Routes (Require Authentication)

// #### Get Profile
// ```http
// GET /api/auth/profile
// Authorization: Bearer <jwt-token>
// ```

// #### Update Profile
// ```http
// PUT /api/auth/profile
// Authorization: Bearer <jwt-token>
// Content-Type: application/json

// {
//   "name": "राम शर्मा",
//   "phone": "9876543210"
// }
// ```

// #### Change Password
// ```http
// PUT /api/auth/change-password
// Authorization: Bearer <jwt-token>
// Content-Type: application/json

// {
//   "currentPassword": "oldpassword",
//   "newPassword": "newpassword123",
//   "confirmPassword": "newpassword123"
// }
// ```

// ### Admin Routes (Admin Only)

// #### Get All Users
// ```http
// GET /api/admin/users?page=1&limit=10
// Authorization: Bearer <admin-jwt-token>
// ```

// #### Update User Role
// ```http
// PUT /api/admin/users/:userId/role
// Authorization: Bearer <admin-jwt-token>
// Content-Type: application/json

// {
//   "role": "teacher"
// }
// ```

// #### Get Dashboard Stats
// ```http
// GET /api/admin/stats
// Authorization: Bearer <admin-jwt-token>
// ```

// ## Environment Variables

// | Variable | Description | Default | Required |
// |----------|-------------|---------|----------|
// | `NODE_ENV` | Environment mode | development | No |
// | `PORT` | Server port | 5000 | No |
// | `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/arya-pathshala | Yes |
// | `JWT_SECRET` | JWT signing secret | - | Yes |
// | `JWT_EXPIRE` | JWT expiration time | 7d | No |
// | `EMAIL_USER` | Email service username | - | Yes |
// | `EMAIL_PASS` | Email service password | - | Yes |
// | `FRONTEND_URL` | Frontend application URL | http://localhost:3000 | No |

// ## Email Configuration

// ### Gmail Setup
// 1. Enable 2-Factor Authentication
// 2. Generate App-Specific Password
// 3. Use the app password in `EMAIL_PASS`

// ### Other Email Providers
// Modify the nodemailer configuration in server.js:
// ```javascript
// const emailTransporter = nodemailer.createTransporter({
//   host: 'your-smtp-host.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });
// ```

// ## Security Features

// ### Account Lockout
// - 5 failed login attempts lock the account for 30 minutes
// - Automatic unlock after timeout
// - Prevents brute force attacks

// ### Rate Limiting
// - 5 requests per 15 minutes for auth endpoints
// - Prevents spam and abuse
// - Configurable limits

// ### Password Security
// - Minimum 6 characters required
// - Bcrypt hashing with 12 rounds
// - Secure password reset process

// ## Database Schema

// ### User Model
// ```javascript
// {
//   name: String (required),
//   email: String (required, unique),
//   phone: String (required),
//   password: String (required, hashed),
//   role: String (enum: student, teacher, admin),
//   isVerified: Boolean,
//   verificationToken: String,
//   resetPasswordToken: String,
//   resetPasswordExpires: Date,
//   loginAttempts: Number,
//   lockUntil: Date,
//   lastLogin: Date,
//   createdAt: Date,
//   updatedAt: Date
// }
// ```

// ## Error Handling

// All API responses follow this format:
// ```javascript
// // Success Response
// {
//   "success": true,
//   "message": "ऑपरेशन सफल!",
//   "data": { ... }
// }

// // Error Response
// {
//   "success": false,
//   "message": "त्रुटि का विवरण",
//   "error": "Error details (development only)"
// }
// ```

// ## Development

// ### Running Tests
// ```bash
// npm test
// ```

// ### Linting
// ```bash
// npm run lint
// npm run lint:fix
// ```

// ### Database Seeding
// ```bash
// # Create admin user
// node scripts/create-admin.js
// ```

// ## Deployment

// ### Production Checklist
// - [ ] Set strong JWT_SECRET
// - [ ] Configure production MongoDB
// - [ ] Set up email service
// - [ ] Configure CORS for production domain
// - [ ] Set NODE_ENV to production
// - [ ] Enable SSL/HTTPS
// - [ ] Set up monitoring and logging

// ### Recommended Hosting
// - **Backend**: Heroku, Railway, DigitalOcean
// - **Database**: MongoDB Atlas
// - **Email**: SendGrid, Mailgun, or Gmail

// ## Contributing

// 1. Fork the repository
// 2. Create feature branch
// 3. Commit your changes
// 4. Push to the branch
// 5. Create Pull Request

// ## License

// This project is licensed under the MIT License - see the LICENSE file for details.

// ## Support

// For support, email support@aryapathshala.com or create an issue in the repository.

// ---

// **Made with ❤️ for preserving and sharing Vedic knowledge**
// */
