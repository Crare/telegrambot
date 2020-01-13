
/**
  Liikennepaikat

    Required passengerTraffic: boolean Info Onko liikennepaikalla kaupallista matkustajaliikennettä
    Required countryCode: string Info Liikennepaikan maatunnus
    Required stationName: string Info Liikennepaikan nimi
    Required stationShortCode: string Info Liikennepaikan lyhenne
    Required stationUICCode: 1-9999 Info Liikennepaikan maakohtainen UIC-koodi
    Required latitude: decimal Info Liikennepaikan latitude “WGS 84”-muodossa
    Required longitude: decimal Info Liikennepaikan longitudi “WGS 84”-muodossa
    Required type: string Info Liikennepaikan tyyppi. STATION = asema, STOPPING_POINT = seisake, TURNOUT_IN_THE_OPEN_LINE = linjavaihde
 */
export class TrainStation {
  passengerTraffic: boolean;
  countryCode: string;
  stationName: string;
  stationShortCode: string;
  stationUICCode: number;
  latitude: number;
  longitude: number;
  type: string; // TODO: enum
}