/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, ClassInformation} from "./DatasetController";
import Log from "../Util";

export interface QueryRequest {
    GET: string[];
    WHERE:  Filter| {};
    ORDER: string;
    AS: string;
}

export interface Mcomparator{   //added Math comparator
    [key: string]: number;
}

export interface Scomparator{   //added String comparator
    [key: string]: string;
}

export interface Filter {   //added
    AND?:Filter[];          // ? means can have or may not have
    OR?:Filter[];
    LT?:Mcomparator;        // less than
    GT?:Mcomparator;        // greater than
    EQ?:Mcomparator;        // equal to
    IS?:Scomparator;
    NOT?:Filter;
}

export interface Responsedata {   //added
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
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0 && query.AS != undefined && query.GET != undefined && query.WHERE != undefined){
            if (query.ORDER != undefined){
                if (query.GET.indexOf(query.ORDER) == -1){  //indexOf() returns the position of the first occurence of
                    return false;                           //a specified value in a string
                }                                           //indexOf()check if the string in ORDER is in GET
            }                                               //it will return -1 if the string in ORDER is not in GET
            return true;
        }
        return false;
    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');
        // TODO: implement this

        // return 424 if the query failed
        let id = query.GET[0].split("_")[0];  //e.g. courses_dept -> id = courses, key = dept
        let idarray:any[] = [];
        for(let item of query.GET) {
            if (this.datasets[id] == undefined) {
                idarray.push(id);
            }
        }
        if(idarray.length > 0){
            return idarray;
        }


        let dataset = <Array<ClassInformation>>this.datasets[id]; //get the corresponding dataset
        let result = new Array<ClassInformation>();

        try {
            for (let data of dataset) {
                if (this.helperFunction(data, query.WHERE) == true) {
                    result.push(data);
                }
            }
        }catch (err){
            idarray.push(err.message);
            return idarray;
        }

        let finalResult = new Array<Responsedata>();
        for (let data of result){
            let r: Responsedata = {};

            for (let a of query.GET){
               r[a] = data.getbykey(a); //get the data by key
            }
            finalResult.push(r);        //finalResult is a list with only the data we want
        }
        if(query.ORDER != undefined){
            finalResult.sort(sortbyorder(query.ORDER)); //sort the finalResult

            function sortbyorder(queryorder:string) {
                let sortOrder = 1;

                return function (a:Responsedata, b:Responsedata) {
                    if(a[queryorder] < b[queryorder])
                        return -1;
                    if(a[queryorder] == b[queryorder])
                        return 0;
                    return 1;
                }
            }
        }
        return {render: query.AS, result: finalResult};  //render the finalResult according to AS
        //return {status: 'received', ts: new Date().getTime()};
    }

    public helperFunction(classes:ClassInformation, filter:Filter):boolean{
        if (filter.AND != undefined){
            let result = this.helperFunction(classes,filter.AND[0]);
            for (let i = 1; i < filter.AND.length; i++){
                result = result && this.helperFunction(classes,filter.AND[i]);
            }
            return result;
        }
        if (filter.OR != undefined){
            let result = this.helperFunction(classes,filter.OR[0]);
            for (let i = 1; i < filter.OR.length; i++){
                result = result || this.helperFunction(classes,filter.OR[i]);
            }
            return result;
        }
        if (filter.GT != undefined){
            let key = Object.keys(filter.GT)[0];  //e.g. "courses_avg"
            let id = key.split("_")[0];           //e.g. id = "courses"
            if (this.datasets[id] == undefined){throw new Error(id)} //check if dataset has this id
            let value = filter.GT[key];           //e.g. value = 70
            if (classes.getbykey(key) > value){
                return true;
            } return false;
        }
        if (filter.LT != undefined){
            let key = Object.keys(filter.LT)[0];  //e.g. "courses_avg"
            let id = key.split("_")[0];           //e.g. id = "courses"
            if (this.datasets[id] == undefined){throw new Error(id)} //check if dataset has this id
            let value = filter.LT[key];           //e.g. value = 70
            if (classes.getbykey(key) < value){
                return true;
            } return false;
        }
        if (filter.EQ != undefined){
            let key = Object.keys(filter.EQ)[0];  //e.g. "courses_avg"
            let id = key.split("_")[0];           //e.g. id = "courses"
            if (this.datasets[id] == undefined){throw new Error(id)} //check if dataset has this id
            let value = filter.EQ[key];           //e.g. value = 70
            if (classes.getbykey(key) == value){
                return true;
            } return false;
        }
        if (filter.IS != undefined){
            let key = Object.keys(filter.IS)[0];  //e.g. "courses_dept"
            let id = key.split("_")[0];           //e.g. id = "courses"
            if (this.datasets[id] == undefined){throw new Error(id)} //check if dataset has this id
            let value = filter.IS[key];           //e.g. value = "adhe"
            let reg = new RegExp("^"+(value.replace(/\*/g, ".*"))+"$"); //^ matches beginning of input, $ matches end of input
            if (reg.test(<string>classes.getbykey(key)) ){   //cp* reg  //test() executes a search for a match between
                return true;                                            //a regular expression and a specified string
            } return false;
        }
        if (filter.NOT != undefined){
            let result = this.helperFunction(classes,filter.NOT);
            return !result;
        }
        return true;
    }
}
