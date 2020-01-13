import { TrainReady } from './TrainReady';
import { Cause } from './Cause';

/**
Required timeTableRows Info Kuvaa saapumisia ja lähtöjä liikennepaikoilta. Järjestetty reitin mukaiseen järjestykseen.
    Required trainStopping true,false Info Pysähtyykö juna liikennepaikalla
    Required stationShortCode: string Info Aseman lyhennekoodi
    Required stationcUICCode: 1-9999 Info Aseman UIC-koodi
    Required countryCode: “FI”, “RU”
    Required type: “ARRIVAL” tai “DEPARTURE” Info Pysähdyksen tyyppi
    Optional commercialStop: boolean Info Onko pysähdys kaupallinen. Annettu vain pysähdyksille, ei läpiajoille. Mikäli junalla on osaväliperumisia, saattaa viimeinen perumista edeltävä pysähdys jäädä virheellisesti ei-kaupalliseksi.
    Optional commercialTrack: string Info Suunniteltu raidenumero, jolla juna pysähtyy tai jolta se lähtee. Raidenumeroa ei saada junille, joiden lähtöön on vielä yli 10 päivää. Operatiivisissa häiriötilanteissa raide voi olla muu.
    Required cancelled: true/false Info Totta, jos lähtö tai saapuminen on peruttu
    Required scheduledTime: datetime Info Aikataulun mukainen pysähtymis- tai lähtöaika
    Optional liveEstimateTime: datetime Info Ennuste. Tyhjä jos juna ei ole matkalla
    Optional estimateSource: datetime Info Ennusteen lähde. Lisätietoa lähteistä täältä.
    Optional unknownDelay: boolean Info Jos ennustetta ei voida antaa luotettavasti, liikenteenohjaaja voi kytkeä unknownDelay-bitin päälle. Bitti tarkoittaa, että juna on myöhässä, mutta ei osata kertoa kuinka paljon. Lisätietoa: https://www.liikennevirasto.fi/-/juna-myohassa-eika-arviota-lahtoajasta-asemien-nayttotaulut-kertovat-taman-pian-uudella-tavalla
    Optional actualTime: datetime Info Aika jolloin juna saapui tai lähti asemalta
    Optional differenceInMinutes: integer Info Vertaa aikataulun mukaista aikaa ennusteeseen tai toteutuneeseen aikaan ja kertoo erotuksen minuutteina
    Required causes Info Syytiedot. Kuvaavat syitä miksi juna oli myöhässä tai etuajassa pysähdyksellä. Kaikkia syyluokkia ja -tietoja ei julkaista.
        Required categoryCodeId Info Yleisen syyluokan yksilöivä tunnus. Lista syyluokista löytyy osoitteesta metadata/cause-category-codes
        Required categoryCode Info Yleisen syyluokan koodi. Huom. ei yksilöivä.
        Optional detailedCategoryCodeId Info Tarkemman syykoodin yksilöivä tunnus. Lista syykoodeista löytyy osoitteesta täältä
        Optional detailedCategoryCode Info Tarkempi syykoodin koodi. Huom. ei yksilöivä
        Optional thirdCategoryCodeId Info Kolmannen tason syykoodin tunnus.
        Optional thirdCategoryCode Info Kolmannen tason syykoodin koodi. Huom. ei yksilöivä
    Optional trainReady Info Junan lähtövalmius. Operaattorin tulee tehdä lähtövalmiusilmoitus liikenteenohjaajalle aina kun junan kokoonpanovaihtuu tai se lähtee ensimmäiseltä pysäkiltään.
        Required source Info Tapa, jolla lähtövalmiusilmoitus on tehty.
        Required accepted Info Onko lähtövalmiusilmoitus hyväksytty.
        Required timestamp Info Aika jolloin lähtövalmiusilmoitus on päätetty.
 */
export class TimeTableRow {
  trainStopping: boolean;
  stationShortCode: string;
  stationUICCode: number;
  countryCode: string; // TODO: enum
  type: string; // TODO: enum
  commercialStop: boolean;
  commercialTrack: string;
  cancelled: boolean;
  scheduledTime: Date;
  liveEstimateTime: Date;
  unknownDelay: boolean;
  actualTime: Date;
  differenceInMinutes: number;
  causes: Cause[];
  trainReady: TrainReady;
}