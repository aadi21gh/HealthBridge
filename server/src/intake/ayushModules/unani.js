export const unaniModule = {
  discipline: 'UNANI',
  name: 'Unani Tibb Assessment',
  description: 'Mizaj (Temperament), Akhlat (Humors), and Quwa (Faculties) clinical assessment.',
  fields: [
    {
      fieldKey: 'mizaj',
      fieldLabel: 'Mizaj (Temperament)',
      inputType: 'select',
      options: [
        { key: 'damwi', label: 'Damwi (Sanguine - Hot & Moist)' },
        { key: 'safrawi', label: 'Safrawi (Choleric - Hot & Dry)' },
        { key: 'balghami', label: 'Balghami (Phlegmatic - Cold & Moist)' },
        { key: 'saudawi', label: 'Saudawi (Melancholic - Cold & Dry)' },
      ],
    },
    {
      fieldKey: 'nabz_character',
      fieldLabel: 'Nabz (Pulse Characteristics if known)',
      inputType: 'text',
      placeholder: 'Volume, rate, strength notes',
    },
    {
      fieldKey: 'asbab_sitta_dharuriyyah',
      fieldLabel: 'Essential Factors (Air, Food, Movement, Sleep, Evacuation)',
      inputType: 'text',
    },
  ],
};

export default unaniModule;
