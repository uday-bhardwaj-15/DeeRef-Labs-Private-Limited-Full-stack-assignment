// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const UserSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// UserSchema.methods.comparePassword = async function (
//   candidatePassword: string
// ) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// export default mongoose.models.User || mongoose.model("User", UserSchema);
import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// Define User document interface
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema definition
const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook for hashing password
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Fix typing issue with model
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
