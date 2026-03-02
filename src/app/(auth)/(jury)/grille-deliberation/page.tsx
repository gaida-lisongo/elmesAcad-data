const DashboardGrilleDeliberationPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Grille de Délibération</h1>
      <p className="text-gray-700 mb-4">
        Cette page affichera la grille de délibération pour les jurys. Vous
        pourrez consulter les résultats des étudiants et prendre des décisions
        basées sur ces résultats.
      </p>
      <p className="text-gray-700">Fonctionnalités à venir :</p>
      <ul className="list-disc list-inside text-gray-700">
        <li>Affichage des résultats par étudiant</li>
        <li>Calcul automatique des moyennes et des mentions</li>
        <li>Interface pour les jurys afin de valider les résultats</li>
      </ul>
    </div>
  );
};

export default DashboardGrilleDeliberationPage;
