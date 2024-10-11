import axios from 'axios';

export const searchEntreprise = async (siret) => {
  try {
    const response = await axios.get(`https://api.insee.fr/entreprises/sirene/V3/siret/${siret}`);
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