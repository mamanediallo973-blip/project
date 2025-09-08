import { db } from './database';
import { Ecole, Matiere, Classe, Enseignant, CompositionConfig } from '../types';

export function seedDefaults() {
  // Vérifier si les données par défaut existent déjà
  const ecoles = db.getAll<Ecole>('ecole');
  if (ecoles.length > 0) return; // Déjà initialisé

  const anneeScolaire = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);

  // 1. École par défaut
  const ecoleDefaut: Omit<Ecole, 'id' | 'createdAt' | 'updatedAt'> = {
    nom: 'École Primaire Excellence',
    adresse: 'Abidjan, Côte d\'Ivoire',
    telephone: '+225 XX XX XX XX XX',
    email: 'contact@ecole-excellence.ci',
    logo: '',
    devise: 'FCFA',
    anneeScolaireActive: anneeScolaire,
    compositions: [
      { id: '1', nom: '1ère Composition', coefficient: 1 },
      { id: '2', nom: '2ème Composition', coefficient: 1 },
      { id: '3', nom: '3ème Composition', coefficient: 1 },
      { id: '4', nom: 'Composition de fin d\'année', coefficient: 2 }
    ]
  };
  db.create<Ecole>('ecole', ecoleDefaut);

  // 2. Matières par défaut
  const matieresDefaut: Omit<Matiere, 'id' | 'createdAt' | 'updatedAt'>[] = [
    // Matières fondamentales
    { nom: 'Français', coefficient: 4, type: 'Fondamentale', obligatoire: true, classeIds: [] },
    { nom: 'Mathématiques', coefficient: 4, type: 'Fondamentale', obligatoire: true, classeIds: [] },
    { nom: 'Lecture', coefficient: 3, type: 'Fondamentale', obligatoire: true, classeIds: [] },
    { nom: 'Écriture', coefficient: 3, type: 'Fondamentale', obligatoire: true, classeIds: [] },
    
    // Matières d'éveil
    { nom: 'Sciences et Technologie', coefficient: 2, type: 'Éveil', obligatoire: true, classeIds: [] },
    { nom: 'Histoire-Géographie', coefficient: 2, type: 'Éveil', obligatoire: true, classeIds: [] },
    { nom: 'Éducation Civique et Morale', coefficient: 2, type: 'Éveil', obligatoire: true, classeIds: [] },
    
    // Matières d'expression
    { nom: 'Éducation Artistique', coefficient: 1, type: 'Expression', obligatoire: false, classeIds: [] },
    { nom: 'Éducation Physique et Sportive', coefficient: 1, type: 'Expression', obligatoire: false, classeIds: [] },
    { nom: 'Éducation Musicale', coefficient: 1, type: 'Expression', obligatoire: false, classeIds: [] }
  ];

  const matieres = matieresDefaut.map(m => db.create<Matiere>('matieres', m));

  // 3. Classes par défaut
  const niveaux = ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'];
  const sections = ['A', 'B'];

  niveaux.forEach(niveau => {
    sections.forEach(section => {
      const classeData: Omit<Classe, 'id' | 'createdAt' | 'updatedAt'> = {
        niveau,
        section,
        anneeScolaire,
        enseignantPrincipal: '',
        effectifMax: 35,
        salle: `Salle ${niveau}${section}`,
        matieres: matieres.filter(m => m.obligatoire) // Assigner les matières obligatoires
      };
      db.create<Classe>('classes', classeData);
    });
  });

  // 4. Enseignants par défaut
  const enseignantsDefaut: Omit<Enseignant, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      nom: 'KOUASSI',
      prenoms: 'Marie',
      sexe: 'F',
      telephone: '+225 01 02 03 04 05',
      email: 'marie.kouassi@ecole.ci',
      adresse: 'Abidjan, Cocody',
      specialite: 'Institutrice',
      diplome: 'CEAP',
      dateEmbauche: '2020-09-01',
      statut: 'Actif',
      salaire: 150000
    },
    {
      nom: 'TRAORE',
      prenoms: 'Ibrahim',
      sexe: 'M',
      telephone: '+225 06 07 08 09 10',
      email: 'ibrahim.traore@ecole.ci',
      adresse: 'Abidjan, Yopougon',
      specialite: 'Professeur des écoles',
      diplome: 'Licence en Pédagogie',
      dateEmbauche: '2019-09-01',
      statut: 'Actif',
      salaire: 180000
    }
  ];

  enseignantsDefaut.forEach(e => db.create<Enseignant>('enseignants', e));

  console.log('Données par défaut initialisées avec succès');
}