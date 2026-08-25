export const yogaModule = {
  discipline: 'YOGA_NATUROPATHY',
  name: 'Yoga & Naturopathy Assessment',
  description: 'Assessment of Panchamahabhuta, lifestyle, vital capacity, mental health, and physical flexibility.',
  fields: [
    {
      fieldKey: 'panchamahabhuta_tendency',
      fieldLabel: 'Predominant Element Imbalance (Panchamahabhuta)',
      inputType: 'select',
      options: [
        { key: 'akasha', label: 'Akasha (Space)' },
        { key: 'vayu', label: 'Vayu (Air)' },
        { key: 'agni_el', label: 'Agni (Fire)' },
        { key: 'jala', label: 'Jala (Water)' },
        { key: 'prithvi', label: 'Prithvi (Earth)' },
      ],
    },
    {
      fieldKey: 'vitality_score',
      fieldLabel: 'Vitality & Stamina Level',
      inputType: 'select',
      options: [
        { key: 'high', label: 'High (Energetic)' },
        { key: 'moderate', label: 'Moderate' },
        { key: 'low', label: 'Low (Easily Exhausted)' },
      ],
    },
    {
      fieldKey: 'stress_manasika',
      fieldLabel: 'Mental State (Manasika Gunas)',
      inputType: 'select',
      options: [
        { key: 'sattva', label: 'Sattva (Calm, Clear, Stable)' },
        { key: 'rajas', label: 'Rajas (Agitated, Anxious, Restless)' },
        { key: 'tamas', label: 'Tamas (Depressed, Lethargic, Dull)' },
      ],
    },
    {
      fieldKey: 'naturopathy_notes',
      fieldLabel: 'Elimination Habits & Toxin Burden (Mala & Toxemia)',
      inputType: 'text',
      placeholder: 'Sweat, bowel, urination frequency, diet details',
    },
  ],
};

export default yogaModule;
