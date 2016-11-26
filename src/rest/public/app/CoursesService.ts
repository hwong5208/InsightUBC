
import { Http, Response } from '@angular/http';
import {QueryRequest} from "../../../../src/controller/QueryController";
import {Headers} from '@angular/http'
import {RequestOptions, Request, RequestMethod} from '@angular/http'
import { Injectable } from '@angular/core';
import 'rxjs/Rx';




/**
 * Created by user on 2016/11/12.
 */
@Injectable()
export class QueryHelper{
    constructor (private http: Http) {}
    public query(query: QueryRequest):Promise<any>{
        console.log(query);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post("http://localhost:4321/query", query, options).toPromise()
            .then(function(res){
                let a = res.json();
                return res.json().result;
            })

    }

}
