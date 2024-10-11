import axios from 'axios';

const API_BASE_URL = 'https://api.insee.fr/entreprises/sirene/V3';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY_HERE',
    'Accept': 'application/json',
  },
});

const formatAddress = (adresse) => {
  return `${adresse.numeroVoieEtablissement || ''} ${adresse.typeVoieEtablissement || ''} ${adresse.libelleVoieEtablissement || ''}, ${adresse.codePostalEtablissement || ''} ${adresse.libelleCommuneEtablissement || ''}`.trim();
};

const extractEntrepriseInfo = (etablissement) => ({
  nom_complet: etablissement.uniteLegale.denominationUniteLegale,
  siret: etablissement.siret,
  siren: etablissement.siren,
  nic: etablissement.nic,
  adresse: formatAddress(etablissement.adresseEtablissement),
  numero_tva_intracommunautaire: `FR${(etablissement.siren * 3 + 12) % 97}${etablissement.siren}`,
  dirigeants: etablissement.uniteLegale.prenomUsuelUniteLegale && etablissement.uniteLegale.nomUniteLegale
    ? `${etablissement.uniteLegale.prenomUsuelUniteLegale} ${etablissement.uniteLegale.nomUniteLegale}`
    : 'Non disponible',
  date_creation: etablissement.dateCreationEtablissement,
  tranche_effectif: etablissement.trancheEffectifsEtablissement,
  activite_principale: etablissement.activitePrincipaleEtablissement,
  nature_juridique: etablissement.uniteLegale.categorieJuridiqueUniteLegale,
});

export const searchEntreprise = async (query) => {
  try {
    const response = await axiosInstance.get('/siret', {
      params: {
        q: `siret:${query}* OR siren:${query}*`,
        nombre: 10
      }
    });
    return response.data.etablissements.map(extractEntrepriseInfo);
  } catch (error) {
    throw new Error("Impossible de trouver l'entreprise avec ce SIRET/SIREN");
  }
};

export const searchEntrepriseByName = async (query) => {
  try {
    const response = await axiosInstance.get(`/siren`, {
      params: {
        q: `denominationUniteLegale:${query}* OR nomUniteLegale:${query}*`,
        nombre: 10
      }
    });
    return response.data.unitesLegales.map(uniteLegale => {
      const etablissement = uniteLegale.periodesUniteLegale[0];
      return extractEntrepriseInfo({ ...etablissement, uniteLegale });
    });
  } catch (error) {
    throw new Error("Impossible de trouver des entreprises avec ce nom");
  }
};