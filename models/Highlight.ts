import mongoose from 'mongoose';

const HighlightSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
  },
  pdfUuid: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  position: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },
  color: {
    type: String,
    default: '#ffeb3b',
  },
  note: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Highlight || mongoose.model('Highlight', HighlightSchema);