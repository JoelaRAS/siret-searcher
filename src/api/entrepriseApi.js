import axios from 'axios';

const API_BASE_URL = 'https://api.insee.fr/entreprises/sirene/V3';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY_HERE',
    'Accept': 'application/json',
  },
});

export const searchEntreprise = async (siret) => {
  try {
    const response = await axiosInstance.get(`/siret/${siret}`);
    const data = response.data.etablissement;
    return {
      nom_complet: data.uniteLegale.denominationUniteLegale,
      siret: data.siret,
      adresse: `${data.adresseEtablissement.numeroVoieEtablissement} ${data.adresseEtablissement.typeVoieEtablissement} ${data.adresseEtablissement.libelleVoieEtablissement}, ${data.adresseEtablissement.codePostalEtablissement} ${data.adresseEtablissement.libelleCommuneEtablissement}`
    };
  } catch (error) {
    throw new Error("Impossible de trouver l'entreprise avec ce SIRET");
  }
};

export const searchEntrepriseByName = async (name) => {
  try {
    const response = await axiosInstance.get(`/siren`, {
      params: {
        q: `denominationUniteLegale:"${name}"`,
        nombre: 10
      }
    });
    return response.data.etablissements.map(etablissement => ({
      nom_complet: etablissement.uniteLegale.denominationUniteLegale,
      siret: etablissement.siret,
      adresse: `${etablissement.adresseEtablissement.numeroVoieEtablissement} ${etablissement.adresseEtablissement.typeVoieEtablissement} ${etablissement.adresseEtablissement.libelleVoieEtablissement}, ${etablissement.adresseEtablissement.codePostalEtablissement} ${etablissement.adresseEtablissement.libelleCommuneEtablissement}`
    }));
  } catch (error) {
    throw new Error("Impossible de trouver des entreprises avec ce nom");
  }
};