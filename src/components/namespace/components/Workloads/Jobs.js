import React, { Component } from 'react';
import axios from 'axios';

class Jobs extends Component {
    constructor() {
        super()
        this.state = {
            jobsFailed: 0,
            jobsSucceded: 0

        }
    }

    jobsSucceding = () => {
        const apiRoute = 'http://54.84.186.47:31765/monitor/jobs/suceeded';
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

        axios.get(proxyUrl + apiRoute)
        .then(response => {
            this.setState({ jobsSucceded: response.data.data.result[0].value[1]} );
        })
        .catch(error => console.log("Can't access " + apiRoute, error))

        return (
            <div className="col-sm-6">
                <div className="card">
                    <div className="card-header text-center success">
                        Jobs Succeeded
                    </div>
                    <div className="card-body">
                        <h1 className="card-title text-center">{this.state.jobsSucceded}</h1>
                    </div>
                </div>
            </div>
        );
    }

    jobsFailing = () => {
        const apiRoute = 'http://54.84.186.47:31765/monitor/job/failed';
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

        axios.get(proxyUrl + apiRoute)
        .then(response => {
            this.setState({ jobsFailed: response.data.data.result[0].value[1]} );
        })
        .catch(error => console.log("Can't access " + apiRoute, error))

        return (
            <div className="col-sm-6">
                <div className="card">
                    <div className="card-header text-center fail">
                        Jobs Failed
                    </div>
                    <div className="card-body">
                        <h1 className="card-title text-center">{this.state.jobsFailed}</h1>
                    </div>
                </div>
            </div>
        );
    }


    renderJobs = () => {
        return (
            <div className="card parent">
                <div className="card-header">
                    Jobs
                </div>
                <div className="card-body">
                    <div className="row">
                        {this.jobsSucceding()}
                        {this.jobsFailing()}
                    </div>

                </div>
            </div>
        );
    }

    render() {
        return (
            this.renderJobs()
        );
    }
}

export default Jobs;