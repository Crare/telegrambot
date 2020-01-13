/**
 * more info about digitraffic data: https://rata.digitraffic.fi/api/v1/
 * 
 * 
Liikennetietojen lähde Traffic Management Finland / digitraffic.fi, lisenssi CC 4.0 BY
 */


import { TargetRoute } from './TargetRoute';
import { TrainStation } from './TrainStation';
import { Train } from './Train';
import { TimeTableRow } from './TimeTableRow';

const apiurl: string = "https://rata.digitraffic.fi/api/v1/";

/**
 * Returns a list of trains (n amount of rows) for the target route.
 * @param amountOfRows how many rows of trains, default 10
 */
exports.getTrainsForRoute = (route: TargetRoute, amountOfRows: number = 10): any => {

}

/**
 * returns n amount of rows trains stopping at station.
 */
exports.getTrainsForStation = (stationNameOrShortCode: string, amountOfRows: number): any => {

}

/**
 * returns information about the station.
 */
exports.getStation = (stationNameOrShortCode: string): any => {

}

/**
 * returns a TrainStation object for given name or shorthand of station. null if not found.
 * @param stationNameOrShortCode name or a shorthandcode of the station for example: "helsinki" or "hki".
 */
const getStation = (stationNameOrShortCode: string): TrainStation => {

}

/**
 * returns a list of all trainstations.
 */
const getStations = (): TrainStation[] => {

}

/**
 * helper function for HTTP GET
 * @param url full api url.
 */
const httpGetApiCall = (url: string): any => {

}