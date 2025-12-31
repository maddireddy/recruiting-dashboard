const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SectionSchema = new Schema({
  type: {
    type: String,
    enum: ['hero', 'about', 'jobs', 'benefits', 'culture', 'values', 'team', 'contact'],
    required: true,
  },
  title: String,
  subtitle: String,
  content: String,
  image: {
    url: String,
    filename: String,
  },
  items: [
    {
      title: String,
      description: String,
      icon: String,
      image: String,
    },
  ],
  enabled: {
    type: Boolean,
    default: true,
  },
  order: Number,
});

const CareerPageSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Page metadata
    title: {
      type: String,
      default: 'Careers',
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    metaDescription: String,
    metaKeywords: [String],

    // Hero section
    hero: {
      headline: {
        type: String,
        default: 'Join Our Team',
      },
      subheadline: {
        type: String,
        default: 'Build your career with us',
      },
      backgroundImage: {
        url: String,
        filename: String,
      },
      ctaText: {
        type: String,
        default: 'View Open Positions',
      },
    },

    // Page sections
    sections: [SectionSchema],

    // Styling
    theme: {
      primaryColor: String,
      secondaryColor: String,
      accentColor: String,
      fontFamily: String,
      headerStyle: {
        type: String,
        enum: ['centered', 'left', 'overlay'],
        default: 'centered',
      },
    },

    // SEO & Social
    seo: {
      ogImage: String,
      twitterCard: String,
      canonicalUrl: String,
    },

    // Settings
    showJobCount: {
      type: Boolean,
      default: true,
    },
    enableApplications: {
      type: Boolean,
      default: true,
    },
    contactEmail: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
    },

    // Publishing
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: Date,
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CareerPageSchema.index({ organizationId: 1, status: 1 });
CareerPageSchema.index({ slug: 1 });

// Pre-save: Generate slug from organization
CareerPageSchema.pre('save', async function (next) {
  if (this.isNew && !this.slug) {
    const Organization = mongoose.model('Organization');
    const org = await Organization.findById(this.organizationId);
    if (org) {
      this.slug = org.slug || org.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    }
  }
  next();
});

// Methods
CareerPageSchema.methods.publish = function () {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

CareerPageSchema.methods.unpublish = function () {
  this.status = 'draft';
  return this.save();
};

CareerPageSchema.methods.addSection = function (sectionData) {
  const order = this.sections.length;
  this.sections.push({ ...sectionData, order });
  return this.save();
};

CareerPageSchema.methods.removeSection = function (sectionId) {
  this.sections = this.sections.filter((s) => s._id.toString() !== sectionId.toString());
  // Reorder remaining sections
  this.sections.forEach((s, index) => {
    s.order = index;
  });
  return this.save();
};

CareerPageSchema.methods.reorderSections = function (sectionIds) {
  const sectionMap = new Map(this.sections.map((s) => [s._id.toString(), s]));
  this.sections = sectionIds
    .map((id, index) => {
      const section = sectionMap.get(id.toString());
      if (section) {
        section.order = index;
        return section;
      }
      return null;
    })
    .filter(Boolean);
  return this.save();
};

// Statics
CareerPageSchema.statics.getPublishedPage = async function (slug) {
  return this.findOne({ slug, status: 'published' })
    .select('-lastModifiedBy -updatedAt')
    .lean();
};

const CareerPage = mongoose.model('CareerPage', CareerPageSchema);

module.exports = CareerPage;
