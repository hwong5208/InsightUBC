/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import fs = require('fs');
/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
}


/*
 export interface Course_details {
 course_dept:string; // "Subject"
 course_id: String; // "Course"
 course_avg: number; //"Avg"Professor""
 course_instructor: string; //"Professor"
 course_title:string;  //"Title"
 course_pass:number; //"Pass"
 course_fail:number; //"Fail"
 course_audit:number; // "Audit"
 }
 */
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
                    let processedDataset:any = [];


                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.

                    //by Zack
                    let promises:any = [];


                    class ClassInformation {

                        course_dept:string;
                        course_id:string;
                        course_avg:number;
                        course_instructor:string;
                        course_title:string;
                        course_pass:number;
                        course_fail:number;
                        course_audit:number

                        constructor(){
                         this.course_dept = null;
                         this.course_id = null;
                         this.course_avg = null;
                         this.course_instructor = null;
                         this.course_title = null;
                         this.course_pass = null;
                         this.course_fail = null;
                         this.course_audit = null;
                        }

                        setCourse_dept(dept:string){this.course_dept =dept};
                        setCourse_id(i:string){this.course_id =i};
                        setCourse_avg(a:number){this.course_avg= a};
                        setCourse_instructor(nm:string){this.course_instructor= nm};
                        setCourse_title(t:string){this.course_title = t};
                        setCourse_pass(p:number){this.course_pass=p};
                        setCourse_fail(f:number){this.course_fail=f};
                        setCourse_audit(a:number){this.course_audit=a};

                        getCourse_dept(){return this.course_dept};
                        getCourse_id(){return this.course_id};
                        getCourse_avg(){return this.course_avg};
                        getCourse_instructor(){return this.course_instructor};
                        getCourse_title(){return this.course_title };
                        getCourse_pass(){ return this.course_pass};
                        getCourse_fail(){ return this.course_fail};
                        getCourse_audit(){ return this.course_audit};

                    }



                    for(let f in zip.files){
                           // read file
                        promises.push( zip.file(f).async("string").then(function (data) {
                            let promise =  new Promise(function(resolve, reject) {
                                let a = JSON.parse(data);

                                for(let i in a.result ) {

                                    /*
                                    console.log("course_dept : "+a.result[i].Subject);
                                    console.log("course_id : "+a.result[i].Course);
                                    console.log("course_avg : "+a.result[i].Avg);
                                    console.log("course_instructor : "+a.result[i].Professor);
                                    console.log("course_title : "+a.result[i].Title);
                                    console.log("course_pass : "+a.result[i].Pass);
                                    console.log("course_fail : "+a.result[i].Fail);
                                    console.log("course_audit : "+a.result[i].Audit);
                                    */

                                    let b = new ClassInformation();
                                    b.setCourse_dept(a.result[i].Subject);
                                    b.setCourse_id(a.result[i].Course);
                                    b.setCourse_avg(a.result[i].Avg);
                                    b.setCourse_instructor(a.result[i].Professor);
                                    b.setCourse_title(a.result[i].Title);
                                    b.setCourse_pass(a.result[i].Pass);
                                    b.setCourse_fail(a.result[i].Fail);
                                    b.setCourse_audit(a.result[i].Audit);
                                   // console.log(b);
                                    processedDataset.push(b);
                                }


                            });

                        }));


                    }
                    Promise.all(promises).then( function () {
                        that.save(id, processedDataset)
                    } ).catch(function (err) {

                    });


                    // by zack


                    fulfill(true);
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

        // TODO: actually write to disk in the ./data directory

        // create the './data' folder if it does't exist
        //by Zack

        let dir = './data';
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            
        }
        fs.writeFileSync('./data/'+id, this.datasets[id]);


    }
}
