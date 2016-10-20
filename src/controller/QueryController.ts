/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, ClassInformation} from "./DatasetController";
import Log from "../Util";
import {App} from "../App";



export interface Map{
    [key:string]:Array<Responsedata>;
}
export interface QueryRequest {
    GET: string[];
    WHERE: Filter; // <- "{}" should all row should return
    GROUP?:string[];            //d2 added
    APPLY?:Apply[];               //d2 added
   // ORDER: string|Order;
    ORDER?: string|AdvancedOrder;
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

export interface Apply {     //added D2
    [key: string]:ApplyToken ;
}

export interface ApplyToken{
    MAX?:string;
    MIN?:string;
    AVG?: string;
    COUNT?:string;

}
export interface AdvancedOrder {
   // dir?: "UP" | "DOWN";
    dir?: string;
    keys?: string[];
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
    courses_uuid?:string;
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

        if(( query.GROUP != undefined && query.APPLY == undefined)||(query.GROUP == undefined && query.APPLY != undefined)) {
          return false;
        }
            if (query.GROUP != undefined && query.APPLY != undefined){
                //Empty GROUP should not be valid
                if (query.GROUP.length <= 0){
                    return false;
                }
                //All keys in GROUP should be presented in GET
                for (let i of query.GROUP){
                    if (query.GET.indexOf(i) == -1){  //All keys in GROUP should be presented in GET
                        return false;
                    }
                }

                let applyArray = new Array;

                for(let apply of query.APPLY){
                    if(Object.keys(apply).includes("_")){return false}
                    applyArray.push(Object.keys(apply));
                }
                let map:Map = {};
                for( let group of query.GROUP){
                    if(!group.includes("_")){return false}
                    map[group] = [];
                }
                for( let apply of applyArray ){
                    if(map[apply]== undefined){
                        map[apply]= [];
                    }else{return false;}
                }

                //check all keys in GET should be in either GROUP or APPLY
                for(let get of query.GET){
                    if(map[get]==undefined){
                        return false;
                    }
                }


            }

            if (query.ORDER != undefined){
                if(typeof query.ORDER =="string"){
                    if(query.GET.indexOf(<string>query.ORDER)==-1) {
                        return false;
                    }

                }else{
                    for(let key of (<AdvancedOrder>query.ORDER).keys){
                        if(query.GET.indexOf(key)==-1) {
                            return false;
                        }
                    }

                }

            }

            // checked all



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
                if(item.lastIndexOf("_")!=-1) {
                    let a = item.split("_")[0];
                    if (this.datasets[a] == undefined) {
                        idarray.push(a);
                    }
                }
         }
         if(idarray.length > 0){
             return idarray;
         }


        let dataset = <Array<ClassInformation>>this.datasets[id]; //get the corresponding dataset
        let result = new Array<Responsedata>();

        try {
            for (let data of dataset) {
                if (this.helperFunctionFilter(data, query.WHERE) == true) {

                   let respondata: Responsedata = {};

                    respondata.courses_avg = data.courses_avg;
                    respondata.courses_dept = data.courses_dept;
                    respondata.courses_audit = data.courses_audit;
                    respondata.courses_fail = data.courses_fail;
                    respondata.courses_id = data.courses_id;
                    respondata.courses_instructor = data.courses_instructor;
                    respondata.courses_title= data.courses_title;
                    respondata.courses_pass = data.courses_pass;
                    respondata.courses_uuid = data.courses_uuid;
                    result.push(respondata);
                }
            }

        }catch (err){
     //       idarray.push(err.message);
            // return idarray;
        }
        if(query.GROUP!=undefined && query.APPLY!= undefined) {
            let groupedResult = this.helperFunctionGroup(result, query.GROUP);

             result = this.helperFunctionApply(groupedResult, query.APPLY);
        }
        let finalResult = new Array<Responsedata>();

        for (let data of result ){
            let r: Responsedata = {};

            for (let a of query.GET){
                r[a] = data[a]; //get the data by key
            }
            finalResult.push(r);        //finalResult is a list with only the data we want
        }

//        let groupedResult = this.helperFunctionGroup(finalResult,query.GROUP);


        if(query.ORDER != undefined){


            if(typeof query.ORDER == "string" ) {
                finalResult.sort(sortbyorderUp([<string>query.ORDER])); //sort the finalResult
            }else {

                if ((<AdvancedOrder>query.ORDER).dir == "DOWN") {
                    finalResult.sort(sortbyorderDown((<AdvancedOrder>query.ORDER).keys))
                } else {
                    finalResult.sort(sortbyorderUp((<AdvancedOrder>query.ORDER).keys));
                }
            }




                function sortbyorderUp(queryorder: string[]) {

                    return function (a: Responsedata, b: Responsedata) {
                        for(let q of queryorder) {
                            if (a[q] < b[q])
                                return -1;
                            if (a[q] > b[q])
                                return 1;
                        }
                        return 0;
                    }
                }

            function sortbyorderDown(queryorder: string[]) {

                return function (a: Responsedata, b: Responsedata) {
                    for(let q of queryorder) {
                        if (a[q] < b[q])
                            return 1;
                        if (a[q] > b[q])
                            return -1;
                    }
                    return 0;
                }
            }


        }
        return {render: query.AS, result: finalResult};  //render the finalResult according to AS
        //return {status: 'received', ts: new Date().getTime()};
    }

    public helperFunctionFilter(classes:ClassInformation, filter:Filter):boolean{
        if (filter.AND != undefined){
            let result = this.helperFunctionFilter(classes,filter.AND[0]);
            for (let i = 1; i < filter.AND.length; i++){
                result = result && this.helperFunctionFilter(classes,filter.AND[i]);
            }
            return result;
        }
        if (filter.OR != undefined){
            let result = this.helperFunctionFilter(classes,filter.OR[0]);
            for (let i = 1; i < filter.OR.length; i++){
                result = result || this.helperFunctionFilter(classes,filter.OR[i]);
            }
            return result;
        }
        if (filter.GT != undefined){
        //    console.log(filter.GT);
            let key = Object.keys(filter.GT)[0];  //e.g. "courses_avg"
        //    console.log("key:"+key);
            let id = key.split("_")[0];           //e.g. id = "courses"

        //    console.log("id: "+id);
            if (this.datasets[id] == undefined){
                console.log("GT error");
                throw new Error(id)} //check if dataset has this id
            let value = filter.GT[key];           //e.g. value = 70

            if (classes.getbykey(key) > value){
                return true;
            } return false;
        }
        if (filter.LT != undefined){
            let key = Object.keys(filter.LT)[0];  //e.g. "courses_avg"
            let id = key.split("_")[0];           //e.g. id = "courses"

            if (this.datasets[id] == undefined){
                console.log("LT error");
                throw new Error(id)} //check if dataset has this id
            let value = filter.LT[key];           //e.g. value = 70
            if (classes.getbykey(key) < value){
                return true;
            } return false;
        }
        if (filter.EQ != undefined){
            let key = Object.keys(filter.EQ)[0];  //e.g. "courses_avg"
            let id = key.split("_")[0];           //e.g. id = "courses"
            if (this.datasets[id] == undefined){
                console.log("EQ error");
                throw new Error(id)} //check if dataset has this id
            let value = filter.EQ[key];           //e.g. value = 70
            if (classes.getbykey(key) == value){
                return true;
            } return false;
        }
        if (filter.IS != undefined){
            let key = Object.keys(filter.IS)[0];  //e.g. "courses_dept"
            let id = key.split("_")[0];           //e.g. id = "courses"
            if (this.datasets[id] == undefined){
                console.log("IS error");
                throw new Error(id)} //check if dataset has this id
            let value = filter.IS[key];           //e.g. value = "adhe"
            let reg = new RegExp("^"+(value.replace(/\*/g, ".*"))+"$"); //^ matches beginning of input, $ matches end of input
            if (reg.test(<string>classes.getbykey(key)) ){   //cp* reg  //test() executes a search for a match between
                return true;                                            //a regular expression and a specified string
            } return false;
        }
        if (filter.NOT != undefined){
            let result = this.helperFunctionFilter(classes,filter.NOT);
            return !result;
        }
        return true;
    }

    public helperFunctionGroup(FilteredData:Responsedata[], groups:string[]){

     let map:Map= {};
       for (let data of FilteredData){
           let a = "";
           for (let group of groups){
               a = a+ data[group];
           }
           if(map[a]==undefined){
               map[a] = [];
           }
           map[a].push(data);
       }

        return map;
    }


    public helperFunctionApply(GroupedData:Map, applys:Apply[]){

        let result = new Array;
        for(let key in GroupedData){
         result.push(    this.helperFunctionApplytoken(GroupedData[key],applys));
        }
       return result;
    }

    public helperFunctionApplytoken(GroupedData:Responsedata[],applys:Apply[]) {
        let result = GroupedData[0];

        for(let apply of applys ) {
            let a = Object.keys(apply)[0];
            let token = apply[a];
            if (token.AVG != undefined) {

                let sum = 0;
                for (let data of GroupedData) {
                    sum = sum + <number>data[token.AVG];
                }
                let avg = +(sum / GroupedData.length).toFixed(2);
                result[a]= avg;
                continue;
            }
            if (token.MAX != undefined){

                let max = 0;
                for(let data of GroupedData ){
                    if( <number>data[token.MAX]> max){
                        max =  <number>data[token.MAX]; }

                }
                result[a]= max;
                continue;
            }

            if (token.MIN != undefined){

                let min = Number.MAX_VALUE;
                for(let data of GroupedData ){
                    if( <number>data[token.MIN]< min){
                        min =  <number>data[token.MIN]; }

                }
                result[a]= min;
                continue;
            }

            if (token.COUNT != undefined){
                let map:Map = {};

                let count = 0;
                for(let data of GroupedData ){
                    if (map[data[token.COUNT]]== undefined){
                        count++
                        map[data[token.COUNT]]=[];
                    }
                }
                result[a]= count;
                continue;
            }


        }
        return result;
    }






}
