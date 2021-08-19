import React, {useState, useRef, useReducer} from "react";
import {Button, Grid, Typography} from "@material-ui/core";
import StyleTransfer from "../Utils/styleTransfer";
import SuperResolution from "../Utils/superResolution.js";
import FaceGeneration from "../Utils/faceGeneration";
import ImageBlur from "../Utils/imageBlur";
import ImageFlip from "../Utils/imageFlip";
import * as tf from '@tensorflow/tfjs';

class EffectGrid extends React.Component {
    
    
    constructor() {
        super();
        this.state = {
            output_tensor: {},
            my_message: "",
        };
    }

    handleChange(input_tensor){

        //this.state.output_tensor = input_tensor;
        
        this.setState({output_tensor: input_tensor}, () => {
  console.log(this.state.output_tensor, 'output_tensor');
});
        //console.log(this.props);
        //console.log(this.state.my_message);
        //this.forceUpdate();
        this.props.updateCurrentOutputTensor(input_tensor);
        //console.log(this.state.output_tensor);
    }

    render() {
        
        //var text1 = <MainCard cardText="Set aside bla bla"/>;
        
        //text1 = {...text1, ...<MainCard cardText="Set aside bla bla"/>};
        //If you want to add a new channel, just add it as a button.
        var middleColumn;

        switch(this.props.insideText) {
        case "STYLE TRANSFER":
            middleColumn = <StyleTransfer handleChange={this.handleChange.bind(this)} />;
            break;
        case "SUPER RESOLUTION":
            middleColumn = <SuperResolution handleChange={this.handleChange.bind(this)} />;
            break;
        case "FACE GENERATION":
            middleColumn = <FaceGeneration handleChange={this.handleChange.bind(this)} />;
            break;
        case "IMAGE BLUR":
            middleColumn = <ImageBlur handleChange={this.handleChange.bind(this)} />;
            break;
        case "IMAGE FLIP":
            middleColumn = <ImageFlip handleChange={this.handleChange.bind(this)} />;
            break;
        default:
            middleColumn = "Select your channel :)";
            
            break;
        }
        return (

            <Grid container direction="column" wrap="nowrap">
             {middleColumn}
             <Button variant="contained" color="secondary" onClick = {this.props.buttonClick1} align={"center"}>Save Style</Button>
            </Grid>
        );
    }
}
export default EffectGrid;