import axios from 'axios';

const API_BASE_URL = 'https://api.insee.fr/entreprises/sirene/V3.11';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_INSEE_API_KEY}`,
    'Accept': 'application/json',
  },
});


const formatAddress = (adresse) => {
  return `${adresse.numeroVoieEtablissement || ''} ${adresse.typeVoieEtablissement || ''} ${adresse.libelleVoieEtablissement || ''}, ${adresse.codePostalEtablissement || ''} ${adresse.libelleCommuneEtablissement || ''}`.trim();
};


const extractEntrepriseInfoFromINSEE = (etablissement) => ({
  nom_complet: etablissement.uniteLegale.denominationUniteLegale,
  siret: etablissement.siret,
  siren: etablissement.siren,
  adresse: formatAddress(etablissement.adresseEtablissement),
  date_creation: etablissement.dateCreationEtablissement,
  tranche_effectif: etablissement.trancheEffectifsEtablissement,
  activite_principale: etablissement.activitePrincipaleEtablissement,
  nature_juridique: etablissement.uniteLegale.categorieJuridiqueUniteLegale,
});


export const searchEntreprise = async (query) => {
  try {
    console.log(`Recherche du SIRET ou SIREN : ${query}`);
    const response = await axiosInstance.get('/siret', {
      params: {
        q: `siret:${query}* OR siren:${query}*`,
        nombre: 10,
      },
    });


    return response.data.etablissements.map(extractEntrepriseInfoFromINSEE);
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
    } else {
      throw new Error("Aucune entreprise trouvée avec ce nom dans l'API de recherche.");
    }
  } catch (error) {
    console.error('Erreur lors de la recherche textuelle via l\'API gouv :', error.message);
    throw new Error("Impossible de trouver des entreprises avec ce nom.");
  }
};


export const searchEntrepriseByName = async (query) => {
  try {

    const sirenList = await searchEntrepriseByTextGovApi(query);
    console.log('SIRENs trouvés via l\'API gouv :', sirenList);


    const entreprises = await Promise.all(
      sirenList.map(async (siren) => {
        const result = await searchEntreprise(siren);
        return result; 
      })
    );


    return entreprises.flat(); 
  } catch (error) {
    console.error('Erreur lors de la recherche par nom :', error.message);
    throw new Error("Impossible de trouver des entreprises avec ce nom.");
  }
};
