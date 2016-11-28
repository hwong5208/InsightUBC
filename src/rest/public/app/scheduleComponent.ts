/**
 * Created by Christine on 2016-11-26.
 */

import { Component } from '@angular/core';
import {QueryRequest} from "../../../../src/controller/QueryController";
import {Filter} from "../../../controller/QueryController";
import { QueryHelper} from "./queryHelper";



@Component({
    selector: 'schedule',
    template: `<h4>Select the rooms and courses to schedule</h4>
                <h3>Building</h3>
                <input [(ngModel)]="rooms_fullname"><p>{{rooms_fullname}}</p>
                <h3>Distance </h3>
                 <input type="number"[(ngModel)]="distance"><p>{{distance}}</p>
                <h3>From building</h3>
                <input [(ngModel)]="building_name"><p>{{building_name}}</p>
              
                
                
                 <button (click)=  findRooms()>Find Room</button>
              
                 <h3>Result</h3>
                
   <p-dataTable [value]="result" sortMode="multiple" [(selection)]="buildings">
      <p-column selectionMode="multiple"></p-column>
    <p-column field="rooms_fullname" header="rooms_fullname" sortable="true"></p-column>
     <p-column field="rooms_shortname" header="rooms_shortname" sortable="true"></p-column>
     <p-column field="rooms_number" header="rooms_number" sortable="true"></p-column>
     <p-column field="rooms_address" header="rooms_address" sortable="true"></p-column>
     <p-column field="rooms_seats" header="rooms_seats" sortable="true"></p-column>
     <p-column field="rooms_type" header="rooms_type" sortable="true"></p-column>
          <p-column field="rooms_furniture" header="rooms_furniture" sortable="true"></p-column>
          
</p-dataTable>

<h3>Course department</h3>
<input [(ngModel)]="courses_dept"><p>{{courses_dept}}</p>
<h3>Course id</h3>
<input [(ngModel)]="courses_id"><p>{{courses_id}}</p>

<button (click)=  findCourse()>Find Course</button>

<p></p>

<p-dataTable [value]="result2" sortMode="multiple"  [(selection)]="courses" >
    <p-column selectionMode="multiple"></p-column>
    <p-column field="courses_dept" header="courses_dept" sortable="true"></p-column>
    <p-column field="courses_id" header="courses_id" sortable="true"></p-column>

    <p-column field="numSection" header="numSection" sortable="true"></p-column>
    <p-column field="maxSize" header="maxSize" sortable="true"></p-column>
   
    </p-dataTable>
    <p></p>
    <button (click)=  schedule()>Schedule</button>
    <p-dataList [value]="schedule_array">
    <template let-room>
        {{room.rooms_name}}  Size:{{room.rooms_seats}}
         <ul>
      <li *ngFor="let course of getkeys(room.slot)">
        {{ room.slot[course] }}
      </li>
    </ul>
    </template>
    </p-dataList>
    
    <h3>Unscheduled courses</h3>
    
     <ul>
      <li *ngFor="let c of unschedule_array">
        {{ c }}
      </li>
    </ul>
    
    <p></p>
    <h3>Quality of the schedule</h3>
    {{quality}}
 `,
    providers: [QueryHelper]

})


export class scheduleComponent{
    rooms_fullname:string="";
    distance:number;
    building_name: string="";
    size: number;
    rooms_furniture:string="";
    rooms_type: string="";
    queryHelper: QueryHelper;
    buildings = [];
    courses =[];
    result: {}[];
    courses_dept:string ="";
    courses_id:string = "";
    result2: {}[];
    schedule_array = [];
    unschedule_array = [];
    quality:number;


    constructor(helper:QueryHelper){
        this.queryHelper = helper;
    }

    getkeys(object:any){
        return Object.keys(object);
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

                let a = this.rooms_fullname.split(",");

                let b:Filter[] = [];

                for(let aa of a){
                    b.push({IS: {"rooms_shortname": aa}});
                }
                where.AND.push({OR: b})
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
                    that.buildings = [];
                    for( let a of res){
                        if(that.getDistanceFromLatLonInKm2(geo[0].rooms_lat,geo[0].rooms_lon,a.rooms_lat,a.rooms_lon)<= that.distance){
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

    getDistanceFromLatLonInKm2(lat1,lon1,lat2,lon2) {
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

    findCourse(){
        let get:string[] = [ "courses_dept",
            "courses_id","numSection"
        ]

        let as = "TABLE";
        let where:Filter = {};
        where.AND = [];
        if (this.courses_dept !=""){

            let a = this.courses_dept.split(",");

            let b:Filter[] = [];

            for(let aa of a){
                b.push({IS: {"courses_dept": aa}});
            }
            where.AND.push({OR: b})

        }

        if (this.courses_id !=""){

            let a = this.courses_id.split(",");

            let b:Filter[] = [];

            for(let aa of a){
                b.push({IS: {"courses_id": aa}});
            }
            where.AND.push({OR: b})

        }


        where.AND.push( {EQ:{ "courses_year":2014}} )
        let group = [  "courses_id","courses_dept"];
        let apply = [{"numSection": {"COUNT": "courses_uuid"}} ];
        let query:QueryRequest = {GET: get,WHERE:where,GROUP:group,APPLY:apply,AS:as};
        let that = this;
        this.queryHelper.query(query).then(function(res){
            let map :{[key: string]:number} = {} ;
             for(let r of res){
                 map[r.courses_dept+r.courses_id]=Math.floor(r.numSection/3)+1
             }


            let get:string[] = [ "courses_dept",
                "courses_id","maxSize"
            ]

            let as = "TABLE";
            let where:Filter = {};
            where.AND = [];
            if (that.courses_dept !=""){

                let a = that.courses_dept.split(",");

                let b:Filter[] = [];

                for(let aa of a){
                    b.push({IS: {"courses_dept": aa}});
                }
                where.AND.push({OR: b})

            }

            if (that.courses_id !=""){

                let a = that.courses_id.split(",");

                let b:Filter[] = [];

                for(let aa of a){
                    b.push({IS: {"courses_id": aa}});
                }
                where.AND.push({OR: b})

            }


            where.AND.push( {NOT: {EQ:{ "courses_year":1900}}} )
            let group = [  "courses_id","courses_dept"];
            let apply = [{"maxSize": {"MAX": "courses_size"}} ];
            let query:QueryRequest = {GET: get,WHERE:where,GROUP:group,APPLY:apply,AS:as};
             that.queryHelper.query(query).then(function(res){
                 that.result2 = [];
                 that.courses=[];
                 for(let r of res){
                     if(map[r.courses_dept+r.courses_id]!=undefined){
                         r.numSection = map[r.courses_dept+r.courses_id];
                         that.result2.push(r);
                     }
                 }

             } )
        }).catch(function(err){
            console.log("fail");
        });

    }



    schedule(){
        let array = [];
        let unarray = [];

        for(let c of this.buildings){
            let b ={rooms_name:c.rooms_name,rooms_seats: c.rooms_seats, slot:{} };
            b.slot["M 8:00"] = "";
            b.slot["M 9:00"] = "";
            b.slot["M 10:00"] = "";
            b.slot["M 11:00"] = "";
            b.slot["M 12:00"] = "";
            b.slot["M 13:00"] = "";
            b.slot["M 14:00"] = "";
            b.slot["M 15:00"] = "";
            b.slot["M 16:00"] = "";
            b.slot["T 8:00"] = "";
            b.slot["T 9:30"] = "";
            b.slot["T 11:00"] = "";
            b.slot["T 12:30"] = "";
            b.slot["T 14:00"] = "";
            b.slot["T 15:30"] = "";
            array.push(b);
        }
        let success = 0;
        let fail = 0;
        let map :{[key: string]:boolean} = {} ;

        function sortbyorderDown() {

            return function (a: any, b: any) {

                    if (a.maxSize < b.maxSize)
                        return 1;
                    if (a.maxSize > b.maxSize)
                        return -1;

                return 0;
            }
        }

        this.courses.sort(sortbyorderDown());
        for (let c of this.courses){
            for(let i=0;i< c.numSection;i++){
                let found = false;
                for (let r of array){
                    if (r.rooms_seats >= c.maxSize) {
                        for (let s in r.slot) {
                            if (r.slot[s] == "" && !map[c.courses_dept + c.courses_id + s]) {
                                r.slot[s] = c.courses_dept+ " " +c.courses_id + " " + s + " Size:" + c.maxSize;
                                map[c.courses_dept + c.courses_id + s] = true;
                                found = true;
                                success++;
                                break;
                            }
                        }

                    }
                    if(found){
                        break;
                    }
                }
                if(!found){
                    fail++;
                    unarray.push( c.courses_dept+ " " +c.courses_id +  " Size:" + c.maxSize);
                }
            }
        }
        this.schedule_array = array;
        this.unschedule_array = unarray;
        this.quality=(fail/(success+fail)*100).toFixed(2);
    }


}
