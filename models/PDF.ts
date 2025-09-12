import mongoose from 'mongoose';

const PDFSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  pageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.PDF || mongoose.model('PDF', PDFSchema);