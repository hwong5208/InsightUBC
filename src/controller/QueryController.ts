/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, ClassInformation} from "./DatasetController";
import Log from "../Util";

export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    ORDER: string;
    AS: string;
}

export interface Mcomparator{
    [key: string]: number;
}

export interface Scomparator{
    [key: string]:string;
}

export interface Filter {
    AND?:Filter[];
    OR?:Filter[];
    LT?:Mcomparator;
    GT?:Mcomparator;
    EQ?:Mcomparator;
    IS?:Scomparator;
    NOT?:Filter;
}

export interface QueryResponse {
}

export default class QueryController {
    private datasets: Datasets = null;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        return false;
    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        // TODO: implement this
        // By Christine

        let get_query = query.GET;     // array

        let where_query = query.WHERE; // array


        query.WHERE

        let post_query = query.ORDER; //

        // By Christine

        return {status: 'received', ts: new Date().getTime()};
    }

    public helper(classes:ClassInformation, filter:Filter):boolean{
        if (filter.AND != undefined){
            let result = this.helper(classes,filter.AND[0]);
            for (let i = 1; i < filter.AND.length; i++){
                result = result && this.helper(classes,filter.AND[i]);
            }
            return result;
        }
        if (filter.OR != undefined){
            let result = this.helper(classes,filter.OR[0]);
            for (let i = 1; i < filter.OR.length; i++){
                result = result || this.helper(classes,filter.OR[i]);
            }
            return result;
        }
        if (filter.GT != undefined){
            let key = Object.keys(filter.GT)[0];
            let value = filter.GT[key];
            if (classes.getbykey(key) > value ){
                return true;
            } return false;

        }
        if (filter.LT != undefined){
            let key = Object.keys(filter.LT)[0];
            let value = filter.LT[key];
            if (classes.getbykey(key) < value ){
                return true;
            } return false;

        }
        if (filter.EQ != undefined){
            let key = Object.keys(filter.EQ)[0];
            let value = filter.EQ[key];
            if (classes.getbykey(key) == value ){
                return true;
            } return false;

        }
        if (filter.IS != undefined){
            let key = Object.keys(filter.IS)[0];
            let value = filter.IS[key];
            if (classes.getbykey(key) == value ){
                return true;
            } return false;

        }
        return true;
    }
}
