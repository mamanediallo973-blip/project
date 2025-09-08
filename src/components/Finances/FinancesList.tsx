import React, { useState, useMemo } from 'react';
import { useToast } from '../Layout/ToastProvider';
import { Search, Plus, DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { db } from '../../utils/database';
import { Eleve, Classe, FraisScolaire, Paiement } from '../../types';
import PaymentForm from './PaymentForm';
import { getSituationFinanciere } from '../../utils/payments';

export default function FinancesList() {
  const { showToast } = useToast();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const eleves = db.getAll<Eleve>('eleves');
  const classes = db.getAll<Classe>('classes');
  const paiements = db.getAll<Paiement>('paiements');
  const fraisScolaires = db.getAll<FraisScolaire>('fraisScolaires');

  // Calculer les situations financières
  const situationsFinancieres = useMemo(() => {
    return eleves.map(eleve => {
      const situation = getSituationFinanciere(eleve.id);
      return {
        eleve,
        ...situation
      };
    }).filter(s => s.totalDu !== null);
  }, [eleves]);

  const filteredSituations = useMemo(() => {
    let filtered = [...situationsFinancieres];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.eleve.nom.toLowerCase().includes(term) ||
        s.eleve.prenoms.toLowerCase().includes(term) ||
        s.eleve.matricule.toLowerCase().includes(term)
      );
    }

    if (filterStatut) {
      filtered = filtered.filter(s => s.statut === filterStatut);
    }

    return filtered.sort((a, b) => a.eleve.nom.localeCompare(b.eleve.nom));
  }, [situationsFinancieres, searchTerm, filterStatut]);

  const stats = useMemo(() => {
    const totalRecettes = paiements.reduce((sum, p) => sum + p.montant, 0);
    const totalDu = situationsFinancieres.reduce((sum, s) => sum + (s.totalDu || 0), 0);
    const totalPaye = situationsFinancieres.reduce((sum, s) => sum + (s.totalPaye || 0), 0);
    const totalSolde = situationsFinancieres.reduce((sum, s) => sum + Math.max(0, s.solde || 0), 0);

    return {
      totalRecettes,
      totalDu,
      totalPaye,
      totalSolde,
      elevesPayes: situationsFinancieres.filter(s => s.statut === 'Payé').length,
      elevesPartiels: situationsFinancieres.filter(s => s.statut === 'Partiellement Payé').length,
      elevesImpayes: situationsFinancieres.filter(s => s.statut === 'Non Payé').length
    };
  }, [situationsFinancieres, paiements]);

  const getClasseNom = (classeId: string) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? `${classe.niveau} ${classe.section}` : 'Non assigné';
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Payé': return 'bg-green-100 text-green-800';
      case 'Partiellement Payé': return 'bg-orange-100 text-orange-800';
      case 'Non Payé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  const handlePaymentSubmit = (eleveId: string, montant: number, type: string, modalite: number | 'auto') => {
    setShowPaymentForm(false);
    showToast('Paiement enregistré avec succès', 'success');
    // Recharger la page pour mettre à jour les données
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Financière</h1>
          <p className="text-gray-600">{filteredSituations.length} élève(s) trouvé(s)</p>
        </div>
        <button 
          onClick={() => setShowPaymentForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau Paiement</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recettes</p>
              <p className="text-2xl font-bold text-green-600">{formatMontant(stats.totalRecettes)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Élèves Payés</p>
              <p className="text-2xl font-bold text-green-600">{stats.elevesPayés}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paiements Partiels</p>
              <p className="text-2xl font-bold text-orange-600">{stats.elevesPartiels}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non Payés</p>
              <p className="text-2xl font-bold text-red-600">{stats.elevesImpayes}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="Payé">Payé</option>
            <option value="Partiellement Payé">Partiellement Payé</option>
            <option value="Non Payé">Non Payé</option>
          </select>
        </div>
      </div>

      {/* Table des situations financières */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Élève</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Classe</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total Dû</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total Payé</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Solde</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSituations.map((situation) => (
                <tr key={situation.eleve.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      {situation.eleve.photo && (
                        <img 
                          src={situation.eleve.photo} 
                          alt={`${situation.eleve.prenoms} ${situation.eleve.nom}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {situation.eleve.prenoms} {situation.eleve.nom}
                        </div>
                        <div className="text-sm text-gray-500">{situation.eleve.matricule}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getClasseNom(situation.eleve.classeId)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    {formatMontant(situation.totalDu || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    {formatMontant(situation.totalPaye || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    <span className={situation.solde && situation.solde > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatMontant(Math.max(0, situation.solde || 0))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(situation.statut || 'Non Payé')}`}>
                      {situation.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSituations.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune donnée financière trouvée</p>
          </div>
        )}
      </div>

      {/* Modal de paiement */}
      {showPaymentForm && (
        <PaymentForm
          onCancel={() => setShowPaymentForm(false)}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
}