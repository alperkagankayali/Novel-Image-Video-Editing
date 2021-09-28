import "../App.css"
import React, {useState, useRef, useReducer, useEffect} from "react";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography} from "@material-ui/core";

// File contains page and functions for Style Transfer

// Define constant state
const machine = {
    initial: "initial",
    states: {
        initial: {on: {next: "loadingModel"}},
        loadingModel: {on: {next: "loadStyleModel"}},
        loadStyleModel: {on: {next: "loadingStyleModel"}},
        loadingStyleModel: {on: {next: "modelReady"}},
        modelReady: {on: {next: "imageReady"}},
        imageReady: {on: {next: "computeStyle"}, showImage: true},
        computeStyle: {on: {next: "styleImageReady"}, showImage: true},
        styleImageReady: {on: {next: "identifying"}, showImage: true, showStyleImage: true},

        identifying: {on: {next: "computeTransformation"}, showImage: true, showStyleImage: true},
        computeTransformation: {on: {next: "complete"}, showImage: true, showStyleImage: true},
        complete: {on: {next: "modelReady"}, showImage: true, showStyleImage: true, showResults: true}
    }
};

// Full event for Style Transfer
const StyleTransfer = (props) => {
    const [results, setResults] = useState([]);
    const [imageURL, setImageURL] = useState(null);
    const [imageStyleURL, setImageStyleURL] = useState(null);
    const [previousImage, setPreviousImage] = useState(null);
    const [model, setModel] = useState(null);
    const [styleVector, setStyleVector] = useState(null);
    const [stylizedImage, setStylizedImage] = useState(null);
    const [transformerModel, setTransformetModel] = useState(null)
    const imageRef = useRef();
    const imageStyleRef = useRef();
    const inputRef = useRef();
    const inputStyleRef = useRef();
    
    //Reducer to deal with the state changes
    const reducer = (state, event) =>
        machine.states[state].on[event] || machine.initial;

    const [appState, dispatch] = useReducer(reducer, machine.initial);

    const next = () => dispatch("next");

    //Similar to componentDidMount method, every time an update or a change happens, this method is invoked
    useEffect( () => {    // Update the document title using the browser API    
        
        //Check whether there is a product that is created by the previous layers. If so, use that product 
        if(props.last_output_tensor != null && Object.keys(props.last_output_tensor).length != 0){
            setPreviousImage(props.last_output_tensor);
        }

        //If the filter is clicked on in right grid, this is invoked since it is not creating a new filter but editing an existing one.
        //It loads the page to the appropriate state.
        if(props.getData(props.effect_id) != null && props.id_to_change != null){
            dispatch(machine.initial);         
            //Check model1 is instantiated. If so, load the already instantiated model
            if(props.applied_effects[props.getData(props.effect_id)]["model1"] != null){
                next();
                setTransformetModel(props.applied_effects[props.getData(props.effect_id)]["model1"]);
                next();
            }
            else
                setTransformetModel(null);
            //Check model2 is instantiated. If so, load the already instantiated model
            if(props.applied_effects[props.getData(props.effect_id)]["model2"] != null){
                next();
                setModel(props.applied_effects[props.getData(props.effect_id)]["model2"]);
                next();
            }
            else
                setModel(null);
            //Check image1 is instantiated. If so, load the already instantiated model
            if(props.applied_effects[props.getData(props.effect_id)]["image1"] != null){
                setImageURL(props.applied_effects[props.getData(props.effect_id)]["image1"]);
                next()
            }
            else
                setImageURL(null);
            //Check stylevector is instantiated. If so, load the already instantiated model
            if(props.applied_effects[props.getData(props.effect_id)]["kernel_size"]  != null){
                next();
                setStyleVector(props.applied_effects[props.getData(props.effect_id)]["kernel_size"]);
                next();
            }
            else
                setStyleVector(null);
            //Check image2 is instantiated. If so, load the already instantiated model
            if(props.applied_effects[props.getData(props.effect_id)]["image2"]  != null){
                setImageStyleURL(props.applied_effects[props.getData(props.effect_id)]["image2"]);
                next();
            }
            else
                setImageStyleURL(null);
            //Check the entire process is completed and a final product is created. If so, load that final product.
            if(Object.keys(props.applied_effects[props.getData(props.effect_id)]["data"]).length != 0){
                next();
                setStylizedImage(props.applied_effects[props.getData(props.effect_id)]["data"]);
                next();
            }
            else
                setStylizedImage(null);            
        }
          });

    //A method for loading the transformer model
    const loadModel = async () => {
        next();
        const transformerModel = await tf.loadGraphModel('saved_model_transformer_separable_js/model.json')
        setTransformetModel(transformerModel)
        //This is for sending the current state of the component to its parents so when a save button is clicked, the parent can save it in a dictionary manner.
        props.handleState(imageURL, imageStyleURL, appState, styleVector, null, null, transformerModel, model);
        next();        
    }
    
    // Event for loading style transfer model
    const loadStyleModel = async () => {
        next()
        const model = await tf.loadGraphModel('saved_model_style_js/model.json');
        setModel(model);
        props.handleState(imageURL, imageStyleURL, appState, styleVector, null, null, transformerModel, model);
        next()        
    }

    // Event for predicting image based from loaded image
    const identify = async () => {
        next()
        var stylized = null;
        //If there is a previous product, use that one
        if(previousImage != null){
            stylized = await tf.tidy(() => {
                return transformerModel.predict([previousImage.div(tf.scalar(255)).expandDims(), styleVector]).squeeze();
            })
        }
        else{
            stylized = await tf.tidy(() => {
                return transformerModel.predict([tf.browser.fromPixels(imageStyleRef.current).toFloat().div(tf.scalar(255)).expandDims(), styleVector]).squeeze();
            })
        }
        //Set the output of this product as the final product in the pipeline
        props.handleChange(stylized);
        setStylizedImage(stylized) 
        next();
        props.handleState(imageURL, imageStyleURL, appState, styleVector, null, null, transformerModel, model);
    };

    // Calculating style feature vector from style transfer model
    const computeStyleVector = async () => {
        next();
        const bottleneck = await tf.tidy(() => {
            return model.predict(tf.browser.fromPixels(imageRef.current).toFloat().div(tf.scalar(255)).expandDims());
        })
        setStyleVector(bottleneck)
        next();
        //If previous image is not null, this is already created, just skip it
        if(previousImage != null)
            next();
        props.handleState(imageURL, imageStyleURL, appState, bottleneck, null, null, transformerModel, model);
    };

    // Canvas for outputing generated image
    class Canvas extends React.Component {
        componentDidMount() {
            this.updateCanvas()
        }

        updateCanvas() {
            tf.browser.toPixels(stylizedImage,  this.canvas );
        }

        render() {
            return (
                <div>
                    <Typography align={"center"}><b>Stylized image</b></Typography>
                    <canvas ref={(ref) => this.canvas = ref}   width={640} height={425}/>
                </div>
            )
        }
    }

    // Reset the state
    const reset = async () => {
        setResults([]);
        //Since we reseted it, the final product should be empty
        props.handleChange({});
        await props.handleState(null, null, null, null, null, null, transformerModel, model);
        //Invokes parent method for updating the respective filter in the dictionary of filters with the new state since it is reseted.
        await props.updateWithID(props.effect_id);
        next();
    };

    //For uploading images
    const upload = () => inputRef.current.click();

    const styleUpload = () => inputStyleRef.current.click();
    // Reading uploaded input content image
    const handleUpload = async event => {
        const {files} = event.target;
        if (files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            await setImageURL(url);
            next();
            await props.handleState(url, imageStyleURL, appState, styleVector, null, null, transformerModel, model);
        }
        
        
    };

    // Reading uploaded style image
    const handleStyleUpload = async event => {
        const {files} = event.target;
        if (files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            await setImageStyleURL(url);
            next();
            await props.handleState(imageURL, url, appState, styleVector, null, null,transformerModel, model);
        }
        
       
    };
    var actionButton = null;
    //If there is no previous product, use these states
    if(previousImage === null || Object.keys(previousImage).length === 0){
            actionButton = {
            initial: {action: loadModel, text: "Load Model"},
            loadingModel: {text: "Loading Model..."},
            loadStyleModel: {action: loadStyleModel, text: "Load Style Model"},
            loadingStyleModel: {text: "Loading Style Model..."},
            modelReady: {action: upload, text: "Upload Image"},
            imageReady: {action: computeStyleVector, text: "compute style"},
            computeStyle: {text: "Computing style..."},
            styleImageReady: {action: styleUpload, text: "Compute style vector"},
            identifying: {action: identify, text: "Compute Transformer"},
            computeTransformation: {text: "Computing transformation..."},
            complete: {action: reset, text: "Reset"}
        };
    }
    else{
        actionButton = {
            initial: {action: loadModel, text: "Load Model"},
            loadingModel: {text: "Loading Model..."},
            loadStyleModel: {action: loadStyleModel, text: "Load Style Model"},
            loadingStyleModel: {text: "Loading Style Model..."},
            modelReady: {action: upload, text: "Upload Image"},
            imageReady: {action: computeStyleVector, text: "compute style"},
            computeStyle: {text: "Computing style..."},
            styleImageReady: {text: "Compute style vector"},
            identifying: {action: identify, text: "Compute Transformer"},
            computeTransformation: {text: "Computing transformation..."},
            complete: {action: reset, text: "Reset"}
        };
    }
    const {showImage, showStyleImage, showResults} = machine.states[appState];

    // Load page with details from this page as defined in react 
    return (
       
        <Grid container spacing={10} direction="row">
            
            <Grid container item  xs={12} spacing={0} direction="column">
                <Grid container spacing={2} direction={"row"}>
                    <Grid item spacing={10}>
                        {showImage && <Typography align={"center"}><b>Style image</b></Typography>}
                        {showImage && <Typography>Blaa</Typography> &&
                        <img src={imageURL} alt="upload-preview" ref={imageRef}/>}
                        <input id="content-img"
                               type="file"
                               accept="image/*"
                               capture="camera"
                               onChange={handleUpload}
                               ref={inputRef}
                        />
                    </Grid>
                    <Grid item spacing={10}>
                        {showStyleImage && <Typography align={"center"}><b>Content image</b></Typography>}
                        {showStyleImage && <img src={imageStyleURL} alt="upload-preview" ref={imageStyleRef}/>}
                        
                        {previousImage === null && <input
                            type="file"
                            accept="image/*"
                            capture="camera"
                            onChange={handleStyleUpload}
                            ref={inputStyleRef}
                        />}
                    </Grid>

                </Grid>

                {showResults && <Canvas />}
                <Grid container direction="row" wrap="nowrap">
                    <Grid container item xs={12} spacing={3}>
                        <Button variant="contained" color="secondary" onClick={actionButton[appState].action || (() => {
                        })}>
                            {actionButton[appState].text}
                        </Button>
                    </Grid>
                </Grid>
                
            </Grid>
        </Grid>
    )
        ;
}

export default StyleTransfer;