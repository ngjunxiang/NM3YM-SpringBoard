import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'cm-dashboard',
    templateUrl: './cm-dashboard.component.html',
    styleUrls: ['./cm-dashboard.component.scss']
})
export class CMDashboardComponent implements OnInit {
    
    // UI Control
    loading = false;
    clients = [];
    // clients = ["Testing 1", "Testing 2"];

    constructor() { }

    ngOnInit() {
    }

}
