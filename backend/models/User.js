const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'manager', 'employee'], required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  joiningDate: { type: Date, default: Date.now },
  monthlySalary: { type: Number, default: 0 },
  // Manager permissions — only relevant when role === 'manager'
  permissions: {
    markAttendance: { type: Boolean, default: false },
    viewStaffList: { type: Boolean, default: false },
    recordSalaryPayments: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
