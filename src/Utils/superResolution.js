import React, {useState, useRef, useReducer, useEffect} from "react";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid} from "@material-ui/core";

// This file containts page and functions for super resolution

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

// Full Event for Super Resolution
const SuperResolution = (props) => {
    const [results, setResults] = useState([]);
    const [imageURL, setImageURL] = useState(null);
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

    // Canvas for outputing the generated resized image
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
                    {/* <Typography align={"center"}><b>Stylized image</b></Typography> */}
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

    // Read the image from upload
    const handleUpload = event => {
        const {files} = event.target;
        if (files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            
            setImageURL(url);
            next();
            
            props.handleState(url, null, null, null, null, null, null, null);
        }
    };
    //For uploading images
    const upload = () => {
        if(previousImage === null){
            inputRef.current.click();
        }
            
        else
            next();
    }
    
    // Load the resizing model, with its parameters and resize the image
    const handleResizeImage = async event => {
        
        
        // Load the model
        const model = await tf.loadGraphModel('dcscn/model.json');

        // Check if previous image exists
        var img = null;
        if(previousImage === null)
            img = tf.browser.fromPixels(imageRef.current).toFloat().div(tf.scalar(255)).expandDims();
        else
            img = previousImage.expandDims();
       
        // Define new size for image
        let size_arr = img.shape;
        let size_increase = 2; // Right now only increase by 2
        let new_size_arr = [parseInt(size_arr[1] * size_increase), // NWHC sp 0 - batch size
                            parseInt(size_arr[2] * size_increase), 
                            size_arr[3]];

        const resized = tf.image.resizeBilinear(img, [new_size_arr[0], new_size_arr[1]]);
        img = tf.image.resizeBilinear(img, [size_arr[1], size_arr[2]]);

        var feed_dict = new Object();
        // or the shorthand way
        var feed_dict = {};
        const axis = 3;
        // Define model parameters
        feed_dict['dropout_keep_rate'] = tf.tensor(1); // We are inference state so dropout is 1
        feed_dict['x2'] = resized.expandDims(axis).reshape([new_size_arr[2],new_size_arr[0], new_size_arr[1],1]);
        feed_dict['x'] = img.expandDims(axis).reshape([size_arr[3], size_arr[1], size_arr[2], 1]);
        
        // Predict the result
        const resized_image = await tf.tidy(() => {
            return model.predict(feed_dict).squeeze().clipByValue(0, 1);
        }).reshape([new_size_arr[0], new_size_arr[1], new_size_arr[2]]);
        
        props.handleChange(resized_image);
        setStylizedImage(resized_image);
        next();
        

    };

    //Different States
    const actionButton = {
        uploadState: {action: upload, text: "Upload Image"},
        resizeImg: {action: handleResizeImage, text: "Resize"},
        complete: {action: reset, text: "Reset"}
    };

    // Load page with details from this page as defined in react 
    return (
        <div>

            <img src={imageURL} alt="upload-preview" ref={imageRef} 
                    />

            {previousImage === null && <Grid item spacing={10}>
                        <input id="content-img"
                               type="file"
                               accept="image/*"
                               capture="camera"
                               onChange={handleUpload}
                               ref={inputRef}
                        />
            </Grid>}
            {previousImage === null &&<Button variant="contained" color="secondary" onClick={actionButton['uploadState'].action || (() => {
                })}>
                    {actionButton['uploadState'].text}
            </Button>}
            <br></br>
            <Button variant="contained" color="secondary" onClick={actionButton['resizeImg'].action || (() => {
                })}>
                    {actionButton['resizeImg'].text}
            </Button>
            {<Canvas/>}
        </div>
    )
        ;
}

export default SuperResolution;