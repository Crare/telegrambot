import { TimeTableRow } from './TimeTableRow';

/**
Required trainNumber: 1-99999 Info Junan numero. Esim junan “IC 59” junanumero on 59
Required departureDate: date Info Junan ensimmäisen lähdön päivämäärä
Required operatorUICCode: 1-9999 Info Junan operoiman operaattorin UIC-koodi
Required operatorShortCode: vr, vr-track, destia, … Info Lista operaattoreista löytyy täältä.
Required trainType: IC, P, S, …
Required trainCategory: lähiliikenne, kaukoliikenne, tavaraliikenne, …
Optional commuterLineID: Z, K, N….
Required runningCurrently: true/false Info Onko juna tällä hetkellä kulussa
Required cancelled: true/false Info Totta, jos junan peruminen on tehty 10 vuorokauden sisällä. Yli 10 vuorokautta sitten peruttuja junia ei palauteta rajapinnassa laisinkaan.
Required version: positive integer Info Versionumero, jossa juna on viimeksi muuttunut
Required timetableType: REGULAR tai ADHOC. Info Kertoo onko junan aikataulu haettu säännöllisenä (REGULAR) vai kiireellisenä yksittäistä päivää koskevana (ADHOC).
Required timetableAcceptanceDate: datetime. Info Ajanhetki jolloin viranomainen on hyväksynyt junan aikataulun.
Optional deleted: true,false Info Vain /trains/version -rajapinnassa käytetty attribuutti, joka kertoo onko juna poistettu eli peruttu yli kymmenen päivää ennen lähtöä.
Required timeTableRows Info Kuvaa saapumisia ja lähtöjä liikennepaikoilta. Järjestetty reitin mukaiseen järjestykseen.
 */
export class Train {
  trainNumber: number;
  departureDate: Date;
  operatorUICCode: number;
  operatorShortCode: string; // TODO: enum operator
  trainType: string // TODO: enum trainType
  trainCategory: string; // TODO: enum trainCategory
  commuterLineId: string; // TODO enum commuterLineId
  runningCurrently: boolean;
  cancelled: boolean;
  version: number;
  timetableType: string; // TODO: enum timetableType: REGULAR tai ADHOC.
  timetableAcceptanceDate: Date;
  deleted: boolean;
  timeTableRows: TimeTableRow[];
}