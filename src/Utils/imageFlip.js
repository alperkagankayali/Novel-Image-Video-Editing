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

    //Reducer to deal with the state changes
    const reducer = (state, event) =>
        machine.states[state].on[event] || machine.initial;

    const [appState, dispatch] = useReducer(reducer, machine.initial);

    //Similar to componentDidMount method, every time an update or a change happens, this method is invoked
    useEffect(() => {    // Update the document title using the browser API    
        //Check whether there is a product that is created by the previous layers. If so, use that product
        if(props.last_output_tensor != null && Object.keys(props.last_output_tensor).length != 0){
            setPreviousImage(props.last_output_tensor);
        }

        //If the filter is clicked on in right grid, this is invoked since it is not creating a new filter but editing an existing one.
        //It loads the page to the appropriate state.
        if(props.getData(props.effect_id) != null && props.id_to_change != null){
            dispatch(machine.initial);
            //Check image1 is instantiated. If so, load the already instantiated model            
            if(props.applied_effects[props.getData(props.effect_id)]["image1"] != null){
                setImageURL(props.applied_effects[props.getData(props.effect_id)]["image1"]);
                next()
            }
            else
                setImageURL(null);
            //Check if image_flip is instantiated. If so, load the already instantiated model
            if(props.applied_effects[props.getData(props.effect_id)]["image_flip"] != null){
                setImageFlip(props.applied_effects[props.getData(props.effect_id)]["image_flip"]);
            }
            else
                setImageFlip(null);
            //Check the entire process is completed and a final product is created. If so, load that final product.
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
        //Since we reseted it, the final product should be empty
        props.handleChange({});
        await props.handleState(null, null, null, null, null, null, null, null);
        //Invokes parent method for updating the respective filter in the dictionary of filters with the new state since it is reseted.
        await props.updateWithID(props.effect_id);
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
    //For uploading images
    const upload = () => inputRef.current.click();

    // Event for flipping the image
    const flip_image = async event => {
        
        let img = null;
        // Check if previous image exists
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
        
        //Rotate randomly
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
        //Save the final product by sending it to the parent
        props.handleChange(flipped_img);
        setStylizedImage(flipped_img);
        props.handleState(imageURL, null, null, null, null, method , null, null); 
        next();

    };
    //Different States
    const actionButton = {
        uploadState: {action: upload, text: "Upload Image"},
        resizeImg: {action: flip_image, text: "Flip",},
        complete: {action: reset, text: "Reset"}
    };

    

    // Load page with details from this page as defined in react 
    return (
        <div>

            <img src={imageURL} alt="upload-preview" ref={imageRef} 
                    width="256" height="256"/>
            <br></br>
            {previousImage === null && <Button variant="contained" color="secondary" onClick={actionButton['uploadState'].action || (() => {
                            })}>
                                {actionButton['uploadState'].text}
            </Button>}
            {previousImage === null && <Grid item spacing={10}>
                        <input id="content-img"
                               type="file"
                               accept="image/*"
                               capture="camera"
                               onChange={handleUpload}
                               ref={inputRef}
                        />
            </Grid>}
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