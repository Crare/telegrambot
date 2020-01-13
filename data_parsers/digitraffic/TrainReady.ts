/**
 Optional trainReady Info Junan lähtövalmius. Operaattorin tulee tehdä lähtövalmiusilmoitus liikenteenohjaajalle aina kun junan kokoonpanovaihtuu tai se lähtee ensimmäiseltä pysäkiltään.
    Required source Info Tapa, jolla lähtövalmiusilmoitus on tehty.
    Required accepted Info Onko lähtövalmiusilmoitus hyväksytty.
    Required timestamp Info Aika jolloin lähtövalmiusilmoitus on päätetty.
 */
export class TrainReady {
  source: string;
  accepted: boolean;
  timestamp: Date;
}