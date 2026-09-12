import modelSubscriber from "../models/subscriberModel.js";

export const subscribeEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Check if already subscribed
    const emailExist = await modelSubscriber.findOne({ email });

    if (emailExist) {
      return res.status(400).json({
        success: false,
        message: "You are already a subscriber! ✨",
      });
    }

    // Save new subscriber
    const newSubscriber = new modelSubscriber({ email });

    await newSubscriber.save();

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully! 🎉",
      subscriber: newSubscriber,
    });
  } catch (error) {
    console.error("Subscribe Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN: GET ALL SUBSCRIBERS
// ============================================
export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await modelSubscriber.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      subscribers,
    });
  } catch (error) {
    console.error("Get Subscribers Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// ADMIN: DELETE SUBSCRIBER
// ============================================
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    await modelSubscriber.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Subscriber removed successfully.",
    });
  } catch (error) {
    console.error("Delete Subscriber Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};