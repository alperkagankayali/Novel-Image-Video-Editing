import "../App.css";

import HomeLeftGrid from "../Components/homeLeftGrid";
import HomeRightGrid from "../Components/homeRightGrid";
import React from "react";
import {Grid} from "@material-ui/core";
import EffectGrid from "../Components/EffectGrid";

class Homepage extends React.Component{
    constructor() {
        super();
        this.state = {
            insideText: "",
            current_output_tensor: {},
            saveButtonClicked: false,
            saveButtonClicked1: false,
            effect_id: "",
            last_output_tensor: null,
            currentAppliedEffects: [],
            id_to_remove: null,
            id_to_change: null,
            new_effect_created: false
        };
        this.getEyeToEffectWithID = this.getEyeToEffectWithID.bind(this);
    }
    //Helper function for getting the id of the effect that should be removed from the right grid and sending it to the effect grid.
    removeDataHomepage(id){
        this.setState({id_to_remove: id});
    }
    //Helper function for getting the final product from the right grid and sending it to the effect grid.
    getLastData(tensor){
        this.setState({last_output_tensor: tensor});
    }
    //This is for getting the name of the effect that is selected from the left grid and sending it tp the effect grid.
    async changeButtonState(event) {
        //If the current effect that is being edited and the effect that is trying to be created are the same effects, this should be invoked.
        if(event.target.innerText === this.state.insideText){
            await this.setState({insideText: "hello",
                                new_effect_created: !this.state.new_effect_created});
            await this.setState({insideText: event.target.innerText,
                new_effect_created: !this.state.new_effect_created});
        }
        //Otherwise, this should be invoked
        else{
            this.setState({
                insideText: event.target.innerText,
                new_effect_created: !this.state.new_effect_created
            })
        }
    }
    //Helper function to prevent infinite updates
    changeNewEffectCalled(){
        this.setState({new_effect_created: !this.state.new_effect_created});
    }
    //Helper function to prevent infinite updates
    async updateAppliedEffects(event){
        await this.setState({
            saveButtonClicked: !this.state.saveButtonClicked,
        })
    }
    //Helper function to prevent infinite updates
    async changeSaveButton(){
        this.setState({
            saveButtonClicked: !this.state.saveButtonClicked
        })
    }
    //Helper function to prevent infinite updates
    changeSaveButton1(){
        this.setState({
            saveButtonClicked1: !this.state.saveButtonClicked1
        })
    }
    //This is for getting the final product that is saved from the effect grid and sending it to the right grid.
    updateCurrentOutputTensor(output_tensor){
        this.setState({current_output_tensor: output_tensor}, () => {
        });
    }
    //Helper for updating id
    updateID(id){
        this.setState({effect_id: id});
    }
    //Helper function for sending the current applied effects to the right grid
    async handleAppliedEffects(applied_effects){
        await this.setState({currentAppliedEffects: applied_effects});
        this.changeSaveButton1();
    }
    //Helper function for getting the selected effect's id and sending it to the effect grid
    async getEyeToEffectWithID(id, insideText){
        await this.setState({id_to_change: id,
                        insideText: insideText});
    }
    render() {
    
        
        return ( 

        <Grid container spacing={10} direction="row" wrap="nowrap"> 
            <Grid container item xs={12} spacing={3}>
                <HomeLeftGrid buttonClick={this.changeButtonState.bind(this)}/>
            </Grid>
            <Grid container item direction="column" xs={12} spacing={3}>
                <EffectGrid updateID = {this.updateID.bind(this)} 
                            insideText = {this.state.insideText} 
                            buttonClick1 ={this.updateAppliedEffects.bind(this)} 
                            updateCurrentOutputTensor = {this.updateCurrentOutputTensor.bind(this)} 
                            last_output_tensor = {this.state.last_output_tensor}
                            relevant_id = {this.state.effect_id}
                            saveButtonClicked = {this.state.saveButtonClicked}
                            changeSaveButton = {this.changeSaveButton.bind(this)}
                            handleAppliedEffects = {this.handleAppliedEffects.bind(this)}
                            id_to_remove = {this.state.id_to_remove}
                            removeDataHomepage = {this.removeDataHomepage.bind(this)}
                            id_to_change = {this.state.id_to_change}
                            getEyeToEffectWithID = {this.getEyeToEffectWithID.bind(this)}
                            new_effect_created = {this.state.new_effect_created}
                            changeButtonState = {this.changeNewEffectCalled.bind(this)}/>
            </Grid>
            <Grid container item xs={12} spacing={3}>
                <HomeRightGrid effect_id={this.state.effect_id}
                saveButtonClicked = {this.state.saveButtonClicked1} changeSaveButton = {this.changeSaveButton1.bind(this)}
                insideText = {this.state.insideText}
                sendLastData = {this.getLastData.bind(this)}
                setupMiddleGrid = {this.updateID.bind(this)}
                currentAppliedEffects = {this.state.currentAppliedEffects}
                removeDataHomepage = {this.removeDataHomepage.bind(this)}
                getEyeToEffectWithID = {this.getEyeToEffectWithID}/>
            </Grid>

            
        </Grid>
        );
    }
}

export default Homepage;
