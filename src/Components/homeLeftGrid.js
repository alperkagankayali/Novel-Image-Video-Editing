import "../App.css"
import React, {useState, useRef, useReducer} from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography} from "@material-ui/core";


class HomeLeftGrid extends React.Component {
    

    constructor() {
        super();
        this.state = {
            insideText: "",
            btnNewScreen: true
        };
        this.newScreen = this.newScreen.bind(this);
    }

    newScreen(e) {
        this.setState({ btnNewScreen: !this.state.btnNewScreen,
                        insideText: e.target.innerText
         });
        
    }
    render() {
        var text = this.state.btnNewScreen ? 'Add new' : 'Screens';
        return (

            <Grid container direction="column" wrap="nowrap">
                <Button variant="contained" color="secondary" onClick={this.props.buttonClick}>
                    style transfer
                </Button>
            </Grid>
        );
    }
}
export default HomeLeftGrid;
