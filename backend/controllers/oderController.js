import Order from "../models/oderModel.js"; 
import nodemailer from "nodemailer";

// ============================================
// DYNAMIC SECURE MASTER TRANSPORTER (STORE IDENTITY)
// ============================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "ahmaddev545@gmail.com", // 👈 Store ki sender email jahan se app key bani hai
    pass: "mwkyoxjthjrbscmf"            // 👈 Aapki app password key bina kisi spaces ke
  },
  tls: {
    rejectUnauthorized: false // Localhost system environment security bypass channels
  }
});

// ============================================
// INTERNAL EMAIL DISPATCH ENGINE
// ============================================
const sendOrderEmail = async (customerEmail, orderDetails) => {
  try {
    console.log("\n================ 🔍 NODEMAILER ENGINE ACTIVATED ================");
    console.log("Store Sender Account:", "ahmaddev545545545@gmail.com");
    console.log("Target Customer Recipient:", customerEmail);

    const itemsHtml = orderDetails.items.map(item => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0;"><h4 style="margin:0; font-size:13px;">${item.name} (${item.size})</h4></td>
        <td style="padding: 10px 0; text-align: center;">x${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold;">Rs.${item.price.toLocaleString()}</td>
      </tr>
    `).join("");

    const mailOptions = {
      // 'from' field hamesha strict authenticated store email hi rahegi
      from: '"Trylo Store" <ahmaddev545545545@gmail.com>', 
      to: customerEmail.trim(), // 👈 Customer ki dynamic input email par confirmation message jayega
      subject: `FITTED Confirmation - Order #${orderDetails._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1e2d4a; text-align: center; font-size: 24px; letter-spacing: 2px;">FITTED</h2>
          <p style="font-size: 14px; color: #4b5563;">Thank you for shopping with us! Your checkout record has been verified.</p>
          <div style="background: #f9fafb; padding: 15px; margin: 15px 0; border-radius: 6px; font-size: 12px; border-left: 4px solid #1e2d4a;">
            <strong>Order ID:</strong> #${orderDetails._id.toString().slice(-6).toUpperCase()}<br/>
            <strong>Method:</strong> ${orderDetails.paymentMethod}<br/>
            <strong>Status:</strong> ${orderDetails.paymentStatus}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #374151;">
            <thead>
              <tr style="border-bottom: 2px solid #1e2d4a; font-weight: bold;">
                <td style="padding-bottom: 5px;">Product</td>
                <td style="padding-bottom: 5px; text-align: center;">Qty</td>
                <td style="padding-bottom: 5px; text-align: right;">Price</td>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <h3 style="text-align: right; color: #1e2d4a; font-size: 16px; margin-top: 20px;">Total Amount: Rs.${orderDetails.totalAmount.toLocaleString()}.00</h3>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("🚀 MAIL DISPATCH SUCCESS! Email successfully delivered to customer:", customerEmail);
    console.log("Message ID Track:", info.messageId);
    console.log("========================================================\n");
  } catch (err) {
    console.error("❌ NODEMAILER LOGICAL FAILURE =>", err.message);
    console.log("========================================================\n");
  }
};

// ============================================
// A. CREATE NEW ORDER (POST)
// ============================================
export const createOrder = async (req, res) => {
  try {
    console.log("\n📥 SERVER ACCESS LAYER: Received checkout request payload.");
    const { customerInfo, billingAddress, items, totalAmount, paymentMethod } = req.body;

    const paymentStatus = paymentMethod.includes("COD") ? "Pending" : "Paid";

    const newOrder = new Order({
      customerInfo,
      billingAddress,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus: "Processing"
    });

    const savedOrder = await newOrder.save();
    console.log("💾 Step 1: Document generated inside database collection.");

    // Dynamic fallback checking extraction criteria
    let customerInputEmail = customerInfo?.email || customerInfo?.emailOrPhone || "";
    console.log("🎯 Step 2: Customer Input Email Found =>", customerInputEmail);

    if (customerInputEmail && String(customerInputEmail).includes("@")) {
      console.log("🔄 Step 3: Triggering non-blocking email engine...");
      
      // Async background thread fire-and-forget call
      sendOrderEmail(customerInputEmail, savedOrder).catch(err => 
        console.error("Background Mail Loop Failure:", err.message)
      );
    } else {
      console.log("⚠️ Step 3 Dropped: Checkout format contains mobile number, email notification skipped.");
    }

    return res.status(201).json({
      success: true,
      message: "Order placed safely inside dataset collection",
      order: savedOrder
    });
  } catch (error) {
    console.error("🔥 DATABASE CREATION ERROR =>", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// B. GET ALL ORDERS FOR ADMIN (GET)
// ============================================
export const listOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// C. UPDATE ORDER STATUS (PUT)
// ============================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      { orderStatus }, 
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order records match not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Order status updated completely", 
      order: updatedOrder 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};