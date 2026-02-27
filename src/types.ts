export type CIATLevel = 1 | 2 | 3 | 4;

export interface CIATDimension {
  id: 'C' | 'I' | 'A' | 'T';
  label: string;
  description: string;
}

export interface CIATCriteria {
  id: string;
  dimensionId: 'C' | 'I' | 'A' | 'T';
  label: string;
  options: {
    level: CIATLevel;
    label: string;
    description: string;
  }[];
}

export const CIAT_DIMENSIONS: CIATDimension[] = [
  {
    id: 'C',
    label: 'Confidentialité',
    description: 'Protection des informations contre tout accès non autorisé.',
  },
  {
    id: 'I',
    label: 'Intégrité',
    description: 'Garantie que les données ne sont pas modifiées de façon non autorisée.',
  },
  {
    id: 'A',
    label: 'Accessibilité',
    description: 'Garantie que les données et services sont disponibles quand nécessaire.',
  },
  {
    id: 'T',
    label: 'Traçabilité',
    description: 'Capacité à retracer l\'historique des actions effectuées sur l\'asset.',
  },
];

export const CIAT_CRITERIA: CIATCriteria[] = [
  {
    id: 'conf_impact',
    dimensionId: 'C',
    label: 'Impact d\'une fuite de données',
    options: [
      { level: 1, label: 'Public', description: 'Données publiques ou sans importance.' },
      { level: 2, label: 'Interne', description: 'Impact limité à l\'organisation, pas de préjudice majeur.' },
      { level: 3, label: 'Confidentiel', description: 'Préjudice financier ou d\'image significatif.' },
      { level: 4, label: 'Secret', description: 'Impact vital, survie de l\'entreprise en jeu ou données ultra-sensibles.' },
    ],
  },
  {
    id: 'int_impact',
    dimensionId: 'I',
    label: 'Impact d\'une corruption de données',
    options: [
      { level: 1, label: 'Négligeable', description: 'Erreurs facilement détectables et corrigeables.' },
      { level: 2, label: 'Modéré', description: 'Nécessite des efforts de correction, impact opérationnel limité.' },
      { level: 3, label: 'Sérieux', description: 'Décisions erronées, impact sur la qualité de service.' },
      { level: 4, label: 'Critique', description: 'Données corrompues entraînant des risques juridiques ou financiers majeurs.' },
    ],
  },
  {
    id: 'acc_impact',
    dimensionId: 'A',
    label: 'Impact d\'une indisponibilité',
    options: [
      { level: 1, label: 'Faible', description: 'Indisponibilité supportable plusieurs jours.' },
      { level: 2, label: 'Moyen', description: 'Indisponibilité gênante après quelques heures.' },
      { level: 3, label: 'Haut', description: 'Impact métier fort après 1 heure d\'arrêt.' },
      { level: 4, label: 'Critique', description: 'Indisponibilité inacceptable, impact immédiat et majeur.' },
    ],
  },
  {
    id: 'trac_impact',
    dimensionId: 'T',
    label: 'Besoin de traçabilité',
    options: [
      { level: 1, label: 'Basique', description: 'Pas de besoin spécifique de suivi.' },
      { level: 2, label: 'Standard', description: 'Logs de connexion et d\'accès standards.' },
      { level: 3, label: 'Réglementaire', description: 'Exigences légales ou contractuelles de traçabilité.' },
      { level: 4, label: 'Forensique', description: 'Besoin de preuves irréfutables pour chaque action.' },
    ],
  },
];
