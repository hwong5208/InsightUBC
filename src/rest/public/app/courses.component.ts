/**
 * Created by hwong on 11/20/2016.
 */

import { Component } from '@angular/core';
import {QueryRequest} from "../../../../src/controller/QueryController";
import {Filter} from "../../../controller/QueryController";
import { QueryHelper} from "./queryHelper";



@Component({
    selector: 'courses',
    template: `
               
                <h3>Course Department</h3>
                <input [(ngModel)]="courses_dept"><p>{{courses_dept}}</p>
                <h3>Course Number</h3>
                <input [(ngModel)]="courses_id"><p>{{courses_id}}</p>
                <h3>Course Insturctor</h3>
                <input [(ngModel)]="courses_instructor"><p>{{courses_instructor}}</p>
                <h3>Course Title</h3>
                <input [(ngModel)]="courses_title"><p>{{courses_title}}</p>
                <h3>Course Size</h3>
                <input type="number"[(ngModel)]="courses_size"><p>{{courses_size}}</p>
                 <button (click)=  findSection()>Find Section</button>
                 <button (click)=  findCourse()>Find Course</button>
                 <h3>Result</h3>
                
   <p-dataTable [value]="result" sortMode="multiple">
     <p-column field="courses_dept" header="Course Department" sortable="true"></p-column>
     <p-column field="courses_id" header="Course Number" sortable="true"></p-column>
     <p-column field="courses_avg" header="Section Average" sortable="true"></p-column>
     <p-column field="courses_instructor" header="Instructor" sortable="true"></p-column>
     <p-column field="courses_title" header="Course Title" sortable="true"></p-column>
     <p-column field="courses_pass" header="No. of Student Pass" sortable="true"></p-column>
     <p-column field="courses_fail" header="No. of Student Fail" sortable="true"></p-column>
     <p-column field="courses_size" header="Course Size" sortable="true"></p-column>
     <p-column field="courseAverage" header="Course Average" sortable="true"></p-column>
     <p-column field="maxPass" header="Max no. of Student Pass" sortable="true"></p-column>
     <p-column field="maxFail" header="Max no. of Student Fail" sortable="true"></p-column>   
</p-dataTable>
 `,
    providers: [QueryHelper]

})


export class CoursesComponent{
    courses_size: number ;
    courses_dept: string = "";
    courses_id: string = "";
    courses_instructor:string ="";
    courses_title:string ="";
    queryHelper: QueryHelper;
    result: {}[];



    constructor(helper:QueryHelper){
        this.queryHelper = helper;
    }

    findSection(){
          let get:string[] = [ "courses_dept",
        "courses_id",
        "courses_avg",
        "courses_instructor",
        "courses_title",
        "courses_pass",
        "courses_fail",
        "courses_audit",
        "courses_uuid",
        "courses_year",
              "courses_size"]

        let as = "TABLE";
        let where:Filter = {};
        where.AND = [];
        if (this.courses_dept !=""){
            where.AND.push({IS:{"courses_dept":this.courses_dept }})
        }

        if (this.courses_instructor !=""){
            where.AND.push({IS:{"courses_instructor":this.courses_instructor }})
        }

        if (this.courses_title !=""){
            where.AND.push({IS:{"courses_title":this.courses_title }})
        }

        if (this.courses_size != undefined){
            where.AND.push({LT:{"courses_size":this.courses_size }})
        }
        let query:QueryRequest = {GET: get,WHERE:where,AS:as};
        let that = this;
        this.queryHelper.query(query).then(function(res){
            that.result = res;
        }).catch(function(err){
            console.log("fail");
        });

    }

    findCourse(){
        let get:string[] = [ "courses_dept",
            "courses_id","courseAverage","maxFail","maxPass"

            ]

        let as = "TABLE";
        let where:Filter = {};
        where.AND = [];
        if (this.courses_dept !=""){
            where.AND.push({IS:{"courses_dept":this.courses_dept }})
        }


        where.AND.push( {NOT:{EQ:{ "courses_year":1900}}} )
        let group = [  "courses_id","courses_dept"];
        let apply = [{"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}},{"maxPass": {"MAX": "courses_pass"}} ];
        let query:QueryRequest = {GET: get,WHERE:where,GROUP:group,APPLY:apply,AS:as};
        let that = this;
        this.queryHelper.query(query).then(function(res){
            that.result = res;
        }).catch(function(err){
            console.log("fail");
        });

    }



}
