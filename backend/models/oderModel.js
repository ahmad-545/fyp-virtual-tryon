import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerInfo: {
      email: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true }
    },
    billingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      phone: { type: String }
    },
    items: [
      {
        productId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product", 
          required: true 
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String, required: true },
        image: { type: String, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    orderStatus: { type: String, enum: ["Processing", "Shipped", "Delivered", "Cancelled"], default: "Processing" }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;