import { fetchUsers } from "@/app/actions/user.actions";

const SettingPage = async () => {
  const result = await fetchUsers();
  const users = result.success ? result.data : [];

  console.log("Fetched users:", users);

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Paramètres du compte</h1>
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Informations personnelles</h2>
            <p className="text-gray-600 mb-1">Nom complet: John Doe</p>
            <p className="text-gray-600 mb-1">Email: ze </p>
            <p className="text-gray-600 mb-1">Rôle: Étudiant</p>
        </div>
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Préférences</h2>
            <p className="text-gray-600 mb-1">Langue: Français</p>
            <p className="text-gray-600 mb-1">Notifications: Activées</p>
        </div>
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Sécurité</h2>
            <p className="text-gray-600 mb-1">Dernière connexion: 2024-06-01 14:30</p>
            <p className="text-gray-600 mb-1">Changer le mot de passe</p>
        </div>
    </div>
  );
}

export default SettingPage;