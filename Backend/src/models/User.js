import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  view: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  permissions: {
    type: Map,
    of: permissionSchema,
    default: () => new Map()
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  lastLogin: { type: Date },
  phone: { type: String, default: '' },
  salary: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  isSystemUser: { type: Boolean, default: true },
  jobTitle: { type: String, default: 'Staff' }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
