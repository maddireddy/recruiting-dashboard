const mongoose = require('mongoose');
const { Schema } = mongoose;

const DepartmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

  code: {
    type: String,
    uppercase: true,
    trim: true,
    maxlength: 20,
  },

  description: String,

  // Hierarchical structure
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },

  // Department head
  head: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
  },

  // Cost center for accounting
  costCenter: String,

  // Organization
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for organization and name uniqueness
DepartmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });

// Pre-save hook
DepartmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for employee count
DepartmentSchema.virtual('employeeCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'employment.department',
  count: true,
});

// Methods
DepartmentSchema.methods.getFullPath = async function() {
  const path = [this.name];
  let current = this;

  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }

  return path.join(' > ');
};

DepartmentSchema.methods.getSubDepartments = function() {
  return this.constructor.find({
    parent: this._id,
    organizationId: this.organizationId,
    status: 'active',
  });
};

// Static methods
DepartmentSchema.statics.getHierarchy = async function(organizationId) {
  const departments = await this.find({ organizationId, status: 'active' });

  const buildTree = (parentId = null) => {
    return departments
      .filter((dept) =>
        parentId === null
          ? !dept.parent
          : dept.parent && dept.parent.toString() === parentId.toString()
      )
      .map((dept) => ({
        ...dept.toObject(),
        children: buildTree(dept._id),
      }));
  };

  return buildTree();
};

module.exports = mongoose.model('Department', DepartmentSchema);
