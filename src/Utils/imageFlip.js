import React, {useState, useRef, useReducer, useEffect} from "react";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid} from "@material-ui/core";

// In this file we define function and page for flipping the image

// Define constant states
const machine = {
    initial: "initial",
    states: {
        initial: {on: {next: "loadingModel"}},
        loadingModel: {on: {next: "loadingStyleModel"}},
        loadingStyleModel: {on: {next: "modelReady"}},
        modelReady: {on: {next: "imageReady"}},
        imageReady: {on: {next: "computeStyle"}, showImage: true},
        computeStyle: {on: {next: "styleImageReady"}, showImage: true},
        styleImageReady: {on: {next: "identifying"}, showImage: true, showStyleImage: true},

        identifying: {on: {next: "complete"}, showImage: true, showStyleImage: true},
        complete: {on: {next: "modelReady"}, showImage: true, showStyleImage: true, showResults: true}
    }
};

// Full event for Flipping
const ImageFlip = (props) => {
    const [results, setResults] = useState([]);
    const [imageURL, setImageURL] = useState(null);
    const [image_flip, setImageFlip] = useState(null);
    const [previousImage, setPreviousImage] = useState(null);
    const [stylizedImage, setStylizedImage] = useState(null);
    const imageRef = useRef();
    const inputRef = useRef();

    const reducer = (state, event) =>
        machine.states[state].on[event] || machine.initial;

    const [appState, dispatch] = useReducer(reducer, machine.initial);
    useEffect(() => {    // Update the document title using the browser API    
        if(props.last_output_tensor != null && Object.keys(props.last_output_tensor).length != 0){
            setPreviousImage(props.last_output_tensor);
            
        }
        if(props.getData(props.effect_id) != null && props.id_to_change != null){
            dispatch(machine.initial);            
            if(props.applied_effects[props.getData(props.effect_id)]["image1"] != null){
                setImageURL(props.applied_effects[props.getData(props.effect_id)]["image1"]);
                next()
            }
            else
                setImageURL(null);
            if(props.applied_effects[props.getData(props.effect_id)]["image_flip"] != null){
                setImageFlip(props.applied_effects[props.getData(props.effect_id)]["image_flip"]);
            }
            else
                setImageFlip(null);
            if(Object.keys(props.applied_effects[props.getData(props.effect_id)]["data"]).length != 0){
                setStylizedImage(props.applied_effects[props.getData(props.effect_id)]["data"]);
                next();
            }
            else
                setStylizedImage(null);
            
            
        }
          });


    const next = () => dispatch("next");

    // Use canvas to show generated flipped image
    class Canvas extends React.Component {
        componentDidMount() {
            this.updateCanvas()
        }

        updateCanvas() {
           if (stylizedImage)
            tf.browser.toPixels(stylizedImage,  this.canvas );
        }

        render() {
            return (
                <div>
                    <canvas ref={(ref) => this.canvas = ref}   width={256} height={256}/>
                </div>
            )
        }
    }

    const reset = async () => {
        setResults([]);
        props.handleChange({});
        next();
    };

    // Read the uploaded image
    const handleUpload = event => {
        const {files} = event.target;
        setStylizedImage(null);
        if (files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            setImageURL(url);
            next();
            props.handleState(url, null, null, null, null, null, null, null);
        }
    };

    const upload = () => inputRef.current.click();

    // Event for flipping the image
    const flip_image = async event => {
        
        let img = null;
       
        if(previousImage === null)
            img = tf.browser.fromPixels(imageRef.current).toFloat().div(tf.scalar(255)).expandDims();
        else
            img = previousImage.expandDims();

        // Read method how user wants to flip the image
        let method = parseInt(document.getElementById("method").value)

        let flipped_img = null;

        if (method == 1)
        {
            flipped_img = tf.image.flipLeftRight(img).squeeze(0);
        }
        else if (method == 2)
        {
            flipped_img = tf.reverse(img, 1).squeeze(0)
        }
        else if (method == 3)
        {
            let max = 0.2;
            let min = -0.2;
            let rand = Math.random() * (max - min) + min;

            if (rand == 0.0)
            {
                rand = 0.1
            }

            flipped_img = tf.image.rotateWithOffset(img, rand).squeeze();
        }

        props.handleChange(flipped_img);
        setStylizedImage(flipped_img);
        props.handleState(imageURL, null, null, null, null, method , null, null); 
        next();

    };

    const actionButton = {
        uploadState: {action: upload, text: "Upload Image"},
        resizeImg: {action: flip_image, text: "Flip",},
        complete: {action: reset, text: "Reset"}
    };

    const {showImage, showStyleImage, showResults} = machine.states[appState];

    // Load page with details from this page as defined in react 
    return (
        <div>

            <img src={imageURL} alt="upload-preview" ref={imageRef} 
                    width="256" height="256"/>
            <br></br>
            <Button variant="contained" color="secondary" onClick={actionButton['uploadState'].action || (() => {
                            })}>
                                {actionButton['uploadState'].text}
            </Button>
            <Grid item spacing={10}>
                        <input id="content-img"
                               type="file"
                               accept="image/*"
                               capture="camera"
                               onChange={handleUpload}
                               ref={inputRef}
                        />
            </Grid>
            <Grid>
                <h3>Image Flip</h3>
                <select class = 'value_selecter' id="method">
                    <option value="1" selected={(image_flip != null && image_flip === 1) ? "selected" : ""}>Horizontal Flip </option>
                    <option value="2" selected={(image_flip != null && image_flip === 2) ? "selected" : ""}>Vertical Flip </option>
                    <option value="3" selected={(image_flip != null && image_flip === 3) ? "selected" : ""}>Rotation</option>
                </select>
            </Grid>
            <Button variant="contained" color="secondary" onClick={actionButton['resizeImg'].action || (() => {
                })}>
                    {actionButton['resizeImg'].text}
            </Button>
            {<Canvas/>}
        </div>
    )
        ;
}

export default ImageFlip;