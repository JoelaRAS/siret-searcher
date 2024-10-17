import axios from 'axios';

const API_BASE_URL = '/api';

// Création d'une instance Axios avec l'API de l'INSEE
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_INSEE_API_KEY}`,
    'Accept': 'application/json',
  },
});

// Fonction pour formater l'adresse
const formatAddress = (adresse) => {
  return `${adresse.numeroVoieEtablissement || ''} ${adresse.typeVoieEtablissement || ''} ${adresse.libelleVoieEtablissement || ''}, ${adresse.codePostalEtablissement || ''} ${adresse.libelleCommuneEtablissement || ''}`.trim();
};

// Fonction pour extraire les informations de l'entreprise de l'API INSEE
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

// Fonction pour rechercher une entreprise via SIRET ou SIREN (utilisée pour l'INSEE)
export const searchEntreprise = async (query) => {
  try {
    console.log(`Recherche du SIRET ou SIREN : ${query}`);
    const response = await axiosInstance.get('/siret', {
      params: {
        q: `siret:${query}* OR siren:${query}*`,
        nombre: 10,
      },
    });

    // Utiliser l'extracteur de l'INSEE pour formater les données
    return response.data.etablissements.map(extractEntrepriseInfoFromINSEE);
  } catch (error) {
    console.error('Erreur lors de la recherche :', error.response?.data || error.message);
    throw new Error("Impossible de trouver l'entreprise avec ce SIRET/SIREN.");
  }
};

// Fonction pour rechercher des SIREN par nom via l'API gouv (ne fait que retourner les SIREN)
export const searchEntrepriseByTextGovApi = async (query) => {
  try {
    const response = await axios.get('https://recherche-entreprises.api.gouv.fr/search', {
      params: {
        q: query,
        per_page: 10,  // Limite à 10 résultats
      },
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results.map(result => result.siren); // Retourner une liste de SIREN
    } else {
      throw new Error("Aucune entreprise trouvée avec ce nom dans l'API de recherche.");
    }
  } catch (error) {
    console.error('Erreur lors de la recherche textuelle via l\'API gouv :', error.message);
    throw new Error("Impossible de trouver des entreprises avec ce nom.");
  }
};

// Fonction complète de recherche d'entreprises par nom puis par SIREN via l'API gouv et l'API Sirene
// Fonction utilitaire pour ajouter une temporisation (délai)

// Fonction complète de recherche d'entreprises par nom puis par SIREN via l'API gouv et l'API Sirene
export const searchEntrepriseByName = async (query) => {
  try {
    // Étape 1 : Rechercher les SIREN via l'API gouv
    const sirenList = await searchEntrepriseByTextGovApi(query);
    console.log('SIRENs trouvés via l\'API gouv :', sirenList);

    // Étape 2 : Utiliser la fonction searchEntreprise pour chaque SIREN trouvé
    const entreprises = await Promise.all(
      sirenList.map(async (siren) => {
        const result = await searchEntreprise(siren);
        return result; // Ici, result est déjà un tableau d'établissements
      })
    );

    // Aplatir le tableau pour avoir une liste simple d'établissements
    return entreprises.flat(); // Permet de gérer un tableau de tableaux
  } catch (error) {
    console.error('Erreur lors de la recherche par nom :', error.message);
    throw new Error("Impossible de trouver des entreprises avec ce nom.");
  }
};
