import {Button, Typography, Card} from "@material-ui/core";
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import React from "react";
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
    componentDidUpdate(){
        this.updateCanvas();
    }
    updateCanvas() {
        if(this.props.stylizedImage != null && !Object.keys(this.props.stylizedImage).length == 0){
            tf.browser.toPixels(this.props.stylizedImage,  this.canvas );
        }
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
    async componentWillMount(){
    }
    removeEffect(){
        this.props.removeEffectWithID(this.props.id);
    }
    async selectEffect(){
        await this.props.getEyeToEffectWithID(this.props.id, this.props.cardText);
    }
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
