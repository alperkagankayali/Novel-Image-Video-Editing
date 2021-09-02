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
    async componentDidUpdate(){
        if(this.props.saveButtonClicked){
            this.props.changeSaveButton();
            await this.setState({effectsAndTheirResponses: this.props.currentAppliedEffects});
            this.getLastData();
        }
    }
    getLastData(){
        let latest = null;
        for(var key in this.state.effectsAndTheirResponses){
            latest = this.state.effectsAndTheirResponses[key]["data"];
        }
        this.props.sendLastData(latest);
    }
    async removeDataWithID(id){
        this.props.removeDataHomepage(id);
    }
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
