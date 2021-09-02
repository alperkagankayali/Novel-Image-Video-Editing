import "../App.css"
import React from "react";
import {Button, Grid} from "@material-ui/core";


class HomeLeftGrid extends React.Component {
    

    constructor() {
        super();
        /*this.state = {
            insideText: "",
            btnNewScreen: true
        };*/
    }
    render() {
        //var text = this.state.btnNewScreen ? 'Add new' : 'Screens';
        
        //If you want to add a new channel, just add it as a button.

        return (

            <Grid container direction="column" wrap="nowrap">
                <Button variant="contained" color="secondary" onClick={this.props.buttonClick}>
                    style transfer
                </Button>
                <Button variant="contained" color="secondary" onClick={this.props.buttonClick}>
                    super resolution
                </Button>
                <Button variant="contained" color="secondary" onClick={this.props.buttonClick}>
                    image blur
                </Button>
                <Button variant="contained" color="secondary" onClick={this.props.buttonClick}>
                    image flip
                </Button>
                <Button variant="contained" color="secondary" onClick={this.props.buttonClick}>
                    face generation
                </Button>
            </Grid>
        );
    }
}
export default HomeLeftGrid;
