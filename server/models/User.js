import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    preferences: {
      theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark',
      },
      workHoursStart: {
        type: String,
        default: '09:00',
      },
      workHoursEnd: {
        type: String,
        default: '18:00',
      },
      baselinePeriodDays: {
        type: Number,
        default: 30,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
