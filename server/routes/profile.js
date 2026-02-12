import express from "express";
import Profile from "../models/Profile.js";
import PriceHistory from "../models/PriceHistory.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * GET MY PROFILE (PRIVATE)
 * GET /api/profile/me
 * ⚠️ MUST be before /:id
 */
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * CREATE PROFILE (PRIVATE - ONE PER USER)
 * POST /api/profile
 */
router.post("/", auth, async (req, res) => {
  try {
    const {
      factoryName,
      ownerName,
      contactNumber,
      address,
      commodityType,
      pricePerKilo,
      effectiveDate,
      operatingHours
    } = req.body;

    // Validate required fields
    if (
      !factoryName ||
      !ownerName ||
      !contactNumber ||
      !address ||
      !commodityType ||
      !pricePerKilo ||
      !effectiveDate ||
      !operatingHours
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent duplicate profile
    const existingProfile = await Profile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res
        .status(409)
        .json({ message: "Profile already exists for this user" });
    }

    // Create profile
    const profile = await Profile.create({
      userId: req.user.id,
      factoryName,
      ownerName,
      contactNumber,
      address,
      commodityType,
      pricePerKilo,
      effectiveDate,
      operatingHours
    });

    // 🔥 Save initial price history
    await PriceHistory.create({
      profileId: profile._id,
      price: pricePerKilo
    });

    res.status(201).json(profile);
  } catch (err) {
    console.error("CREATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET ALL PROFILES (PUBLIC)
 * GET /api/profile
 */
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("userId", "email");
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET SINGLE PROFILE (PUBLIC)
 * GET /api/profile/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate(
      "userId",
      "email"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET PRICE HISTORY (PUBLIC)
 * GET /api/profile/:id/history
 * ⚠️ MUST be before PUT/DELETE /:id
 */
router.get("/:id/history", async (req, res) => {
  try {
    const history = await PriceHistory.find({
      profileId: req.params.id
    }).sort({ date: 1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * UPDATE PROFILE (PRIVATE)
 * PUT /api/profile/:id
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const oldPrice = profile.pricePerKilo;

    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // 🔥 Save price history ONLY if price changed
    if (
      req.body.pricePerKilo &&
      Number(req.body.pricePerKilo) !== Number(oldPrice)
    ) {
      await PriceHistory.create({
        profileId: req.params.id,
        price: req.body.pricePerKilo
      });
    }

    res.json(updatedProfile);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE PROFILE (PRIVATE)
 * DELETE /api/profile/:id
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await profile.deleteOne();

    // 🔥 Optional: delete price history as well
    await PriceHistory.deleteMany({ profileId: req.params.id });

    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
