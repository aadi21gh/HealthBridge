export const homeopathyModule = {
  discipline: 'HOMEOPATHY',
  name: 'Homeopathic Case Intake & Totality',
  description: 'Constitutional totality, miasmatic tendency, thermal reaction, and modalities.',
  fields: [
    {
      fieldKey: 'thermal_state',
      fieldLabel: 'Thermal Reaction (Chilly / Hot)',
      inputType: 'select',
      options: [
        { key: 'chilly', label: 'Chilly (Intolerant to cold, desires warmth)' },
        { key: 'hot', label: 'Hot (Intolerant to heat, desires open air/cold)' },
        { key: 'ambithermal', label: 'Ambithermal (Sensitive to both extremes)' },
      ],
    },
    {
      fieldKey: 'thirst_state',
      fieldLabel: 'Thirst Characteristics',
      inputType: 'select',
      options: [
        { key: 'thirsty_large_quantities', label: 'Thirsty for large quantities at long intervals' },
        { key: 'thirsty_small_sips', label: 'Thirsty for small quantities frequently' },
        { key: 'thirstless', label: 'Thirstless even with dry mouth/fever' },
      ],
    },
    {
      fieldKey: 'mental_generals',
      fieldLabel: 'Mental Generals / Temperament',
      inputType: 'text',
      placeholder: 'Anxiety, anger, fears, grief, fastidiousness, mood swings',
    },
    {
      fieldKey: 'cravings_aversions',
      fieldLabel: 'Desires & Aversions (Food / Drink)',
      inputType: 'text',
      placeholder: 'E.g., Cravings for sweets/salt/spicy/sour, aversion to fat/milk',
    },
    {
      fieldKey: 'miasmatic_background',
      fieldLabel: 'Miasmatic Predisposition (if clinician assessed)',
      inputType: 'select',
      options: [
        { key: 'psora', label: 'Psora' },
        { key: 'sycosis', label: 'Sycosis' },
        { key: 'syphilis', label: 'Syphilis' },
        { key: 'tubercular', label: 'Tubercular' },
      ],
    },
  ],
};

export default homeopathyModule;
