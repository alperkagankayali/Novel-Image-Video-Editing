import React, {useState, useRef, useReducer, useEffect} from "react";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid} from "@material-ui/core";

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


const SuperResolution = (props) => {
    const [results, setResults] = useState([]);
    const [imageURL, setImageURL] = useState(null);
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
            if(Object.keys(props.applied_effects[props.getData(props.effect_id)]["data"]).length != 0){
                setStylizedImage(props.applied_effects[props.getData(props.effect_id)]["data"]);
                next();
            }
            else
                setStylizedImage(null);            
            
        }
          });

    const next = () => dispatch("next");

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
        props.handleChange({});
        next();
    };

    const handleUpload = event => {
        const {files} = event.target;
        if (files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            // contentImage = getImage(imageRef.current)
            setImageURL(url);
            next();
            
            props.handleState(url, null, null, null, null, null, null, null);
        }
    };

    const upload = () => {
        if(previousImage === null){
            inputRef.current.click();
        }
            
        else
            next();
    }
    
    const handleResizeImage = async event => {
        
        //const model = await tf.loadGraphModel('esrgan/model.json');
        const model = await tf.loadGraphModel('dcscn/model.json');

        var img = null;
        if(previousImage === null)
            img = tf.browser.fromPixels(imageRef.current).toFloat().div(tf.scalar(255)).expandDims();
        else
            img = previousImage.expandDims();
       
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
        feed_dict['dropout_keep_rate'] = tf.tensor(1);
        feed_dict['x2'] = resized.expandDims(axis).reshape([new_size_arr[2],new_size_arr[0], new_size_arr[1],1]);
        feed_dict['x'] = img.expandDims(axis).reshape([size_arr[3], size_arr[1], size_arr[2], 1]);

        // const resized_image = await tf.tidy(() => {
        //     return model.predict([1], [stylizedImage.expandDims(), [1.0], resized.expandDims(), ]).squeeze().clipByValue(0, 1);
        // })
        
        const resized_image = await tf.tidy(() => {
            return model.predict(feed_dict).squeeze().clipByValue(0, 1);
        }).reshape([new_size_arr[0], new_size_arr[1], new_size_arr[2]]);
        //setStyleVector(bottleneck)
        props.handleChange(resized_image);
        setStylizedImage(resized_image);
        next();
        

    };

    const actionButton = {
        uploadState: {action: upload, text: "Upload Image"},
        resizeImg: {action: handleResizeImage, text: "Resize"},
        complete: {action: reset, text: "Reset"}
    };
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