/**
Required causes Info Syytiedot. Kuvaavat syitä miksi juna oli myöhässä tai etuajassa pysähdyksellä. Kaikkia syyluokkia ja -tietoja ei julkaista.

    Required categoryCodeId Info Yleisen syyluokan yksilöivä tunnus. Lista syyluokista löytyy osoitteesta metadata/cause-category-codes
    Required categoryCode Info Yleisen syyluokan koodi. Huom. ei yksilöivä.
    Optional detailedCategoryCodeId Info Tarkemman syykoodin yksilöivä tunnus. Lista syykoodeista löytyy osoitteesta täältä
    Optional detailedCategoryCode Info Tarkempi syykoodin koodi. Huom. ei yksilöivä
    Optional thirdCategoryCodeId Info Kolmannen tason syykoodin tunnus.
    Optional thirdCategoryCode Info Kolmannen tason syykoodin koodi. Huom. ei yksilöivä
 */
export class Cause {
  categoryCodeId: string; // TODO: enum
  categoryCode: string; // TODO: enum
  detailedCategoryCodeId: string;
  detailedCategoryCode: string;
  thirdCategoryCodeId: string;
  thirdCategoryCode: string;
}