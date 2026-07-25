import Order from "../models/oderModel.js"; 
import nodemailer from "nodemailer";

// ============================================
// 1. CUSTOMER EMAIL DISPATCH ENGINE
// ============================================
const sendCustomerOrderEmail = async (customerEmail, orderDetails) => {
  try {
    // Transporter ko function ke andar rakha taake .env values properly read hon
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false 
      }
    });

    console.log("\n================ 🔍 CUSTOMER EMAIL ENGINE ================");
    console.log("Store Sender Account:", process.env.EMAIL_USER);
    console.log("Target Customer Recipient:", customerEmail);

    const itemsHtml = orderDetails.items.map(item => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0;"><h4 style="margin:0; font-size:13px;">${item.name} (${item.size})</h4></td>
        <td style="padding: 10px 0; text-align: center;">x${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold;">Rs.${item.price.toLocaleString()}</td>
      </tr>
    `).join("");

    const mailOptions = {
      from: `"Trylo Store" <${process.env.EMAIL_USER}>`, 
      to: customerEmail.trim(), 
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

    await transporter.sendMail(mailOptions);
    console.log("🚀 Customer confirmation email sent successfully!");
  } catch (err) {
    console.error("❌ Customer Email Error =>", err.message);
  }
};

// ============================================
// 2. ADMIN NOTIFICATION EMAIL ENGINE
// ============================================
const sendAdminNotificationEmail = async (orderData) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false 
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🎉 New Order Received! #${orderData._id || 'New'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fcfcfc;">
          <h2 style="color: #C19A6B; border-bottom: 2px solid #C19A6B; padding-bottom: 10px; text-transform: uppercase;">New Order Notification</h2>
          <p>A new order has been successfully placed on <strong>Trylo</strong>.</p>
          
          <h3 style="margin-top: 20px; color: #111; text-transform: uppercase; font-size: 14px;">Order Details:</h3>
          <p><strong>Order ID:</strong> ${orderData._id}</p>
          <p><strong>Total Amount:</strong> PKR ${orderData.totalAmount || orderData.amount || 'N/A'}</p>
          <p><strong>Customer Name:</strong> ${orderData.customerInfo?.fullName || orderData.name || 'N/A'}</p>
          <p><strong>Phone:</strong> ${orderData.customerInfo?.phone || orderData.phone || 'N/A'}</p>
          <p><strong>Shipping Address:</strong> ${orderData.billingAddress?.address || orderData.address || 'N/A'}</p>
          
          <br/>
          <p style="font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px;">Please check your admin dashboard to manage shipping status and view items.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("🚀 Admin notification email sent successfully!");
  } catch (error) {
    console.error("❌ Admin Email Error =>", error);
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

    // 1. Send Admin Email Notification
    sendAdminNotificationEmail(savedOrder);

    // 2. Send Customer Email Confirmation
    let customerInputEmail = customerInfo?.email || customerInfo?.emailOrPhone || "";
    if (customerInputEmail && String(customerInputEmail).includes("@")) {
      sendCustomerOrderEmail(customerInputEmail, savedOrder).catch(err => 
        console.error("Background Mail Loop Failure:", err.message)
      );
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
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