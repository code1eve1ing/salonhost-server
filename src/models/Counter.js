const mongoose = require("mongoose");
const { Schema } = mongoose;

// Single document tracks the next sequence value; findOneAndUpdate with
// $inc is atomic, so concurrent signups never collide on the same number.
const CounterSchema = new Schema({
  _id: { type: String, required: true }, // e.g. "user_counter"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

/**
 * Returns the next value as a zero-padded 8-digit string, starting at "00000000".
 */
async function getNextUserCounter() {
  const doc = await Counter.findOneAndUpdate(
    { _id: "user_counter" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  // seq starts at 1 after first increment; subtract 1 so first user = 00000000
  return String(doc.seq - 1).padStart(8, "0");
}

module.exports = { Counter, getNextUserCounter };
