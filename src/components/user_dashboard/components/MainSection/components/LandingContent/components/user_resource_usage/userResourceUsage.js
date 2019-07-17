import React , { Component } from "react";
import { Link } from "react-router-dom";
import { Line } from 'react-chartjs-2';

import "./userResource.css";

export default class UserResourceUsage extends Component{

    // /userID/totalBill
    //eg /09/totalBill
    totalBill = 2336720;

    graphLabels = ["Jan", "Feb", "Apr", "May", "Jun", 'Jul', "Aug"];
    graphDataValues = [10,20,60,80,5,2,70];

    state = {
        totalBill : 0,
        graphLabels : [],
        graphDataValues : []
    }
    
    componentDidMount(){
        this.setState({
            totalBill : this.totalBill,
            graphLabels  : this.graphLabels,
            graphDataValues : this.graphDataValues 
        })
    }

    render(){
        let data = {
            labels: this.state.graphLabels,
            datasets: [{
                label: "Resource Usage",
                backgroundColor: 'rgb(30,144,255)',
                borderColor: 'rgb(30,144,255)',
                data: this.state.graphDataValues,
            }]
        };


        return (<div class="row user-resource">
            <div class="col-9 text-center my-5 mx-auto">
                <h5 class="mb-5">Total Bill : UGX { this.state.totalBill }</h5>
                <Line data={data} />
            </div>
        </div>);
    }
}