// Sanitized client data — sensitive fields (uuid, apikey, apisecret) are stripped server-side
export type ClientPackage = {
  _id: string;
  titre: string;
  description: string;
  benefices: string[];
  avantages: string[];
  features: string[];
  prix: number;
  modules: string[];
  createdAt: string;
  updatedAt: string;
};

export type ClientInfo = {
  _id: string;
  nomComplet: string;
  email: string;
  logo: string;
  isActive: boolean;
};

export type ClientData = {
  _id: string;
  clientId: ClientInfo;
  packageId: ClientPackage;
  quotite: number;
  solde: number;
  createdAt: string;
  updatedAt: string;
};
