/**
 * Created by hwong on 10/14/2016.
 */
/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest} from "./QueryController";
import DatasetController from "./DatasetController";
import Log from "../Util";

export default class InsightFacade implements IInsightFacade {
    private controller = new DatasetController();

  //  let controller = new DatasetController();

    addDataset(id: string, content: string): Promise<InsightResponse> {
       let that = this;
       return new Promise(function (fulfill,reject) {
           that.controller.process(id, content).then(function (result:boolean) {
               if (result) {
                   //result -> fulfill(true)
                   fulfill({code:204,body: {success:result}});
                  // res.json(204, {success: result});  //id was new

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
               reject({code:400,body: {error:" put error 400"}});
           });

           return undefined;
       });
    }

    removeDataset(id: string): Promise<InsightResponse> {




        return undefined;
    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {
        return undefined;
    }

    // TODO: need to implement this

}