import "../App.css"
import React, {useState, useRef, useReducer} from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography, Card} from "@material-ui/core";
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import MainCard from "../Utils/LayerCard";


class HomeRightGrid extends React.Component {
    
    
    constructor() {
        super();
        this.state = {
            insideText: "",
            btnNewScreen: false,
            appliedEffects: [],
            currentOutputTensor: null,
        };
        this.newScreen = this.newScreen.bind(this);
        this.updateAppliedEffects = this.updateAppliedEffects.bind(this);
    }

    newScreen(e) {
        this.setState({ btnNewScreen: !this.state.btnNewScreen,
                        insideText: e.target.innerText
         });
        
    }

    updateAppliedEffects(){
        this.setState({
          btnNewScreen: !this.state.btnNewScreen,
          insideText: this.state.insideText,
          currentOutputTensor: this.props.current_output_tensor,
          appliedEffects: [...this.state.appliedEffects, <MainCard cardText={this.props.insideText} filtered_image ={this.state.currentOutputTensor}/>]
        });

        console.log(this.state.currentOutputTensor);
        //console.log("sa as");
    }

    render() {
        
        var text = this.state.btnNewScreen ? 'Add new' : 'Screens';

        var flag = this.props.saveButtonClicked;
        if(this.props.saveButtonClicked){
            this.updateAppliedEffects();
            this.props.changeSaveButton();
        }
        //this.state.insideText = this.props.insideText;
        //var text1 = <MainCard cardText="Set aside bla bla"/>;
        
        //text1 = {...text1, ...<MainCard cardText="Set aside bla bla"/>};
        //If you want to add a new channel, just add it as a button.

        return (

            <Grid container direction="row" wrap="nowrap">
            <Card>
                <Typography variant="h4">
                    Applied Effects
                </Typography>
                <Button onClick={this.updateAppliedEffects}> hello </Button> 
                {this.state.appliedEffects}
            </Card>
            </Grid>
        );
    }
}
export default HomeRightGrid;
