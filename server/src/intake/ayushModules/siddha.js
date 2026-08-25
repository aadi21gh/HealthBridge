export const siddhaModule = {
  discipline: 'SIDDHA',
  name: 'Siddha Medicine Assessment',
  description: 'Mukkuttram (Vali, Azhal, Iyyam) and Envagai Thervu evaluation.',
  fields: [
    {
      fieldKey: 'mukkuttram',
      fieldLabel: 'Mukkuttram (Three Humors Imbalance)',
      inputType: 'select',
      options: [
        { key: 'vali', label: 'Vali (Vatham / Air & Space)' },
        { key: 'azhal', label: 'Azhal (Pitham / Fire)' },
        { key: 'iyyam', label: 'Iyyam (Kapham / Earth & Water)' },
        { key: 'vali_azhal', label: 'Vali-Azhal' },
        { key: 'azhal_iyyam', label: 'Azhal-Iyyam' },
        { key: 'thondam', label: 'Mukkuttram Thondam (All three disturbed)' },
      ],
    },
    {
      fieldKey: 'udal_vagai',
      fieldLabel: 'Udal Vagai (Physical Constitution)',
      inputType: 'text',
    },
    {
      fieldKey: 'envagai_thervu_notes',
      fieldLabel: 'Envagai Thervu (Pulse, Tongue, Voice, Eye, Stool, Urine, Touch, Body color)',
      inputType: 'text',
    },
  ],
};

export default siddhaModule;
