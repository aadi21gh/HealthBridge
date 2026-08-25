import ayurvedaModule from './ayurveda.js';
import yogaModule from './yoga.js';
import unaniModule from './unani.js';
import siddhaModule from './siddha.js';
import homeopathyModule from './homeopathy.js';

const modules = {
  AYURVEDA: ayurvedaModule,
  YOGA_NATUROPATHY: yogaModule,
  UNANI: unaniModule,
  SIDDHA: siddhaModule,
  HOMEOPATHY: homeopathyModule,
};

export const getAyushModule = (discipline) => {
  return modules[discipline] || null;
};

export const getAllDisciplineMetadata = () => {
  return [
    { key: 'MODERN_MEDICINE', name: 'Modern Medicine (Allopathy)', isAyush: false },
    { key: 'AYURVEDA', name: 'Ayurveda', isAyush: true },
    { key: 'YOGA_NATUROPATHY', name: 'Yoga & Naturopathy', isAyush: true },
    { key: 'UNANI', name: 'Unani', isAyush: true },
    { key: 'SIDDHA', name: 'Siddha', isAyush: true },
    { key: 'HOMEOPATHY', name: 'Homeopathy', isAyush: true },
  ];
};

export default modules;
