import { db } from './database';
import { Eleve, Note, Matiere, CompositionConfig, Classe } from '../types';

export function calculerMoyenneAnnuelle(eleve: Eleve, anneeFilter?: string): number {
  const notes = db.getAll<Note>('notes').filter(n => n.eleveId === eleve.id);
  const matieres = db.getAll<Matiere>('matieres');
  const compositions = db.getAll<CompositionConfig>('compositions');
  const classe = db.getAll<Classe>('classes').find(c => c.id === eleve.classeId);
  
  if (!classe) return 0;

  // Pour chaque matière de la classe, calculer la moyenne pondérée sur toutes les compositions
  let total = 0;
  let totalCoeff = 0;

  classe.matieres.forEach(matiere => {
    let somme = 0;
    let coeffTotal = 0;
    
    compositions.forEach(comp => {
      const note = notes.find(n => n.matiereId === matiere.id && n.compositionId === comp.id);
      if (note) {
        somme += note.valeur * comp.coefficient;
        coeffTotal += comp.coefficient;
      }
    });
    
    if (coeffTotal > 0) {
      const moyenneMatiere = somme / coeffTotal;
      total += moyenneMatiere * matiere.coefficient;
      totalCoeff += matiere.coefficient;
    }
  });

  if (totalCoeff === 0) return 0;
  return Math.round((total / totalCoeff) * 100) / 100;
}

export function calculerMoyenneComposition(eleveId: string, compositionId: string): number {
  const notes = db.getAll<Note>('notes').filter(n => 
    n.eleveId === eleveId && n.compositionId === compositionId
  );
  
  if (notes.length === 0) return 0;
  
  const eleve = db.getById<Eleve>('eleves', eleveId);
  if (!eleve) return 0;
  
  const classe = db.getById<Classe>('classes', eleve.classeId);
  if (!classe) return 0;

  let total = 0;
  let totalCoeff = 0;

  notes.forEach(note => {
    const matiere = classe.matieres.find(m => m.id === note.matiereId);
    if (matiere) {
      total += note.valeur * matiere.coefficient;
      totalCoeff += matiere.coefficient;
    }
  });

  if (totalCoeff === 0) return 0;
  return Math.round((total / totalCoeff) * 100) / 100;
}

export function getClassementClasse(classeId: string): Array<{
  eleve: Eleve;
  moyenne: number;
  rang: number;
}> {
  const eleves = db.getAll<Eleve>('eleves').filter(e => 
    e.classeId === classeId && e.statut === 'Actif'
  );

  const elevesAvecMoyenne = eleves.map(eleve => ({
    eleve,
    moyenne: calculerMoyenneAnnuelle(eleve)
  }));

  // Trier par moyenne décroissante
  elevesAvecMoyenne.sort((a, b) => b.moyenne - a.moyenne);

  // Attribuer les rangs
  return elevesAvecMoyenne.map((item, index) => ({
    ...item,
    rang: index + 1
  }));
}