/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';
import InsightFacade from "../controller/InsightFacade";



export default class RouteHandler {

    private static ifacade = new InsightFacade();

    private static datasetController = new DatasetController();

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);
                //
                // let controller = RouteHandler.datasetController;
                // controller.process(id, req.body).then(function (result) {
                //     if (result) {                         //result -> fulfill(true)
                //         res.json(204, {success:result});  //id was new
                //         console.log("204")
                //     }else {                               //result -> fulfill(false)
                //         res.json(201, {success:result});  // id already existed
                //         console.log("201")
                //     }
                //     Log.trace('RouteHandler::postDataset(..) - processed');
                //     //res.json(200, {success: result});
                // }).catch(function (err: Error) {
                //     Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
                //     res.json(400, {error: err.message});
                // });

                RouteHandler.ifacade.addDataset(id, req.body).then(function (result) {
                    res.json(result.code,result.body )
                } ).catch(function (err) {
                    res.json(err.code,err.body )
                });


            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {err: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        // try {
               let query: QueryRequest = req.params;
        //     let datasets: Datasets = RouteHandler.datasetController.getDatasets();
        //     let controller = new QueryController(datasets);
        //     let isValid = controller.isValid(query);
        //
        //     if (isValid === true) {
        //         console.log("is valid true");
        //         let result = controller.query(query);
        //         if(result instanceof Array){ res.json(424, {missing: result});}
        //         else {
        //             res.json(200, result);
        //         }
        //     } else {
        //         console.log("is valid false");
        //         res.json(400, {error: 'invalid query'});
        //     }
        // } catch (err) {
        //     Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
        //     res.send(400,{error: 'invalid query'});
        // }

        RouteHandler.ifacade.performQuery(query).then(function (result) {
           res.json(result.code,result.body )
        } ).catch(function (err) {
            res.json(err.code,err.body )
        });

        return next();
    }

    // added deleteDataset
    public static  deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::deleteDataset(..) - params: ' + JSON.stringify(req.params));
        // try {
        //     let id: string = req.params.id;
        //     if (RouteHandler.datasetController.getDataset(id) != undefined){
        //         fs.unlinkSync("./data/"+id);
        //         RouteHandler.datasetController.deleteDataSets(id);
        //         Log.trace('RouteHandler::deleteDataset(..) - processed');
        //         res.json(204, {success: 'dataset is deleted'});
        //         console.log(" delete: 204")
        //     } else {
        //         res.json(404, {status: 'the delete was for a resource that was not previously PUT'});
        //         console.log("delete: 404")
        //     }
        // } catch (err) {
        //     Log.error('RouteHandler::deleteDataset(..) - ERROR: ' + err);
        //     res.send(400);
        // }
        RouteHandler.ifacade.removeDataset(req.params.id).then(function (result) {
            res.json(result.code,result.body )
        } ).catch(function (err) {
            res.json(err.code,err.body )
        });


        return next();
    }
}
