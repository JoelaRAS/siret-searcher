import axios from 'axios';

// Utilisation de l'URL complète de l'API INSEE
const API_BASE_URL = 'https://api.insee.fr/entreprises/sirene/V3.11';

// Création d'une instance axios avec l'URL de base et les en-têtes
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_INSEE_API_KEY}`, // Assurez-vous que la clé API est bien définie dans l'environnement
    'Accept': 'application/json',
  },
});

// Fonction pour formater une adresse
const formatAddress = (adresse) => {
  return `${adresse.numeroVoieEtablissement || ''} ${adresse.typeVoieEtablissement || ''} ${adresse.libelleVoieEtablissement || ''}, ${adresse.codePostalEtablissement || ''} ${adresse.libelleCommuneEtablissement || ''}`.trim();
};

// Fonction pour extraire les informations d'une entreprise
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

// Fonction pour chercher une entreprise par SIRET ou SIREN
export const searchEntreprise = async (query) => {
  try {
    const response = await axiosInstance.get('/siret', {
      params: {
        q: `siret:${query}* OR siren:${query}*`,
        nombre: 10,
      }
    });
    return response.data.etablissements.map(extractEntrepriseInfo);
  } catch (error) {
    console.error('Error response:', error.response?.data || error.message); // Gestion améliorée des erreurs
    throw new Error("Impossible de trouver l'entreprise avec ce SIRET/SIREN");
  }
};

const searchEtablissementByName = async (query) => {
  try {
    const response = await axiosInstance.get('/etablissements', {
      params: {
        q: `nomUniteLegale:${query}`, // ou d'autres paramètres possibles
        nombre: 10
      }
    });

    if (response.data && response.data.etablissements) {
      return response.data.etablissements.map(extractEntrepriseInfo);
    } else {
      throw new Error("Aucune entreprise trouvée avec ce nom.");
    }
  } catch (error) {
    console.error(error.message);
    throw new Error("Impossible de trouver des entreprises avec ce nom.");
  }
};
