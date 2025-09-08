import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/Layout/ToastProvider';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import ElevesList from './components/Eleves/ElevesList';
import EleveForm from './components/Eleves/EleveForm';
import EnseignantsList from './components/Enseignants/EnseignantsList';
import EnseignantForm from './components/Enseignants/EnseignantForm';
import ClassesList from './components/Classes/ClassesList';
import ClasseForm from './components/Classes/ClasseForm';
import MatieresList from './components/Matieres/MatieresList';
import MatiereForm from './components/Matieres/MatiereForm';
import FinancesList from './components/Finances/FinancesList';
import NotesParClasse from './components/Notes/NotesParClasse';
import ConfigMain from './components/Config/ConfigMain';
import ConfigImpression from './components/Config/ConfigImpression';
import Guide from './components/Guide';
import { seedDefaults } from './utils/seedDefaults';
import auth from './utils/auth';
import { Eleve, Enseignant, Classe, Matiere, Utilisateur } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [selectedEnseignant, setSelectedEnseignant] = useState<Enseignant | null>(null);
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Initialiser les données par défaut
    seedDefaults();
    
    // Vérifier si un utilisateur est connecté
    const user = auth.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // Écouter les événements de navigation
    const handleNavigate = (event: CustomEvent) => {
      const { page, action } = event.detail;
      setCurrentPage(page);
      if (action === 'new') {
        if (page === 'eleves') setSelectedEleve(null);
        if (page === 'enseignants') setSelectedEnseignant(null);
        if (page === 'classes') setSelectedClasse(null);
        if (page === 'matieres') setSelectedMatiere(null);
      }
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

  const handleLogin = (user: Utilisateur) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Reset selections when changing pages
    setSelectedEleve(null);
    setSelectedEnseignant(null);
    setSelectedClasse(null);
    setSelectedMatiere(null);
  };

  if (!currentUser) {
    return (
      <ToastProvider>
        <LoginForm onLogin={handleLogin} />
      </ToastProvider>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'eleves':
        if (selectedEleve !== null) {
          return (
            <EleveForm
              eleve={selectedEleve}
              onSave={() => {
                setSelectedEleve(null);
                setCurrentPage('eleves');
              }}
              onCancel={() => setSelectedEleve(null)}
            />
          );
        }
        return (
          <ElevesList
            onEleveSelect={setSelectedEleve}
            onNewEleve={() => setSelectedEleve(null)}
          />
        );

      case 'enseignants':
        if (selectedEnseignant !== null) {
          return (
            <EnseignantForm
              enseignant={selectedEnseignant}
              onSave={(enseignant) => {
                setSelectedEnseignant(null);
                setCurrentPage('enseignants');
              }}
              onCancel={() => setSelectedEnseignant(null)}
            />
          );
        }
        return (
          <EnseignantsList
            onEnseignantSelect={setSelectedEnseignant}
            onNewEnseignant={() => setSelectedEnseignant(null)}
          />
        );

      case 'classes':
        if (selectedClasse !== null) {
          return (
            <ClasseForm
              classe={selectedClasse}
              onSave={(classe) => {
                setSelectedClasse(null);
                setCurrentPage('classes');
              }}
              onCancel={() => setSelectedClasse(null)}
            />
          );
        }
        return (
          <ClassesList
            onClasseSelect={setSelectedClasse}
            onNewClasse={() => setSelectedClasse(null)}
          />
        );

      case 'matieres':
        if (selectedMatiere !== null) {
          return (
            <MatiereForm
              matiere={selectedMatiere}
              onSave={(matiere) => {
                setSelectedMatiere(null);
                setCurrentPage('matieres');
              }}
              onCancel={() => setSelectedMatiere(null)}
            />
          );
        }
        return (
          <MatieresList
            onMatiereSelect={setSelectedMatiere}
            onNewMatiere={() => setSelectedMatiere(null)}
          />
        );

      case 'finances':
        return <FinancesList />;

      case 'notes':
        return <NotesParClasse />;

      case 'config':
        return <ConfigMain />;

      case 'config-impression':
        return <ConfigImpression />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onShowGuide={() => setShowGuide(true)}
        />
        <main className="pb-8">
          {renderContent()}
        </main>
        {showGuide && <Guide onClose={() => setShowGuide(false)} />}
      </div>
    </ToastProvider>
  );
}