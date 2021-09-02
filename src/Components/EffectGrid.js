import React from "react";
import {Button, Grid} from "@material-ui/core";
import StyleTransfer from "../Utils/styleTransfer";
import SuperResolution from "../Utils/superResolution.js";
import FaceGeneration from "../Utils/faceGeneration";
import ImageBlur from "../Utils/imageBlur";
import ImageFlip from "../Utils/imageFlip";
import { randomBytes } from "crypto";

class EffectGrid extends React.Component {
    
    
    constructor() {
        super();
        this.state = {
            output_tensor: {},
            prev_output_tensor: null,
            effect_id: null,
            effect_name: "",
            my_message: "",
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
    componentDidUpdate(){
        if(this.props.new_effect_created){
            const id = randomBytes(4).toString('hex');
            this.handleChangeWithID(id);
            this.handleChange({});
            this.handleState(null, null, null, null, null, null, null, null);
            this.props.changeButtonState();
        }
        if(this.props.saveButtonClicked){
            this.updateWithID(this.state.effect_id, false);
            this.sendStateToRightGrid();
            this.props.changeSaveButton();
        }
        if(this.props.id_to_remove != null){
            this.removeDataWithID(this.props.id_to_remove);
            this.props.removeDataHomepage(null);
        }
        
        if(this.props.id_to_change != null){
            this.getEyeToEffectWithID(this.props.id_to_change);
            this.props.getEyeToEffectWithID(null, this.props.insideText);
            this.sendStateToRightGrid();
            
        }
    }
    handleChange(input_tensor){
        this.setState({output_tensor: input_tensor});
        this.props.updateCurrentOutputTensor(input_tensor);
    }
    getData(id){
        for(var key in this.state.applied_effects){
            if(this.state.applied_effects[key]["id"] === id)
                return key;
        }
        return null;
    }
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
    async removeDataWithID(id){
        for(var key in this.state.applied_effects){
            if(this.state.applied_effects[key]["id"] === id){
                let array = this.state.applied_effects;
                array.splice(key, 1);
                await this.setState({applied_effects: array});
            }
        }
    }
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
            this.setState({effect_id: id});
        }
    }
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
        this.sendStateToRightGrid();
        this.forceUpdate();

    }
    sendStateToRightGrid(){
        this.props.handleAppliedEffects(this.state.applied_effects);
    }
    async handleChangeWithID(id){
        await this.setState({effect_id: id});
        this.props.updateID(id);
    }
    changeNewCalled(){
        this.setState({new_called: false});
    }
    render() {
        
        var middleColumn;
        
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
        case "FACE GENERATION":
            middleColumn = <FaceGeneration handleChange={this.handleChange.bind(this)} output_tensor = {this.state.output_tensor}
                                            handleChange1 = {this.handleChangeWithID.bind(this)}
                                            last_output_tensor = {this.props.last_output_tensor}/>;
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
             <Button variant="contained" color="secondary" onClick = {this.props.buttonClick1} align={"center"}>Save Style</Button>
            </Grid>
        );
    }
}
export default EffectGrid;