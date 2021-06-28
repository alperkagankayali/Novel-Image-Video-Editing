import "../App.css";
import StyleTransfer from "../Utils/styleTransfer";
import HomeLeftGrid from "../Components/homeLeftGrid";
import React, {useState, useRef, useReducer} from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography} from "@material-ui/core";


class Homepage extends React.Component{
    constructor() {
        super();
        this.state = {
            btnNewScreen: false, //should be this.props.btnNewScreen?
            insideText: ""
        };
    }
    changeButtonState(event) {
        this.setState({
                        btnNewScreen: !this.state.btnNewScreen,
                        insideText: event.target.innerText
        })
        console.log(this.state.insideText);
    }
    //var returnMediumGrid;
    render() {
        var middleColumn;
        switch(this.state.insideText) {
          case "STYLE TRANSFER":
            middleColumn = <StyleTransfer />;
            break;
          default:
            middleColumn = "Select your channel :)";
            
            break;
        } 
        
        return ( 

        <Grid container spacing={10} direction="row" wrap="nowrap"> 
            <Grid container item xs={12} spacing={3}>
                <HomeLeftGrid buttonClick={this.changeButtonState.bind(this)}/>
            </Grid>
            <Grid container item xs={12} spacing={3}>
                {middleColumn}
            </Grid>
            <Grid container item xs={12} spacing={3}>
                <StyleTransfer />
            </Grid>

            
        </Grid>
        );
    }
}

export default Homepage;
