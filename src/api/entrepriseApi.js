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

export const searchEntrepriseByName = async (query) => {
  try {
    // Utilisation de la route correcte pour la recherche par nom d'entreprise
    const response = await axiosInstance.get(`/unites_legales`, {
      params: {
        q: `denominationUniteLegale:${query} OR nomUniteLegale:${query}`, // Correctement formaté pour une recherche par nom
        nombre: 10
      }
    });

    if (response.data && response.data.unitesLegales) {
      return response.data.unitesLegales.map(uniteLegale => {
        const etablissement = uniteLegale.periodesUniteLegale?.[0];
        if (!etablissement) {
          throw new Error("Aucune période d'activité trouvée pour cette entreprise.");
        }
        return extractEntrepriseInfo({ ...etablissement, uniteLegale });
      });
    } else {
      throw new Error("Aucune entreprise trouvée avec ce nom.");
    }
  } catch (error) {
    console.error(error.message);
    throw new Error("Impossible de trouver des entreprises avec ce nom.");
  }
};
