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
    
    
    constructor(props) {
        super();
        this.state = {
            insideText: "",
            btnNewScreen: false,
            appliedEffects: [],
            currentOutputTensor: {},
            effectID: 0,
            effectSelected: [],
            updateHappened: props.updateHappened
        };
        this.newScreen = this.newScreen.bind(this);
        this.updateAppliedEffects = this.updateAppliedEffects.bind(this);
    }

    newScreen(e) {
        this.setState({ btnNewScreen: !this.state.btnNewScreen,
                        insideText: e.target.innerText
         });
        
    }
    changeUpdateHappened(){
        this.props.ustuneTikladik();
    }
    updateAppliedEffects(){
        //this.forceUpdate();
        //this.setState({});
        this.forceUpdate();
        this.setState({
          btnNewScreen: !this.state.btnNewScreen,
          insideText: this.state.insideText,
          currentOutputTensor: this.props.current_output_tensor,
          appliedEffects: [...this.state.appliedEffects, <MainCard cardText={this.props.insideText} 
                                                                    removeAppliedEffects = {this.removeAppliedEffects.bind(this)} 
                                                                    filtered_image ={this.props.current_output_tensor}
                                                                    effectID = {this.state.effectID}
                                                                    addEyeForSelected = {this.addEyeForSelected.bind(this)}
                                                                    updateHappened = {this.state.updateHappened}
                                                                    changeUpdateHappened = {this.changeUpdateHappened.bind(this)}
                                                                    getYourEffect={this.getEffectSelected.bind(this)}
                                                                    updateHappenedAmk={this.props.updateHappenedAmk}/>],
          effectSelected: [...this.state.effectSelected, false],
          effectID: this.state.effectID + 1
        });

        //console.log(this.state.currentOutputTensor);
        //console.log("sa as");
    }
    getEffectSelected(id_of_effect){
        console.log("Called for effect: " + id_of_effect);
        let array = this.state.appliedEffects;
        let array1 = this.state.effectSelected;
        let item = false;
        for(var i = 0; i < this.state.effectID; i++){
            if(i < array.length){
                if(array[i].props.effectID === id_of_effect){
                    //array.splice(i, 1);
                    item = array1[i];
                }
            }
        }
        return array1[id_of_effect];
    }
    async addEyeForSelected(id_of_effect){
        console.log("here in addEyeForSelected");
        let array = this.state.appliedEffects;
        let array1 = this.state.effectSelected;
        console.log(array)
        for(var i = 0; i < array1.length; i++){
            let item= {...array1[i]};
            /*if(i < array.length){
                if(array[i].props.effectID === id_of_effect){
                    //array.splice(i, 1);
                    item = true;

                }
                else{
                    item = false;
                }
                //array[i].updateSelected();
            }
            else{
                item = false;
                
            }*/
            if(i === id_of_effect)
                item = true;
            else
                item = false;
            array1[i] = item;
            //console.log(array[i]);
            //this.state.appliedEffects[i].forceUpdate();
        }
        this.props.ustuneTikladik();
        console.log(this.props.updateHappenedAmk, "e hadi ama");
        this.setState({effectSelected: array1}, () => {
            console.log(this.state.updateHappened, ' effect Selected xx');
            //this.forceUpdate();
            console.log(this.state.updateHappened, " update happened finally thank god omg");
            
        });
        
        //console.log(this.state.effectSelected);
        //this.forceUpdate();
    }
    removeAppliedEffects(cardText){
        
        let array = this.state.appliedEffects;
        let array1 = this.state.effectSelected;
        for(var i = 0; i < this.state.effectID; i++){
            if(i < array.length){
                if(array[i].props.effectID === cardText){
                    //array.splice(i, 1);
                    this.setState({appliedEffects: [...this.state.appliedEffects.slice(0, i), ...this.state.appliedEffects.slice(i + 1)]}, () => {
       console.log(this.state.appliedEffects, 'applied effects'); });
                    var newBlockArray = [...array1];
                    newBlockArray.splice(i, 1);
                    //setBlocks(newBlockArray)
                    this.setState({effectSelected: newBlockArray}, () => {
      console.log(this.state.effectSelected, 'effect Selected');})
                    //[...this.state.effectSelected.slice(0, i), ...this.state.effectSelected.slice(i + 1)]
                }
            
            }
        }
        //let removedArray = array.splice(cardText, 1);
        console.log(array);
        //this.setState({appliedEffects: array}, () => {console.log(this.state.appliedEffects, 'applied effects');});
        //this.render();
        console.log(cardText);
        console.log(this.state.appliedEffects);
        
    }
    render() {
        
        var text = this.state.btnNewScreen ? 'Add new' : 'Screens';

        var flag = this.props.saveButtonClicked;
        if(this.props.saveButtonClicked){
            if(this.props.insideText == ""){
                alert("Please Select a Filter!");
                this.props.changeSaveButton();
            }
            else{
                console.log("now it is invoked!");
                this.updateAppliedEffects();
                this.props.changeSaveButton();
            }
            
        }
        if(this.props.updateHappenedAmk){
            console.log("sa as");
            this.setState({updateHappened: !this.state.updateHappened});
            this.changeUpdateHappened();
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
