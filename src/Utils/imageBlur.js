import React, {useState, useRef, useReducer, useEffect} from "react";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid} from "@material-ui/core";


function get1dGaussianKernel(sigma, size) {
    // Generate a 1d gaussian distribution across a range
    var x = tf.range(Math.floor(-size / 2) + 1, Math.floor(size / 2) + 1)
    x = tf.pow(x, 2)
    x = tf.exp(x.div(-2.0 * (sigma * sigma)))
    x = x.div(tf.sum(x))
    return x
}

function get2dGaussianKernel(size, sigma) {
    // This default is to mimic opencv2. 
    //sigma = sigma || (0.3 * ((size - 1) * 0.5 - 1) + 0.8)

    var kerne1d = get1dGaussianKernel(sigma, size)
    return tf.outerProduct(kerne1d, kerne1d)
}

function getGaussianKernel(size, sigma) {
    return tf.tidy(() => {
        var kerne2d = get2dGaussianKernel(size, sigma)
        var kerne3d = tf.stack([kerne2d, kerne2d, kerne2d])
        return tf.reshape(kerne3d, [size, size, 3, 1])
    })
}

function blur(image, kernel) {
    return tf.tidy(() => {
        return tf.depthwiseConv2d(image, kernel, 1, "valid")
    })
}

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


const ImageBlur = (props) => {
    const [results, setResults] = useState([]);
    const [imageURL, setImageURL] = useState(null);
    const [kernel_size, setKernelSize] = useState(null);
    const [sigma_val, setSigmaVal] = useState(null);
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
            if(props.applied_effects[props.getData(props.effect_id)]["kernel_size"] != null){
                setKernelSize(props.applied_effects[props.getData(props.effect_id)]["kernel_size"]);
            }
            else
                setKernelSize(null);
            if(props.applied_effects[props.getData(props.effect_id)]["sigma_val"] != null){
                setSigmaVal(props.applied_effects[props.getData(props.effect_id)]["sigma_val"]);
            }
            else
                setSigmaVal(null);
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
            setImageURL(url);
            next();
            props.handleState(url, null, null, null, null, null, null, null);
        }
    };

    const upload = () => {
        if(previousImage === null)
            inputRef.current.click();
        else
            next();
    }

    const blur_image = async event => {
        
        let img = null;
        if(previousImage === null)
            img = tf.browser.fromPixels(imageRef.current).toFloat().div(tf.scalar(255)).expandDims();
        else
            img = previousImage.expandDims();

        let size = parseInt(document.getElementById("size_value").value);
        let sigma = parseFloat(document.getElementById("sigma_value").value);

        if (size == 3)
        {
            // TODO : Not working for 3
            size = 2;
        }
        
        const kernel = getGaussianKernel(size,sigma);
        
        let blurred_img = blur(img, kernel);
        blurred_img = blurred_img.squeeze(0).clipByValue(0, 1);

        props.handleChange(blurred_img);
        setStylizedImage(blurred_img);
        props.handleState(imageURL, null, null, size, sigma, null, null, null);   
        next();

    };

    const actionButton = {
        uploadState: {action: upload, text: "Upload Image"},
        resizeImg: {action: blur_image, text: "Blur",},
        complete: {action: reset, text: "Reset"}
    };
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
                <h3>Kenel Size Value</h3>
                <select class = 'value_selecter' id="size_value">
                    <option value="1" selected={(kernel_size != null && kernel_size === 1) ? "selected" : ""}>Small Blur / 1</option>
                    <option value="3" selected={(kernel_size != null && kernel_size === 3) ? "selected" : ""}>Middle Blur / 3 </option>
                    <option value="5" selected={(kernel_size != null && kernel_size === 5) ? "selected" : ""}>Hard Blur / 5</option>
                    <option value="7" selected={(kernel_size != null && kernel_size === 7) ? "selected" : ""}>Extreme Blur / 7</option>
                </select>
                <h3>Sigma Value</h3>
                <select class = 'value_selecter' id="sigma_value">
                    <option value="0" selected={(sigma_val != null && sigma_val === 0) ? "selected" : ""}>0.0</option>
                    <option value="0.25" selected={(sigma_val != null && sigma_val === 0.25) ? "selected" : ""}>0.25</option>
                    <option value="0.5" selected={(sigma_val != null && sigma_val === 0.5) ? "selected" : ""}>0.5</option>
                    <option value="0.75" selected={(sigma_val != null && sigma_val === 0.75) ? "selected" : ""}>0.75</option>
                    <option value="1" selected={(sigma_val != null && sigma_val === 1) ? "selected" : ""}>1.0</option>
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

export default ImageBlur;