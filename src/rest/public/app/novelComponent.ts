

import { Component } from '@angular/core';
import {QueryRequest} from "../../../../src/controller/QueryController";
import {Filter} from "../../../controller/QueryController";
import { QueryHelper} from "./queryHelper";



@Component({
    selector: 'novel',
    template: `<h3>Building</h3>
                <input [(ngModel)]="rooms_fullname"><p>{{rooms_fullname}}</p>
               
                <h3>From building</h3>
                <input [(ngModel)]="building_name"><p>{{building_name}}</p>
                 <h3>Speed in Meter/sec</h3>
                <input [(ngModel)]="speed"><p>{{speed}}</p>
                   <h3>Expected time in Mins</h3>
                   <input type="number" [(ngModel)]="expectedTime"><p>{{expectedTime}}</p>
             
               
                 <button (click)=  findDistance()>findDistance</button>
             
                 <h3>Distance </h3>
                 <p>{{distance}} m</p>            
                 <h3>Time in Mins </h3>
                 <p>{{time}} min</p> 
                  <h3>Required Speed </h3>
                 <p>{{expectedSpeed}} m/s</p> 
                 
                
   
 `,
    providers: [QueryHelper]

})


export class novelComponent{
    rooms_fullname:string="";
    distance:number;
    building_name: string="";
    size: number;
    rooms_furniture:string="";
    rooms_type: string="";
    queryHelper: QueryHelper;
    time : number;
    speed: number =  1.0;
    expectedTime : number ;
    expectedSpeed : number;

    constructor(helper:QueryHelper){
        this.queryHelper = helper;
    }


    getLatLon(s: string):Promise<{rooms_lat:number,rooms_lon:number}>{
let that = this
        return new Promise(function (fulfill, reject) {
        let get:string[] = [
            "rooms_lat",
            "rooms_lon",
        ];
        let as = "TABLE";
        let query:QueryRequest = {GET: get,WHERE:{IS:{"rooms_shortname":s}},AS:as};
        that.queryHelper.query(query).then(function(geo) {
            fulfill(geo[0]);


        }).catch(function (err) {
            console.log("fail geo")
        })
    })}

    findDistance(){



                let promises:Array<any> = [];
                promises.push(this.getLatLon(this.building_name));
                promises.push(this.getLatLon(this.rooms_fullname));
        let that = this;
        Promise.all(promises).then(function (res:{rooms_lat:number,rooms_lon:number}[]) {
         that.distance = that.getDistanceFromLatLonInKm(res[0].rooms_lat, res[0].rooms_lon,res[1].rooms_lat,res[1].rooms_lon)
         that.time = +(that.distance/that.speed/60).toFixed(2);
         if(that.expectedTime != undefined){
             that.expectedSpeed = +(that.distance/that.expectedTime/60).toFixed(2);

         }else{
             that.expectedSpeed = undefined;
         }
        })






    }

    getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = (lat2-lat1) * (Math.PI/180);  // deg2rad below
        var dLon = (lon2-lon1) * (Math.PI/180);
        var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos((lat1) * (Math.PI/180)) * Math.cos((lat2) * (Math.PI/180)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d*1000;
    }



}

