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

export interface Responsedata {
    courses_dept?:string;
    courses_id?:string;
    courses_avg?:number;
    courses_instructor?:string;
    courses_title?:string;
    courses_pass?:number;
    courses_fail?:number;
    courses_audit?:number;
    [key: string]:string|number;
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

        let id = query.GET[0].split("_")[0];
        let dataset = this.datasets[id];
        let result = new Array<ClassInformation>();

        for (let data of dataset){
            if(this.helper(data, query.WHERE) == true){
                result.push(data);
            }
        }
        let b = new Array<Responsedata>();
        for (let data of result){
            let r :Responsedata={};

            for (let a of query.GET){
               r[a] = data.getbykey(a);
            }
            b.push(r);                      // b = a shorter list
        }
        if(query.ORDER != undefined){
            b.sort(sortbyorder(query.ORDER));

            function sortbyorder(queryorder:string) {
                var sortOrder = 1;

                return function (a,b) {
                    if(a[queryorder] < b[queryorder])
                        return -1;
                    if(a[queryorder] == b[queryorder])
                        return 0;
                    return 1;
                }
            }
        }


        return {render: query.AS, result: b};
        // By Christine

        //return {status: 'received', ts: new Date().getTime()};
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
            if (classes.getbykey(key) == value ){   //cp* reg
                return true;
            } return false;

        }
        if (filter.NOT != undefined){
            let result = this.helper(classes,filter.NOT);
            for (let i = 1; i < filter.AND.length; i++){
                result = result && this.helper(classes,filter.AND[i]);
            }
            return !result;
        }

        return true;
    }
}
