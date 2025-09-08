// Types de base
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// École
export interface Ecole extends BaseEntity {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  logo?: string;
  devise: string;
  anneeScolaireActive: string;
  compositions?: CompositionConfig[];
}

// Utilisateur
export interface Utilisateur extends BaseEntity {
  nom: string;
  prenoms: string;
  email: string;
  role: 'Admin' | 'Secrétaire' | 'Enseignant';
  actif: boolean;
}

// Matière
export interface Matiere extends BaseEntity {
  nom: string;
  coefficient: number;
  type: 'Fondamentale' | 'Éveil' | 'Expression';
  obligatoire: boolean;
  classeIds: string[];
}

// Classe
export interface Classe extends BaseEntity {
  niveau: string;
  section: string;
  anneeScolaire: string;
  enseignantPrincipal: string;
  effectifMax: number;
  salle: string;
  matieres: Matiere[];
}

// Enseignant
export interface Enseignant extends BaseEntity {
  nom: string;
  prenoms: string;
  sexe: 'M' | 'F';
  telephone: string;
  email: string;
  adresse: string;
  specialite: string;
  diplome: string;
  dateEmbauche: string;
  statut: 'Actif' | 'Inactif' | 'Congé';
  salaire?: number;
  photo?: string;
  classesPrincipales?: string[];
  matieresEnseignees?: string[];
}

// Élève
export interface Eleve extends BaseEntity {
  matricule: string;
  nom: string;
  prenoms: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  lieuNaissance: string;
  classeId: string;
  anneeEntree: string;
  statut: 'Actif' | 'Inactif' | 'Transféré';
  pereTuteur: string;
  mereTutrice: string;
  telephone: string;
  adresse: string;
  photo?: string;
}

// Frais scolaires
export interface FraisScolaire extends BaseEntity {
  niveau: string;
  anneeScolaire: string;
  fraisInscription: number;
  fraisScolarite: number;
  fraisCantine: number;
  fraisTransport: number;
  fraisFournitures: number;
  montant?: number;
  echeances?: {
    id?: string;
    date: string;
    montant: number;
    modalite?: number;
    label?: string;
  }[];
}

// Paiement
export interface Paiement extends BaseEntity {
  eleveId: string;
  montant: number;
  datePaiement: string;
  typeFrais: string;
  modePaiement: string;
  numeroRecu: string;
  operateur: string;
  note?: string;
  modalite?: number;
}

// Note
export interface Note extends BaseEntity {
  eleveId: string;
  matiereId: string;
  compositionId: string;
  valeur: number;
  date: string;
}

// Configuration des compositions
export interface CompositionConfig {
  id: string;
  nom: string;
  coefficient: number;
}

// Situation financière
export interface SituationFinanciere {
  eleveId: string;
  statut: 'Payé' | 'Partiellement Payé' | 'Non Payé';
  solde: number;
}

// Historique des actions
export interface HistoriqueAction extends BaseEntity {
  type: 'creation' | 'modification' | 'suppression' | 'paiement' | 'autre';
  cible: string;
  cibleId?: string;
  description: string;
  utilisateur?: string;
  date: string;
}