import mongoose from 'mongoose';

const { Schema } = mongoose;

const conditionSchema = new Schema(
  {
    field: { type: String, required: true }, // e.g. 'symptom', 'age_range', 'gender'
    operator: { type: String, enum: ['equals', 'contains', 'in', 'gt', 'lt', 'gte', 'lte', 'exists'], required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const redFlagRuleSchema = new Schema(
  {
    ruleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },

    // ALL conditions must match (AND logic)
    conditions: [conditionSchema],

    severity: {
      type: String,
      enum: ['INFO', 'ATTENTION', 'URGENT', 'EMERGENCY'],
      required: true,
    },

    // Patient-facing message (multilingual keys)
    messageKey: { type: String, required: true }, // references translation key
    messageFallback: { type: String, required: true }, // English fallback

    // Doctor-facing
    recommendedAction: { type: String, required: true },

    version: { type: Number, default: 1 },
    active: { type: Boolean, default: true, index: true },

    // Clinical category this rule applies to
    category: { type: String, enum: ['cardiovascular', 'neurological', 'respiratory', 'gastrointestinal', 'obstetric', 'psychiatric', 'general', 'other'] },
  },
  { timestamps: true }
);

redFlagRuleSchema.index({ active: 1, category: 1 });

const RedFlagRule = mongoose.model('RedFlagRule', redFlagRuleSchema);

export default RedFlagRule;
