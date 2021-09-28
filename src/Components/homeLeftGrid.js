import "../App.css"
import React from "react";
import {Button, Grid} from "@material-ui/core";


class HomeLeftGrid extends React.Component {
    

    constructor() {
        super();
        
    }
    render() {
        
        //Effects given as a button, which invokes parent method to deal with the click.

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
                
            </Grid>
        );
    }
}
export default HomeLeftGrid;
