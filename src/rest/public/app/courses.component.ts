/**
 * Created by user on 2016/11/12.
 */

import { Component } from '@angular/core';
import {QueryRequest} from "../../../../src/controller/QueryController";
import {Filter} from "../../../controller/QueryController";
import {CoursesService} from "./CoursesService";



@Component({
    selector: 'courses',
    template: `<h3>Course size</h3>
                <input [(ngModel)]="courses_size"><p>{{courses_size}}</p>
                <h3>Course department</h3>
                <input [(ngModel)]="courses_dept"><p>{{courses_dept}}</p>
                <h3>Course id</h3>
                <input [(ngModel)]="courses_id"><p>{{courses_id}}</p>
                <h3>Course insturctor</h3>
                <input [(ngModel)]="courses_instructor"><p>{{courses_instructor}}</p>
                <h3>Course title</h3>
                <input [(ngModel)]="courses_title"><p>{{courses_title}}</p>
                 <button (click)= submit()>Submit</button>
                 <h3>result</h3>
                 <table >
                 <td>department</td>
                 <td>id</td>
                 <td>average</td>
                 <td>instructor</td>
                 <td>title</td>
                 <td>pass</td>
                 <td>fail</td>
                 <td>audit</td>
    <tr *ngFor="let course of result">
        <td>{{course.courses_dept}}</td>
                   <td>{{course.courses_id}}</td>
                    <td>{{course.courses_avg}}</td>
                     <td>{{course.courses_instructor}}</td>
                     <td> {{course.courses_title}}</td>
                     <td>  {{course.courses_pass}}</td>
                      <td>  {{course.courses_fail}}</td>
                      <td>   {{course.courses_audit}}</td>
    </tr>
    
    <ng2-smart-table [settings]="settings"></ng2-smart-table>
        
</table>
 `,
    providers: [CoursesService]

})


export class CoursesComponent{
    courses_size: number ;
    courses_dept: string = "";
    courses_id: string = "";
    courses_instructor:string ="";
    courses_title:string ="";
    coursesService: CoursesService;
    result: {}[];

    settings = {
        columns: {
            courses_dept: {
                title: 'courses_dept'
            },
            courses_id: {
                title: 'courses_id'
            },
            courses_avg: {
                title: 'courses_avg'
            },
            courses_instructor: {
                title: 'courses_instructor'
            },
            courses_title: {
                title: 'courses_title'
            },
            courses_pass: {
                title: 'courses_pass'
            },
            courses_fail: {
                title: 'courses_fail'
            },
            courses_audit: {
                title: 'courses_audit'
            }

        }
    };


    constructor(coursesService:CoursesService){
        this.coursesService = coursesService;
    }

    submit(){
          let get:string[] = [ "courses_dept",
        "courses_id",
        "courses_avg",
        "courses_instructor",
        "courses_title",
        "courses_pass",
        "courses_fail",
        "courses_audit",
        "courses_uuid",
        "courses_year"]

        let as = "TABLE";
        let where = {};
        let query:QueryRequest = {GET: get,WHERE:where,AS:as};
        let that = this;
        this.coursesService.queryCourses(query).then(function(res){
            that.result = res;
        }).catch(function(err){
            console.log("fail");
        });

    }

}
