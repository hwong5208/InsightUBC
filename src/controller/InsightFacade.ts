/**
 * Created by hwong on 10/14/2016.
 */
/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest, default as QueryController} from "./QueryController";
import DatasetController from "./DatasetController";
import Log from "../Util";
import fs = require('fs');

export default class InsightFacade implements IInsightFacade {


    //  let controller = new DatasetController();
    private static controller = new DatasetController();

    addDataset(id: string, content: string): Promise<InsightResponse> {
       let that = this;

       return new Promise(function (fulfill, reject) {
           InsightFacade.controller.process(id, content).then(function (result:boolean) {
               console.log(result);
               if (result) {
                   //result -> fulfill(true)

                   fulfill({code:204,body: {success:result}});
                  // res.json(204, {success: result});  //id was new
                  console.log("204");
               } else {                               //result -> fulfill(false)
                   fulfill({code:201,body: {success:result}});
                   //res.json(201, {success: result});  // id already existed
                   console.log("201")
               }
               Log.trace('RouteHandler::postDataset(..) - processed');
               //res.json(200, {success: result});
           }).catch(function (err: Error) {
               Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
              // res.json(400, {error: err.message});
               reject({code:400, body: {error:" put error 400"}});
           });


       });
    }

    removeDataset(id: string): Promise<InsightResponse> {

        let that = this;
        return new Promise(function (fulfill,reject){

            try {

                if (InsightFacade.controller.getDataset(id) != undefined){
                    fs.unlinkSync("./data/"+id);
                    InsightFacade.controller.deleteDataSets(id);
                    Log.trace('RouteHandler::deleteDataset(..) - processed');
                    //res.json(204, {success: 'dataset is deleted'});
                    fulfill({code:204,body: {success:'dataset is deleted'}});
                    //console.log(" delete: 204")
                } else {
                   // res.json(404, {status: 'the delete was for a resource that was not previously PUT'});
                    reject({code:404,body: {error:'the delete was for a resource that was not previously PUT'}});
                    //console.log("delete: 404")
                }
            } catch (err) {
                //Log.error('RouteHandler::deleteDataset(..) - ERROR: ' + err);
                reject({code:400,body: {error:'400'}});
                //res.send(400);
            }
        });

       // return undefined;
    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {

        let that = this;
        return new Promise(function (fulfill,reject){
            try {
                let datasets = InsightFacade.controller.getDatasets();
                let controller = new QueryController(datasets);
                let isValid = controller.isValid(query);

                if (isValid === true) {
                    console.log("is valid true");
                    let result = controller.query(query);
                         if(result instanceof Array){ //res.json(424, {missing: result});
                      reject({code:424,body: {missing: result}});
                          console.log("424, insigtfacades reject ")
                       }
                       else {
                       // res.json(200, result);
                        fulfill({code:200,body: result});
                        console.log("200, insigtfacades fulfill ")
                    }
                } else {
                    console.log("is valid false");
                    //res.json(400, {error: 'invalid query'});
                    reject({code:400,body: {error:' invalid query'}});
                }
            } catch (err) {
                Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
               // res.send(400,{error: 'invalid query'});
                reject({code:400,body: {error:' invalid query'}});
            }

        })



      //  return undefined;
    }

    // TODO: need to implement this

}
