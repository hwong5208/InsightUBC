/**
 * Created by hwong on 11/20/2016.
 */

import { Component } from '@angular/core';
import {QueryRequest} from "../../../../src/controller/QueryController";
import {Filter} from "../../../controller/QueryController";
import { QueryHelper} from "./queryHelper";



@Component({
    selector: 'rooms',
    template: `<h3>Building</h3>
                <input [(ngModel)]="rooms_fullname"><p>{{rooms_fullname}}</p>
                <h3>Distance in meters</h3>
                 <input type="number"[(ngModel)]="distance"><p>{{distance}}</p>
                <h3>From building</h3>
                <input [(ngModel)]="building_name"><p>{{building_name}}</p>
                <h3>Size</h3>
                <input [(ngModel)]="size"><p>{{size}}</p>
                <h3>Furniture</h3>
                <input [(ngModel)]="rooms_furniture"><p>{{rooms_furniture}}</p>
                <h3>Type</h3>
                <input [(ngModel)]="rooms_type"><p>{{rooms_type}}</p>
                
                
                 <button (click)=  findRooms()>Find Room</button>
              
                 <h3>Result</h3>
                
   <p-dataTable [value]="result" sortMode="multiple">
    <p-column field="rooms_fullname" header="rooms_fullname" sortable="true"></p-column>
     <p-column field="rooms_shortname" header="rooms_shortname" sortable="true"></p-column>
     <p-column field="rooms_number" header="rooms_number" sortable="true"></p-column>
     <p-column field="rooms_address" header="rooms_address" sortable="true"></p-column>
     <p-column field="rooms_seats" header="rooms_seats" sortable="true"></p-column>
     <p-column field="rooms_type" header="rooms_type" sortable="true"></p-column>
          <p-column field="rooms_furniture" header="rooms_furniture" sortable="true"></p-column>
   
</p-dataTable>
 `,
    providers: [QueryHelper]

})


export class RoomsComponent{
    rooms_fullname:string="";
    distance:number;
    building_name: string="";
    size: number;
    rooms_furniture:string="";
    rooms_type: string="";
    queryHelper: QueryHelper;
    result: {}[];



    constructor(helper:QueryHelper){
        this.queryHelper = helper;
    }

    findRooms(){
        let get:string[] = [     "rooms_fullname",
        "rooms_shortname",
        "rooms_number",
        "rooms_name",
        "rooms_address",
        "rooms_lat",
        "rooms_lon",
        "rooms_seats",
        "rooms_type",
        "rooms_furniture",
        "rooms_href"]

        let as = "TABLE";
        let where:Filter = {};

        if(this.rooms_fullname !="" ||this.size != undefined || this.rooms_type!= "" || this. rooms_furniture !="") {


            where.AND = [];
            if (this.rooms_fullname != "") {
                where.AND.push({IS: {"rooms_shortname": this.rooms_fullname}})
            }

            if (this.size != undefined) {
                where.AND.push({GT: {"rooms_seats": this.size}})
            }

            if (this.rooms_furniture != "") {
                where.AND.push({IS: {"rooms_furniture": this.rooms_furniture}})
            }


            if (this.rooms_type != "") {
                where.AND.push({IS: {"rooms_type": this.rooms_type}})
            }
        }
        let query:QueryRequest = {GET: get,WHERE:where,AS:as};
        let that = this;
        this.queryHelper.query(query).then(function(res){
            if(that.distance== undefined || that.building_name=="" ){
                that.result = res;

            }else {
                let get:string[] = [
                    "rooms_lat",
                    "rooms_lon",
                    ];
                let query:QueryRequest = {GET: get,WHERE:{IS:{"rooms_shortname":that.building_name}},AS:as};
                that.queryHelper.query(query).then(function(geo) {
                    that.result=[];
                    for( let a of res){
                     if(that.getDistanceFromLatLonInKm(geo[0].rooms_lat,geo[0].rooms_lon,a.rooms_lat,a.rooms_lon)<= that.distance){
                         that.result.push(a);
                     }

                    }





                }).catch(function (err) {
                    console.log("fail geo")
                    that.result = [];
                })

            }


        }).catch(function(err){
            console.log("fail");
        });


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
