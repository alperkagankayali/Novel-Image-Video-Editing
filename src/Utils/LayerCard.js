import {Button, Grid, Typography, Card} from "@material-ui/core";
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import React, {useState, useRef, useReducer} from "react";
import CardMedia from '@material-ui/core/CardMedia';
import * as tf from '@tensorflow/tfjs';

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
        if(this.props.stylizedImage != null)
            tf.browser.toPixels(this.props.stylizedImage,  this.canvas );
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
    



    constructor(){
        super();
        this.state = {
            image: null,
            image_url: "",
            appliedEffect: "",
            insideText: "",
            btnNewScreen: true,
            appliedEffects: [],
            cardText: ""
        };
    }
    render(){
        return(
            <Card className={useStyles.root}>
              <Canvas stylizedImage ={this.props.filtered_image}/>

              <CardContent> 
                <Typography>
                    {this.props.cardText}
                </Typography>

              </CardContent>
            </Card>
        );
    }
};

export default MainCard;
