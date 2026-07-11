import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  view: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: {
    type: Map,
    of: permissionSchema,
    default: () => new Map()
  }
}, {
  timestamps: true
});

export default mongoose.model('Role', roleSchema);
