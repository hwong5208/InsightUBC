/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import fs = require('fs');
import parse5 = require('parse5');
import {ASTNode} from "parse5";
import http = require('http');

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
}

export class ClassInformation {

    courses_dept:string;
    courses_id:string;
    courses_avg:number;
    courses_instructor:string;
    courses_title:string;
    courses_pass:number;
    courses_fail:number;
    courses_audit:number;
    courses_uuid:string;
    courses_year:number;
    courses_size:number;
        [key:string]:any;

    constructor(){
        this.courses_dept = null;
        this.courses_id = null;
        this.courses_avg = null;
        this.courses_instructor = null;
        this.courses_title = null;
        this.courses_pass = null;
        this.courses_fail = null;
        this.courses_audit = null;
        this.courses_uuid = null;
        this.courses_year = null;
        this.courses_size = null;
            }

    setCourse_dept(dept:string){this.courses_dept = dept};
    setCourse_id(i:string){this.courses_id = i};
    setCourse_avg(a:number){this.courses_avg = a};
    setCourse_instructor(nm:string){this.courses_instructor = nm};
    setCourse_title(t:string){this.courses_title = t};
    setCourse_pass(p:number){this.courses_pass = p};
    setCourse_fail(f:number){this.courses_fail = f};
    setCourse_audit(a:number){this.courses_audit = a};
    setCourse_uuid(i:string){this.courses_uuid = i};
    setCourse_year(y:number){ this.courses_year = y};
    setCourse_size(s:number){ this.courses_size = s};

}

export interface RoomInformation{
    rooms_fullname:string;
    rooms_shortname: string;
    rooms_number: string;
    rooms_name: string;
    rooms_address: string;
    rooms_lat: number;
    rooms_lon: number;
    rooms_seats: number;
    rooms_type: string;
    rooms_furniture: string;
    rooms_href: string;
    [key:string]:string|number;

}

export interface BuildingInformation{
    rooms_fullname:string;
    rooms_shortname: string;
    rooms_address: string;
    rooms_lat: number;
    rooms_lon: number;
}

export interface RInformation{
    rooms_seats: number;
    rooms_type: string;
    rooms_furniture: string;
    rooms_href: string;
    rooms_number:string;
}



interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class DatasetController {

    private datasets: Datasets = {};

    constructor() {

        Log.trace('DatasetController::init()');
    }
    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */


    public getDataset(id: string): any {
        // TODO: this should check if the dataset is on disk in ./data if it is not already in memory.

        if (this.datasets[id]!=undefined){
            return this.datasets[id];
        }
        fs.readFile("./data/"+id, function read(err, data) {  // read from disk
            if (err) {
                return null;
            }
            this.datasets[id]= data;
            return data;
        });
    }
    /*
     public getDataset(id: string): any {

     return this.datasets[id];
     }
     */

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk

        if (Object.keys(this.datasets).length === 0) {  //if datasets does not have any keys, it is empty
            let fileNames = fs.readdirSync('./data');  //returns an array of file names
            for (let f of fileNames) {
                let data = fs.readFileSync('./data/' + f, 'utf-8');  //returns contents of file
                //console.log(data);
                let id = f;
                this.datasets[id] = JSON.parse(data);
            }
        }

        return this.datasets;
    }

    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    public process(id: string, data: any): Promise<boolean> {
        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;  // inside the function being passed into the new Promise, this object becomes
                          // the function, you could not access to this.datasets or this.getDatasets(),
                          // so assigning that to this allows you to call that.datasets
        if(id=="rooms"){

            return new Promise(function (fulfill, reject) {
                try {
                    let myZip = new JSZip();
                    myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                        Log.trace('DatasetController::process(..) - unzipped');

                        // TODO: iterate through files in zip (zip.files)
                        // The contents of the file will depend on the id provided. e.g.,
                        // some zips will contain .html files, some will contain .json files.
                        // You can depend on 'id' to differentiate how the zip should be handled,
                        // although you should still be tolerant to errors.
                        let buildings:BuildingInformation[];
                        if(zip.file("index.htm")== undefined){ reject(true)}else{

                            zip.file("index.htm").async("string").then(function (data:string) { //unzip file
                                let pnode = parse5.parse(data); //tree structure

                                buildings = that.parseBuilding(pnode);
                                return that.getlatlonarray(buildings);

                            }).then(function(buildingarray:BuildingInformation[] ){

                                let rooms: Datasets ={};

                                let promises:any[] = [];
                                for(let file in zip.files){

                                    if(zip.file(file)!=null){

                                      promises.push(  zip.file(file).async("string"));
                                    }
                                }


                                Promise.all(promises).then(function (data:string[]) {

                                    let RoomsMap:Datasets={};

                                    let buildingsMap:Datasets={};

                                    for(let building of buildingarray ){

                                        buildingsMap[building.rooms_shortname] = building;

                                    }

                                    let processedDataArray:RoomInformation[] =[];
                                    for( let room of data){
                                        let pnode = parse5.parse(room);
                                        let roomarray:RInformation[] =  that.parsehtmlRoom(pnode);

                                        if(roomarray !=undefined && roomarray.length != 0){
                                        for(let a of roomarray ){
                                            if(a.rooms_href!= undefined){
                                            let index = a.rooms_href.lastIndexOf("/");
                                            let c = a.rooms_href.substring(index+1);
                                            let d = c.indexOf("-");
                                            let e = c.substring(0,d);
                                            if( buildingsMap[e]!= undefined ) {
                                                let building = <BuildingInformation>buildingsMap[e];
                                                let processedData: RoomInformation = {
                                                    rooms_fullname: building.rooms_fullname,
                                                    rooms_shortname: building.rooms_shortname,
                                                    rooms_number: a.rooms_number,
                                                    rooms_name: building.rooms_shortname + "_" + a.rooms_number,
                                                    rooms_address: building.rooms_address,
                                                    rooms_lat: building.rooms_lat,
                                                    rooms_lon: building.rooms_lon,
                                                    rooms_seats: a.rooms_seats,
                                                    rooms_type: a.rooms_type,
                                                    rooms_furniture: a.rooms_furniture,
                                                    rooms_href: a.rooms_href

                                                }

                                                processedDataArray.push(processedData);
                                            }
                                            }

                                        }}




                                    }
                                        if(that.datasets[id] == undefined){
                                            that.save(id, processedDataArray);
                                            fulfill(true);
                                        }else{
                                            that.save(id, processedDataArray);
                                            fulfill(false);
                                        }



                            }




                            )



                            }).catch(function (err) {
                                reject(err);
                            });

                        }
                    }).catch(function (err) {
                        Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                        reject(err);
                    });
                } catch (err) {
                    Log.trace('DatasetController::process(..) - ERROR: ' + err);
                    reject(err);
                }
            });



        }else{       return new Promise(function (fulfill, reject) {
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.

                    let processedDataset:any = [];
                    //  let folder: JSZip = zip.folder(id);
                    let promises:any[] = [];
                    for(let file in zip.files){
                        // console.log(file);
                        if(zip.file(file)!=null){
                            promises.push(zip.file(file).async("string"));
                        }
                    }
                    Promise.all(promises).then(function (data) {

                        for(let x of data){
                            //console.log(x);
                            let a = JSON.parse(x)["result"];
                            //console.log(a);
                            if(a == undefined){reject(true)}
                            for (let i in a) {

                                let b = new ClassInformation();
                                b.setCourse_dept(a[i].Subject);
                                b.setCourse_id(a[i].Course);
                                b.setCourse_avg(a[i].Avg);
                                b.setCourse_instructor(a[i].Professor);
                                b.setCourse_title(a[i].Title);
                                b.setCourse_pass(a[i].Pass);
                                b.setCourse_fail(a[i].Fail);
                                b.setCourse_audit(a[i].Audit);
                                b.setCourse_uuid(<string>a[i].id);
                                b.setCourse_size(a[i].Pass +a[i].Fail);
                                if(a[i].Section == "overall"){ b.setCourse_year(1900)}
                                else{
                                    b.setCourse_year(+a[i].Year);
                                }

                                processedDataset.push(b);
                            }
                        };


                        if(that.datasets[id] == undefined){
                            that.save(id, processedDataset);
                            fulfill(true);
                        }else{
                            that.save(id, processedDataset);
                            fulfill(false);
                        }
                    }).catch(function (err) {
                        reject(err);
                    });
                }).catch(function (err) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(err);
            }
        });}



    }

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string, processedDataset: any) {
        // add it to the memory model

        this.datasets[id] = processedDataset;
        console.log("Saving processedDataset");
        // TODO: actually write to disk in the ./data directory
        // create the './data' folder if it doesn't exist
        // console.log( fs.lstat('/'+id));
        let dir = './data/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFile('./data/' + id, JSON.stringify(processedDataset));

        // writeFile - asynchronously writes data to a file, replacing the file if it already exists.
    }   // stringify - Converts a JavaScript value to a JavaScript Object Notation (JSON) string.

    public deleteDataSets(id:string){
        this.datasets[id] = undefined;
    }

    public parseBuilding(pnode:ASTNode ): BuildingInformation[] {

        let buildingArray:any = [];
        if(pnode.nodeName =="tbody" ){
            for( let cnode of pnode.childNodes){
                if(cnode.nodeName=="tr"){
                    let buildingCode :string;
                    let title: string;
                    let buildingAddress: string;
                    for(let ccnode of cnode.childNodes){
                        if(ccnode.nodeName=="td" && ccnode.attrs[0].value== "views-field views-field-field-building-code" ){
                            buildingCode = ccnode.childNodes[0].value.trim();
                        }
                        if(ccnode.nodeName=="td" && ccnode.attrs[0].value== "views-field views-field-title" ){
                            for( let cccnode of ccnode.childNodes){
                                if(cccnode.nodeName== "a"){
                                    title = cccnode.childNodes[0].value.trim();
                                }
                            }

                        }
                        if(ccnode.nodeName=="td" && ccnode.attrs[0].value== "views-field views-field-field-building-address"  ){
                            buildingAddress = ccnode.childNodes[0].value.trim();
                        }

                    }
                    let building:BuildingInformation = {
                        rooms_fullname : title,
                        rooms_shortname: buildingCode,
                        rooms_address: buildingAddress,
                        rooms_lat: 0,
                        rooms_lon: 0
                    };
                    buildingArray.push(building);
                }
            }




            return buildingArray;
        }else{
           if(pnode.childNodes!= undefined) {
               for (let child of pnode.childNodes) {
                   let c = this.parseBuilding(child);
                   if (c != undefined) {
                       return c;
                   }
               }
           }
            return undefined
        }
    }

    public parsehtmlRoom(pnode:ASTNode): RInformation[]{

        let RoomArray:any[] = [];
        if(pnode.nodeName =="tbody" ){
            for( let cnode of pnode.childNodes){
                if(cnode.nodeName=="tr"){
                    let rooms_number: string;
                    let  rooms_seats: number;
                    let rooms_type: string;
                    let rooms_furniture: string;
                    let rooms_href: string;
                    for(let ccnode of cnode.childNodes){
                        if(ccnode.nodeName=="td" && ccnode.attrs[0].value== "views-field views-field-field-room-number" ){
                            for( let cccnode of ccnode.childNodes){
                                if(cccnode.nodeName== "a"){
                                    rooms_href = cccnode.attrs[0].value.trim();
                                    rooms_number = cccnode.childNodes[0].value;
                                }

                            }
                        }
                        if(ccnode.nodeName=="td" && ccnode.attrs[0].value== "views-field views-field-field-room-capacity" ){
                            rooms_seats = +ccnode.childNodes[0].value.trim();
                        }
                        if(ccnode.nodeName=="td" && ccnode.attrs[0].value== "views-field views-field-field-room-furniture" ){
                            rooms_furniture = ccnode.childNodes[0].value.trim().replace("&amp","&");
                        }
                        if(ccnode.nodeName=="td" && ccnode.attrs[0].value== "views-field views-field-field-room-type" ){
                            rooms_type = ccnode.childNodes[0].value.trim();
                        }


                    }
                    let room:RInformation = {
                        rooms_seats: rooms_seats,
                        rooms_type:  rooms_type,
                        rooms_furniture: rooms_furniture,
                        rooms_href:  rooms_href,
                        rooms_number:rooms_number
                    };
                    RoomArray.push(room);
                }
            }
            return RoomArray;
        }else{
            if(pnode.childNodes!=undefined) {

                for (let child of pnode.childNodes) {
                    let c = this.parsehtmlRoom(child);
                    if (c != undefined) {
                        return c;
                    }
                }
            }
            return undefined
        }

    }


    public getlatlonarray( buildings:BuildingInformation[] ){

        let new_buildings:any[] = [];
        for(let building of buildings){
            new_buildings.push(this.getlatlon(building))
        }
        return Promise.all(new_buildings)
    }


    public getlatlon(building: BuildingInformation){
        return new Promise(function (fulfill, reject) {
            let query = "http://skaha.cs.ubc.ca:8022/api/v1/team46/"+building.rooms_address.split(" ").join("%20");
            http.get(query,function (result) {
                result.setEncoding('utf8');
                let data = "";
                result.on("data",(chunk:string)=> data = data + chunk);
                result.on("end",()=>{
                    try {
                        let a: GeoResponse = JSON.parse(data);
                        if (!a.error){
                            building.rooms_lat = a.lat;
                            building.rooms_lon = a.lon;
                            fulfill(building);
                        }else{
                            reject("err");
                        }

                    }catch(err){
                        reject(err);
                    }
                })

            })
        })

    }

}
