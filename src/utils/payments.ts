import { db } from './database';
import { Eleve, Classe, FraisScolaire, Paiement } from '../types';

export interface ScheduleItem {
  echeanceId: string;
  modalite: number;
  label: string;
  date: string;
  montant: number;
  paid: number;
  remaining: number;
}

export interface PaymentAllocation {
  echeanceId: string;
  modalite: number;
  montant: number;
}

export interface PaymentResult {
  paiement: Paiement;
  allocations: PaymentAllocation[];
  remainingAmount: number;
}

export function computeScheduleForEleve(eleveId: string): ScheduleItem[] {
  const eleve = db.getById<Eleve>('eleves', eleveId);
  if (!eleve) return [];

  const classe = db.getById<Classe>('classes', eleve.classeId);
  if (!classe) return [];

  const frais = db.getAll<FraisScolaire>('fraisScolaires').find(f => 
    f.niveau === classe.niveau && f.anneeScolaire === classe.anneeScolaire
  );
  if (!frais || !frais.echeances) return [];

  const paiements = db.getAll<Paiement>('paiements').filter(p => p.eleveId === eleveId);

  return frais.echeances.map(echeance => {
    const paiementsEcheance = paiements.filter(p => p.modalite === echeance.modalite);
    const paid = paiementsEcheance.reduce((sum, p) => sum + p.montant, 0);
    
    return {
      echeanceId: echeance.id || `${frais.niveau}-${frais.anneeScolaire}-${echeance.modalite}`,
      modalite: echeance.modalite || 1,
      label: echeance.label || `Modalité ${echeance.modalite}`,
      date: echeance.date,
      montant: echeance.montant,
      paid,
      remaining: Math.max(0, echeance.montant - paid)
    };
  });
}

export function processPayment(
  eleveId: string, 
  montant: number, 
  datePaiement: string, 
  metadata: Record<string, any> = {}
): PaymentResult {
  const schedule = computeScheduleForEleve(eleveId);
  const allocations: PaymentAllocation[] = [];
  let remainingAmount = montant;

  // Allouer le paiement aux échéances dans l'ordre
  for (const item of schedule) {
    if (remainingAmount <= 0 || item.remaining <= 0) continue;

    const allocation = Math.min(remainingAmount, item.remaining);
    allocations.push({
      echeanceId: item.echeanceId,
      modalite: item.modalite,
      montant: allocation
    });
    remainingAmount -= allocation;
  }

  // Créer le paiement
  const paiement = db.create<Paiement>('paiements', {
    eleveId,
    montant,
    datePaiement,
    typeFrais: metadata.type || 'scolarite',
    modePaiement: metadata.mode || 'espece',
    numeroRecu: metadata.numeroRecu || 'REC' + Date.now().toString().slice(-8),
    operateur: metadata.utilisateur || 'ADMIN',
    note: metadata.note || '',
    modalite: metadata.modalite === 'auto' ? (allocations[0]?.modalite || 1) : metadata.modalite
  });

  return {
    paiement,
    allocations,
    remainingAmount
  };
}

export function getSituationFinanciere(eleveId: string) {
  const eleve = db.getById<Eleve>('eleves', eleveId);
  if (!eleve) return null;

  const classe = db.getById<Classe>('classes', eleve.classeId);
  if (!classe) return null;

  const frais = db.getAll<FraisScolaire>('fraisScolaires').find(f => 
    f.niveau === classe.niveau && f.anneeScolaire === classe.anneeScolaire
  );

  const totalDu = frais ? 
    (frais.fraisInscription || 0) + 
    (frais.fraisScolarite || 0) + 
    (frais.fraisCantine || 0) + 
    (frais.fraisTransport || 0) + 
    (frais.fraisFournitures || 0) : 0;

  const paiements = db.getAll<Paiement>('paiements').filter(p => p.eleveId === eleveId);
  const totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0);
  const solde = totalDu - totalPaye;

  let statut: 'Payé' | 'Partiellement Payé' | 'Non Payé' = 'Non Payé';
  if (solde <= 0 && totalDu > 0) statut = 'Payé';
  else if (totalPaye > 0 && solde > 0) statut = 'Partiellement Payé';

  return {
    totalDu,
    totalPaye,
    solde,
    statut
  };
}

export default {
  computeScheduleForEleve,
  processPayment,
  getSituationFinanciere
};