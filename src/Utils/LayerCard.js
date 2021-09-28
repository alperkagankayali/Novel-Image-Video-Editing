import {Button, Typography, Card} from "@material-ui/core";
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import React from "react";
import * as tf from '@tensorflow/tfjs';
import VisibilityIcon from '@material-ui/icons/Visibility';
import CardActionArea from '@material-ui/core/CardActionArea';

//CSS for the card component
const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 100,
  },

}));

//Canvas specifically for displaying the output tensor
class Canvas extends React.Component {
    componentDidMount() {
        this.updateCanvas()
    }
    componentDidUpdate(){
        this.updateCanvas();
    }

    updateCanvas() {
        //If there is a tensor to show(meaning the filter process is ended and there is an output), show that tensor.
        if(this.props.stylizedImage !== null && Object.keys(this.props.stylizedImage).length !== 0){
            tf.browser.toPixels(this.props.stylizedImage,  this.canvas );
        }
        //Otherwise, print blank
        if(Object.keys(this.props.stylizedImage).length == 0){
            const context = this.canvas.getContext('2d');
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
    }

    render() {
        return (
            <div>
                <canvas ref={(ref) => this.canvas = ref}   width={100} height={100}/>
            </div>
        )
    }
}

class MainCard extends React.Component{
    constructor(props){
        super(props);
    }
    //If remove filter button is clicked, send the request to the parent
    removeEffect(){
        this.props.removeEffectWithID(this.props.id);
    }
    //If the effect is being selected via a click, send the request to the parent
    async selectEffect(){
        await this.props.getEyeToEffectWithID(this.props.id, this.props.cardText);
    }
    //Render the card with its respective data which is provided by its parent
    render(){
        
        return(
            <Card className={useStyles.root} >
                  <CardActionArea onClick={this.selectEffect.bind(this)}>
                  <Canvas stylizedImage ={this.props.data}/>
                  <CardContent> 
                    <Typography>
                    {this.props.cardText}    
                    </Typography>
                    
                    <Button variant="contained" color="secondary" onClick={this.removeEffect.bind(this)}>
                        Remove Filter
                    </Button>
                  </CardContent>
                  {this.props.isSelected && <VisibilityIcon/>}
                  </CardActionArea>
            </Card>
        );
    }
    
};
export default MainCard;
