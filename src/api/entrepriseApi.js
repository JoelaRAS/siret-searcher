import axios from 'axios';
import { tokenService } from './tokenService';

const API_BASE_URL = 'https://api.insee.fr/entreprises/sirene/V3.11';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await tokenService.getValidToken();
  config.headers.Authorization = `Bearer ${token}`;
  console.log('Token utilisé pour la requête:', token);
  return config;
});

const formatAddress = (adresse) => {
  return `${adresse.numeroVoieEtablissement || ''} ${adresse.typeVoieEtablissement || ''} ${adresse.libelleVoieEtablissement || ''}, ${adresse.codePostalEtablissement || ''} ${adresse.libelleCommuneEtablissement || ''}`.trim();
};

const extractEntrepriseInfoFromINSEE = (etablissement) => {
  const entrepriseInfo = {
    nom_complet: etablissement.uniteLegale.denominationUniteLegale,
    siret: etablissement.siret,
    siren: etablissement.siren,
    adresse: formatAddress(etablissement.adresseEtablissement),
    date_creation: etablissement.dateCreationEtablissement,
    tranche_effectif: etablissement.trancheEffectifsEtablissement?.trancheEffectifsEtablissement || 'Non disponible',
    activite_principale: etablissement.activitePrincipaleEtablissement?.libelleActivitePrincipaleEtablissement || 'Non disponible',
    nature_juridique: etablissement.uniteLegale.categorieJuridiqueUniteLegale,
  };

  console.log('Informations extraites de l\'INSEE:', entrepriseInfo);
  return entrepriseInfo;
};

export const searchEntreprise = async (query) => {
  try {
    console.log(`Recherche du SIRET ou SIREN : ${query}`);
    const response = await axiosInstance.get('/siret', {
      params: {
        q: `siret:${query}* OR siren:${query}*`,
        nombre: 10,
      },
    });

    const entreprises = response.data.etablissements.map(extractEntrepriseInfoFromINSEE);
    console.log('Entreprises trouvées:', entreprises);
    return entreprises;
  } catch (error) {
    console.error('Erreur lors de la recherche :', error.response?.data || error.message);
    throw new Error("Impossible de trouver l'entreprise avec ce SIRET/SIREN.");
  }
};

export const searchEntrepriseByTextGovApi = async (query) => {
  try {
    const response = await axios.get('https://recherche-entreprises.api.gouv.fr/search', {
      params: {
        q: query,
        per_page: 10,
      },
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results.map(result => result.siren);
    }
    throw new Error("Aucune entreprise trouvée avec ce nom");
  } catch (error) {
    console.error('Erreur lors de la recherche via l\'API gouv :', error.message);
    throw new Error("Impossible de rechercher des entreprises pour le moment");
  }
};

export const searchEntrepriseByName = async (query) => {
  try {
    const sirenList = await searchEntrepriseByTextGovApi(query);
    console.log('SIRENs trouvés via l\'API gouv :', sirenList);

    const entreprises = await Promise.all(
      sirenList.map(async (siren) => {
        try {
          const result = await searchEntreprise(siren);
          return result;
        } catch (error) {
          console.warn(`Erreur pour le SIREN ${siren}:`, error);
          return null;
        }
      })
    );

    const validEntreprises = entreprises.flat().filter(Boolean);
    console.log('Entreprises trouvées:', validEntreprises);
    return validEntreprises;
  } catch (error) {
    console.error('Erreur lors de la recherche par nom :', error);
    throw new Error("Impossible de trouver des entreprises avec ce nom.");
  }
};