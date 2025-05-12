
const mongoose = require("mongoose");

const FundraisingSchema = new mongoose.Schema({
    description: { type: String, required: true },
    medical_docs: { type: String, required: true },
    receiver_upi: { type: String, required: true },
    receiver_name: { type: String, required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Fundraising = mongoose.model("Fundraising", FundraisingSchema);
module.exports = Fundraising;

