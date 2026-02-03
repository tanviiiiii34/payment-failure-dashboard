const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

/**
 * GET /api/transactions
 * Admin  -> all data
 * User   -> only their data
 */
router.get("/", async (req, res) => {
  try {
    const { role, userEmail } = req.query;

    let transactions;

    if (role === "admin") {
      transactions = await Transaction.find().sort({ createdAt: -1 });
    } else {
      transactions = await Transaction.find({ userEmail }).sort({
        createdAt: -1,
      });
    }

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
