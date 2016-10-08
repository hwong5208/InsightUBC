/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import fs = require('fs');
import {error} from "util";
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

    constructor(){
        this.courses_dept = null;
        this.courses_id = null;
        this.courses_avg = null;
        this.courses_instructor = null;
        this.courses_title = null;
        this.courses_pass = null;
        this.courses_fail = null;
        this.courses_audit = null;
    }

    setCourse_dept(dept:string){this.courses_dept =dept};
    setCourse_id(i:string){this.courses_id =i};
    setCourse_avg(a:number){this.courses_avg= a};
    setCourse_instructor(nm:string){this.courses_instructor= nm};
    setCourse_title(t:string){this.courses_title = t};
    setCourse_pass(p:number){this.courses_pass=p};
    setCourse_fail(f:number){this.courses_fail=f};
    setCourse_audit(a:number){this.courses_audit=a};

    getCourse_dept(){return this.courses_dept};
    getCourse_id(){return this.courses_id};
    getCourse_avg(){return this.courses_avg};
    getCourse_instructor(){return this.courses_instructor};
    getCourse_title(){return this.courses_title };
    getCourse_pass(){ return this.courses_pass};
    getCourse_fail(){ return this.courses_fail};
    getCourse_audit(){ return this.courses_audit};

    getbykey(s :string):string|number{
        switch(s){
            case "courses_dept": return this.courses_dept;
            case "courses_id": return this.courses_id;
            case "courses_avg": return this.courses_avg;
            case "courses_instructor": return this.courses_instructor;
            case "courses_title": return this.courses_title;
            case "courses_pass":  return this.courses_pass;
            case "courses_fail":  return this.courses_fail;
            case "courses_audit": return this.courses_audit;
        }
    }
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
    /*
     public getDataset(id: string): any {

     return this.datasets[id];
     }
     */
    public getDataset(id: string): any {
        // TODO: this should check if the dataset is on disk in ./data if it is not already in memory.

        if (this.datasets.hasOwnProperty(id)){
            return this.datasets[id];
        }


        fs.readFile("./data/"+id, function read(err, data) {
            if (err) {
                return null;
            }
            //JSON.parse(data);
            return data;
        });

    }


    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk
        if (Object.keys(this.datasets).length === 0){
            let filename = fs.readdirSync('./data');
            for ( let fn of filename){
                let data = fs.readFileSync('./data/'+fn,'utf-8');
                console.log(data);
                let id = fn.substring(0,fn.lastIndexOf('.'));
                this.datasets[id]=JSON.parse(data);
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

        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    //             let processedDataset = {};
 /*
                    let processedDataset:any = [];
                    let folder: JSZip = zip.folder(id);
                    let promises:any = [];
                    folder.forEach(function(path, file){
                        if(!file.dir){

                            promises.push(file.async("string").then(function (data){

                                let a = JSON.parse(data)["result"];
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

                                    processedDataset.push(b);
                                }

                            }).catch(function (err) {
                              //  console.log("here!!")
                                //reject(err);
                                throw err;
                            }))}
                    });


                    Promise.all(promises).then( function () {

                        that.save(id, processedDataset)
                    } ).catch(function (err) {
                        //reject(err);
                          throw err;
                    });

*/
                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.

                    //by Zack
                    let processedDataset:any = [];
                    let folder: JSZip = zip.folder(id);
                    let promises:any[] = [];
                    // folder.forEach(function(path, file){
                    //     if(!file.dir){
                    //         promises.push(file.async("string"))}
                    // });

                    for(let file in zip.files){
                       // console.log(file);
                        if(zip.file(file)!=null){
                    promises.push(zip.file(file).async("string"));
                        }
                    }

                    Promise.all(promises).then( function (data:string[]) {

                         for(let x of data){
                             //console.log(x);
                             let a = JSON.parse(x)["result"];
                             //console.log(a);
                            if(a == undefined){reject(true) }
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

                                 processedDataset.push(b);
                             }
                         }


                       if( that.datasets[id]== undefined){
                           that.save(id, processedDataset);
                           fulfill(true);
                       }else{
                           that.save(id, processedDataset);
                           fulfill(false);
                       }


                    } ).catch(function (err) {
                        reject(err);
                       // throw err;
                    });


                    // by zack

                    //fulfill(true);
                }).catch(function (err) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(err);
            }
        });
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

        // create the './data' folder if it does't exist
        //by Zack

//        console.log( fs.lstat('/'+id));
        let dir = './data/';

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);

        }


        fs.writeFile('./data/'+id,JSON.stringify(processedDataset) );




    }

    public deleteDataSets(id:string){
    this.datasets[id] = undefined;
    }


}