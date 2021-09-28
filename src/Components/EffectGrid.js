import React from "react";
import {Button, Grid} from "@material-ui/core";
import StyleTransfer from "../Utils/styleTransfer";
import SuperResolution from "../Utils/superResolution.js";
import ImageBlur from "../Utils/imageBlur";
import ImageFlip from "../Utils/imageFlip";
import { randomBytes } from "crypto";

class EffectGrid extends React.Component {
    
    
    constructor() {
        super();
        this.state = {
            output_tensor: {},
            effect_id: null,
            effect_name: "",
            image1: null,
            image2: null,
            appState: null,
            kernel_size: null,
            sigma_val: null,
            image_flip: null,
            model1: null,
            model2: null,
            applied_effects: [],
            
        };
    }
    //If the component is updated as it was intended, execute one of these probabilities. Otherwise, it is not intended; therefore, do not execute any of them.
    componentDidUpdate(){
        //If there is a new effect that is created.
        if(this.props.new_effect_created){
            //Create an id for the effect. 4 bytes of hexadecimal. Thus, a possible id might be ffffffff
            const id = randomBytes(4).toString('hex');
            this.handleChangeWithID(id);
            //Give that effect an output tensor, which is empty at the moment.
            this.handleChange({});
            //Give that effect a state, which is null at the moment 
            this.handleState(null, null, null, null, null, null, null, null);
            //Preventing infinite updates
            this.props.changeButtonState();
        }
        //If you click on "Save Effect" button after creating an effect
        if(this.props.saveButtonClicked){
            //Update the effect with its state
            this.updateWithID(this.state.effect_id, false);
            //Send the final applied_effects array to the right grid
            this.sendStateToRightGrid();
            //Preventing infinite updates
            this.props.changeSaveButton();
        }
        //If an effect is requested to be removed
        if(this.props.id_to_remove != null){
            //Removes the effect
            this.removeDataWithID(this.props.id_to_remove);
            //Preventing infinite updates
            this.props.removeDataHomepage(null);
        }
        //If an effect is selected to be loaded
        if(this.props.id_to_change != null){
            //Set the state of the grid to the state of the requested effect
            this.getEyeToEffectWithID(this.props.id_to_change);
            //Preventing infinite updates
            this.props.getEyeToEffectWithID(null, this.props.insideText);
            //Send the state to the right grid so that the right grid should be updated to show the eye icon under the respective effect.
            this.sendStateToRightGrid();
            
        }
    }
    //This is invoked by the children of this component. Basically updates the very final product to become that child's output.
    handleChange(input_tensor){
        this.setState({output_tensor: input_tensor});
        this.props.updateCurrentOutputTensor(input_tensor);
    }
    //Helper function to get the key of an effect with its given id
    getData(id){
        for(var key in this.state.applied_effects){
            if(this.state.applied_effects[key]["id"] === id)
                return key;
        }
        return null;
    }
    //This is invoked by the children of this component. Basically it sets the state of the component with the given parameters.
    async handleState(image1, image2, appState, kernel_size, sigma_val, image_flip, model1, model2){
        await this.setState({image1: image1,
                        image2: image2,
                        appState: appState,
                        kernel_size: kernel_size,
                        sigma_val: sigma_val,
                        image_flip: image_flip,
                        model1: model1,
                        model2: model2});
    }
    //Helper function to remove effect with given id
    async removeDataWithID(id){
        for(var key in this.state.applied_effects){
            if(this.state.applied_effects[key]["id"] === id){
                let array = this.state.applied_effects;
                array.splice(key, 1);
                await this.setState({applied_effects: array});
            }
        }
    }
    //This is invoked whenever a selection is made via the right grid. Loads the selected effect's state and makes it as selected.
    //Finally, it makes every other effect as unselected. 
    async getEyeToEffectWithID(id){
        for(var key in this.state.applied_effects){
            let array = this.state.applied_effects;
            let array1 = array[key];
            if(this.state.applied_effects[key]["id"] === id){
                array1["isSelected"] = true;
                array.splice(key, 1, array1);
                await this.setState({applied_effects: array});
                this.handleState(array1["image1"], array1["image2"], array1["appState"], array1["kernel_size"]
                                                , array1["sigma_val"], array1["image_flip"], array1["model1"], array1["model2"]);
                
                
            }
            else{
                array1["isSelected"] = false;
                array.splice(key, 1, array1);
                await this.setState({applied_effects: array});
            }
            //Setting the current effect id that is being worked on as the id of the selected effect
            this.setState({effect_id: id});
        }
    }
    //Update the parameters of an effect with the given id
    async updateWithID(id, isSelected){
        let index = this.getData(id);
        if(index != null){
            let updatedElement = {"id": id, "data": this.state.output_tensor,
            "effect_name": this.props.insideText,     
            "image1": this.state.image1,
            "image2": this.state.image2,
            "appState": this.state.appState,
            "kernel_size": this.state.kernel_size,
            "sigma_val": this.state.sigma_val,
            "image_flip": this.state.image_flip,
            "model1": this.state.model1,
            "model2": this.state.model2,
            "isSelected": isSelected};
            let array = this.state.applied_effects;
            array.splice(index, 1, updatedElement);
            await this.setState({applied_effects: array});
        }
        else{
            await this.setState({applied_effects: [...this.state.applied_effects, {"id": id, "data": this.state.output_tensor,
                                                                                    "effect_name": this.props.insideText,     
                                                                                    "image1": this.state.image1,
                                                                                    "image2": this.state.image2,
                                                                                    "appState": this.state.appState,
                                                                                    "kernel_size": this.state.kernel_size,
                                                                                    "sigma_val": this.state.sigma_val,
                                                                                    "image_flip": this.state.image_flip,
                                                                                    "model1": this.state.model1,
                                                                                    "model2": this.state.model2,
                                                                                    "isSelected": isSelected}]});
        }
        //Sending the applied effects to the right grid so that it should update its state and render itself as well.
        this.sendStateToRightGrid();
        this.forceUpdate();

    }
    //Helper function to send the applied effects to the right grid
    sendStateToRightGrid(){
        this.props.handleAppliedEffects(this.state.applied_effects);
    }
    //Helper function for setting up the id of the newly created effect and letting parent component know.
    async handleChangeWithID(id){
        await this.setState({effect_id: id});
        this.props.updateID(id);
    }

    //For rendering
    render() {
        
        var middleColumn;
        
        //Getting exactly which effect that is needed to be loaded from the parent and load them as a switch case
        switch(this.props.insideText) {
        case "STYLE TRANSFER":
            middleColumn = <StyleTransfer handleChange={this.handleChange.bind(this)} output_tensor = {this.state.output_tensor} 
                                            handleChange1 = {this.handleChangeWithID.bind(this)}
                                            last_output_tensor = {this.props.last_output_tensor}
                                            relevant_id = {this.props.relevant_id}
                                            id_to_change = {this.props.id_to_change}
                                            effect_id = {this.props.id_to_change != null ? this.props.id_to_change: this.state.effect_id}
                                            applied_effects = {this.state.applied_effects}
                                            handleState = {this.handleState.bind(this)}
                                            getData = {this.getData.bind(this)}
                                            updateWithID = {this.updateWithID.bind(this)}
                                            changeSaveButton = {this.props.buttonClick1}/>;
            break;
        case "SUPER RESOLUTION":
            middleColumn = <SuperResolution handleChange={this.handleChange.bind(this)} output_tensor = {this.state.output_tensor} 
                                            handleChange1 = {this.handleChangeWithID.bind(this)}
                                            last_output_tensor = {this.props.last_output_tensor}
                                            relevant_id = {this.props.relevant_id}
                                            id_to_change = {this.props.id_to_change}
                                            effect_id = {this.props.id_to_change != null ? this.props.id_to_change: this.state.effect_id}
                                            applied_effects = {this.state.applied_effects}
                                            handleState = {this.handleState.bind(this)}
                                            getData = {this.getData.bind(this)}
                                            updateWithID = {this.updateWithID.bind(this)}
                                            changeSaveButton = {this.props.buttonClick1}/>;
            break;
        case "IMAGE BLUR":
            middleColumn = <ImageBlur handleChange={this.handleChange.bind(this)} output_tensor = {this.state.output_tensor} 
                                        handleChange1 = {this.handleChangeWithID.bind(this)}
                                        last_output_tensor = {this.props.last_output_tensor}
                                        relevant_id = {this.props.relevant_id}
                                        id_to_change = {this.props.id_to_change}
                                        effect_id = {this.props.id_to_change != null ? this.props.id_to_change: this.state.effect_id}
                                        applied_effects = {this.state.applied_effects}
                                        handleState = {this.handleState.bind(this)}
                                        getData = {this.getData.bind(this)}
                                        updateWithID = {this.updateWithID.bind(this)}
                                        changeSaveButton = {this.props.buttonClick1}/>;
            break;
        case "IMAGE FLIP":
            middleColumn = <ImageFlip handleChange={this.handleChange.bind(this)} output_tensor = {this.state.output_tensor} 
                                        handleChange1 = {this.handleChangeWithID.bind(this)}
                                        last_output_tensor = {this.props.last_output_tensor}
                                        relevant_id = {this.props.relevant_id}
                                        id_to_change = {this.props.id_to_change}
                                        effect_id = {this.props.id_to_change != null ? this.props.id_to_change: this.state.effect_id}
                                        applied_effects = {this.state.applied_effects}
                                        handleState = {this.handleState.bind(this)}
                                        getData = {this.getData.bind(this)}
                                        updateWithID = {this.updateWithID.bind(this)}
                                        changeSaveButton = {this.props.buttonClick1}/>;
            break;
        default:
            middleColumn = "Select your channel :)";
            
            break;
        }
        return (

            <Grid container direction="column" wrap="nowrap">
             {middleColumn}
             <Button variant="contained" color="secondary" onClick = {this.props.buttonClick1} align={"center"}>Save Effect</Button>
            </Grid>
        );
    }
}
export default EffectGrid;