/**
 * Ayurveda Intake Assessment Module
 * Captures Prakriti, Vikriti, Agni, Koshta, Ahara, Vihara, Nidra, and other Ayurvedic clinical parameters.
 */
export const ayurvedaModule = {
  discipline: 'AYURVEDA',
  name: 'Ayurveda Clinical Assessment',
  description: 'Traditional Ayurvedic clinical history taking and diagnostic concepts (Prakriti, Vikriti, Agni, Koshta, etc.)',

  fields: [
    {
      fieldKey: 'prakriti',
      fieldLabel: 'Prakriti (Physical Constitution)',
      inputType: 'select',
      options: [
        { key: 'prakriti_vata', label: 'Vata' },
        { key: 'prakriti_pitta', label: 'Pitta' },
        { key: 'prakriti_kapha', label: 'Kapha' },
        { key: 'prakriti_vata_pitta', label: 'Vata-Pitta' },
        { key: 'prakriti_pitta_kapha', label: 'Pitta-Kapha' },
        { key: 'prakriti_vata_kapha', label: 'Vata-Kapha' },
        { key: 'prakriti_tridosha', label: 'Tridoshaja (Balanced)' },
      ],
      description: 'Inherent baseline bodily constitution',
    },
    {
      fieldKey: 'vikriti',
      fieldLabel: 'Vikriti (Current Imbalance / Dosha Disturbance)',
      inputType: 'multi',
      options: [
        { key: 'vikriti_vata', label: 'Vata Aggravation (Pain, Dryness, Gas, Restlessness)' },
        { key: 'vikriti_pitta', label: 'Pitta Aggravation (Acidity, Heat, Inflammation, Skin Rashes)' },
        { key: 'vikriti_kapha', label: 'Kapha Aggravation (Heaviness, Congestion, Lethargy, Mucus)' },
      ],
      description: 'Current doshic imbalance state',
    },
    {
      fieldKey: 'agni',
      fieldLabel: 'Agni (Digestive Fire / Metabolism)',
      inputType: 'select',
      options: [
        { key: 'agni_sama', label: 'Sama Agni (Normal, Balanced Digestion)' },
        { key: 'agni_vishama', label: 'Vishama Agni (Irregular / Variable Digestion - Vata)' },
        { key: 'agni_tikshna', label: 'Tikshna Agni (Hyperactive / Intense Hunger / Burning - Pitta)' },
        { key: 'agni_manda', label: 'Manda Agni (Sluggish / Weak / Slow Digestion - Kapha)' },
      ],
      description: 'Digestive capacity and metabolic strength',
    },
    {
      fieldKey: 'koshta',
      fieldLabel: 'Koshta (Bowel Tendency)',
      inputType: 'select',
      options: [
        { key: 'koshta_krura', label: 'Krura Koshta (Hard, Constipated / Vata)' },
        { key: 'koshta_mridu', label: 'Mridu Koshta (Soft, Loose / Pitta)' },
        { key: 'koshta_madhya', label: 'Madhya Koshta (Normal, Regular / Kapha)' },
      ],
      description: 'Digestive tract mobility and bowel pattern',
    },
    {
      fieldKey: 'ahara',
      fieldLabel: 'Ahara (Dietary Habits & Preferences)',
      inputType: 'text',
      placeholder: 'E.g., Timings, taste preferences (Rasa: Sweet/Sour/Salty/Pungent/Bitter/Astringent), water intake',
    },
    {
      fieldKey: 'vihara',
      fieldLabel: 'Vihara (Daily Regimen / Physical Activity)',
      inputType: 'text',
      placeholder: 'E.g., Dinacharya, exercise routine, work posture, stress factors',
    },
    {
      fieldKey: 'nidra',
      fieldLabel: 'Nidra (Sleep Pattern)',
      inputType: 'select',
      options: [
        { key: 'nidra_sukha', label: 'Sukha Nidra (Sound, Restful Sleep)' },
        { key: 'nidra_anidra', label: 'Anidra (Insomnia / Broken Sleep)' },
        { key: 'nidra_atinidra', label: 'Atinidra (Excessive Sleep / Heaviness upon waking)' },
        { key: 'nidra_khandita', label: 'Khandita Nidra (Interrupted Sleep)' },
      ],
    },
    {
      fieldKey: 'bala',
      fieldLabel: 'Roga Bala / Rogi Bala (Disease & Patient Strength)',
      inputType: 'select',
      options: [
        { key: 'bala_pravara', label: 'Pravara (High / Strong)' },
        { key: 'bala_madhyama', label: 'Madhyama (Moderate)' },
        { key: 'bala_avara', label: 'Avara (Low / Fragile)' },
      ],
    },
  ],
};

export default ayurvedaModule;
