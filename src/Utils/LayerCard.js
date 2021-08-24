import {Button, Grid, Typography, Card} from "@material-ui/core";
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import React, {useState, useRef, useReducer} from "react";
import CardMedia from '@material-ui/core/CardMedia';
import * as tf from '@tensorflow/tfjs';
import VisibilityIcon from '@material-ui/icons/Visibility';
import CardActionArea from '@material-ui/core/CardActionArea';


const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 100,
  },

}));

class Canvas extends React.Component {
    componentDidMount() {
        this.updateCanvas()
    }

    updateCanvas() {
        console.log(Object.keys(this.props.stylizedImage).length);
        this.forceUpdate();
        if(!Object.keys(this.props.stylizedImage).length == 0){
            console.log("shouldn't be here");
            tf.browser.toPixels(this.props.stylizedImage,  this.canvas );
        }
        //const url_stylized_image = URL.createObjectURL(stylizedImage);
        
    }

    render() {
        return (
            <div>
                <canvas ref={(ref) => this.canvas = ref}   width={100} height={100}/>
            </div>
        )
    }
}

class MainCard extends React.Component {
    


    
    constructor(props){
        super(props);
        this.state = {
            image: null,
            image_url: "",
            appliedEffect: "",
            EffectID: "",
            btnNewScreen: true,
            appliedEffects: [],
            cardText: "",
            isSelected: false
        };
    }
    componentWillMount(){
        console.log("update oldu artık amk");
        //return true;
    }
    updateEffect(){
        console.log(this.props.effectID);
        this.setState({EffectID: this.props.effectID + 1,
                        isSelected: this.props.getYourEffect(this.props.effectID)});
    }
    removeAppliedEffect(e){
        console.log("coming effectID is " + (this.state.EffectID - 1));
        this.props.removeAppliedEffects(this.props.effectID);

        this.forceUpdate();
    }
    async selectEffect(e){
        
        await this.props.addEyeForSelected(this.props.effectID);
        //await this.setState({isSelected: true});
        console.log(this.props.updateHappened + " is for " + this.props.effectID);
        //this.forceUpdate();
    }
    updateSelected(){
        this.setState({isSelected: this.props.getYourEffect(this.props.effectID)});
        return this.props.getYourEffect(this.props.effectID);
    }
    render(){
        console.log(this);      
        if(this.state.EffectID == ""){
            this.updateEffect();
        }
        if(this.props.updateHappenedAmk){
             console.log("here bro");
            this.updateEffect();
            this.props.changeUpdateHappened();
        }
        return(
            <Card className={useStyles.root} >
              <CardActionArea onClick={this.selectEffect.bind(this)}>
              <Canvas stylizedImage ={this.props.filtered_image}/>

              <CardContent> 
                <Typography>
                    {this.props.cardText}
                </Typography>
                <Button variant="contained" color="secondary" onClick={this.removeAppliedEffect.bind(this)}>
                    Remove Filter
                </Button>

              </CardContent>
              {this.props.updateHappened && <VisibilityIcon/>}
              </CardActionArea>
            </Card>
        );
    }
};

export default MainCard;
