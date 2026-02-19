import { fetchUsers } from "@/app/actions/user.actions";
import SettingsClient from "@/app/(auth)/settings/client";

const SettingPage = async () => {
  const result = await fetchUsers();
  const users = result.success && result.data ? result.data : [];

  return <SettingsClient initialUsers={users} />;
}

export default SettingPage;