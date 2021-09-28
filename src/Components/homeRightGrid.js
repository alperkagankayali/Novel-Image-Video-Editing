import "../App.css"
import React from "react";
import {Grid, Typography, Card} from "@material-ui/core";
import MainCard from "../Utils/LayerCard";



class HomeRightGrid extends React.Component {
    
    
    constructor(props) {
        super();
        this.state = {
            insideText: "",
            effectsAndTheirResponses: [],
            id_to_change: null
        };
    }
    //When there is an update in the Effect Grid, it should also trigger an update here. Thus, this function is invoked when this is the case.
    async componentDidUpdate(){
        if(this.props.saveButtonClicked){
            //For preventing infinite updates
            this.props.changeSaveButton();
            //setting up the state.
            await this.setState({effectsAndTheirResponses: this.props.currentAppliedEffects});
            //Sending the last data to the effect grid since this is the current product that should be worked on.
            this.getLastData();
        }
    }
    //Helper function for getting the last product that is created and saved in the system
    getLastData(){
        let latest = null;
        for(var key in this.state.effectsAndTheirResponses){
            latest = this.state.effectsAndTheirResponses[key]["data"];
        }
        this.props.sendLastData(latest);
    }
    //Helper function for removing the respective effect. Takes the id of the respective effect and sends it to the parent.
    async removeDataWithID(id){
        this.props.removeDataHomepage(id);
    }
    //Helper function for selecting the respective effect and re-rendering the screen. Takes the id of the respective effect and sends it to the parent.
    async getEyeToEffectWithID(id, insideText){
        await this.setState({id_to_change: id,
            insideText: insideText});
        await this.props.getEyeToEffectWithID(this.state.id_to_change, this.state.insideText);
    }
    render() {
        return (
            <Grid container direction="row" wrap="nowrap">
                <Card>
                    <Typography variant="h4">
                        Applied Effects
                    </Typography>
                    {Object.keys(this.state.effectsAndTheirResponses).map((key, index) => ( 
            
                        <MainCard id={this.state.effectsAndTheirResponses[key]["id"]} 
                                    cardText={this.state.effectsAndTheirResponses[key]["effect_name"]}
                                    data = {this.state.effectsAndTheirResponses[key]["data"]}
                                    removeEffectWithID={this.removeDataWithID.bind(this)}
                                    isSelected = {this.state.effectsAndTheirResponses[index]["isSelected"]}
                                    getEyeToEffectWithID = {this.getEyeToEffectWithID.bind(this)}/> 
                    ))
                    }
                    
                </Card>
            </Grid>
        );
    }
}
export default HomeRightGrid;
