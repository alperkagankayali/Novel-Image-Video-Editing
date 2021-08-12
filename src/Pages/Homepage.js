import "../App.css";

import HomeLeftGrid from "../Components/homeLeftGrid";
import HomeRightGrid from "../Components/homeRightGrid";
import React, {useState, useRef, useReducer} from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography} from "@material-ui/core";
import EffectGrid from "../Components/EffectGrid";

class Homepage extends React.Component{
    constructor() {
        super();
        this.state = {
            insideText: "",
            current_output_tensor: null,
            saveButtonClicked: false,
        };
    }
    changeButtonState(event) {
        this.setState({
                        insideText: event.target.innerText
        })
        //console.log(this.state.insideText);
    }
    updateAppliedEffects(event){
        this.setState({
            saveButtonClicked: !this.state.saveButtonClicked
        })
        //console.log(event);

    }
    changeSaveButton(){
        this.setState({
            saveButtonClicked: !this.state.saveButtonClicked
        })
    }
    updateCurrentOutputTensor(output_tensor){
        this.setState({current_output_tensor: output_tensor})
        //this.state.current_output_tensor = output_tensor;
        console.log(this.state.current_output_tensor);
    }
    //var returnMediumGrid;
    //If you add a new channel, add a new case to the switch-case statement.
    render() {
    
        
        return ( 

        <Grid container spacing={10} direction="row" wrap="nowrap"> 
            <Grid container item xs={12} spacing={3}>
                <HomeLeftGrid buttonClick={this.changeButtonState.bind(this)}/>
            </Grid>
            <Grid container item direction="column" xs={12} spacing={3}>
                <EffectGrid insideText = {this.state.insideText} buttonClick1 ={this.updateAppliedEffects.bind(this)} updateCurrentOutputTensor = {this.updateCurrentOutputTensor.bind(this)} />
            </Grid>
            <Grid container item xs={12} spacing={3}>
                <HomeRightGrid current_output_tensor = {this.state.current_output_tensor} 
                saveButtonClicked = {this.state.saveButtonClicked} changeSaveButton = {this.changeSaveButton.bind(this)}
                insideText = {this.state.insideText}/>
            </Grid>

            
        </Grid>
        );
    }
}

export default Homepage;
