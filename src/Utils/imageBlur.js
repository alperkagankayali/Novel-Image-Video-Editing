import React, {useState, useRef, useReducer} from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography} from "@material-ui/core";
import { Tensor3D, Tensor2D, Tensor1D, Tensor4D, Tensor } from '@tensorflow/tfjs';

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
    const [styleModel, setStyleModel] = useState(null);
    const [styleVector, setStyleVector] = useState(null);
    const [stylizedImage, setStylizedImage] = useState(null);
    const [transformerModel, setTransformetModel] = useState(null)
    const imageRef = useRef();
    const imageStyleRef = useRef();
    const inputRef = useRef();
    const inputStyleRef = useRef();
    const ready = false;

    const reducer = (state, event) =>
        machine.states[state].on[event] || machine.initial;

    const [appState, dispatch] = useReducer(reducer, machine.initial);

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
        }
    };

    const upload = () => inputRef.current.click();

    async function getImage(url) {
        var img = new Image();
        img.src = url;

        img.onload = () => {
            return tf.browser.fromPixels(img).toFloat();
        }
    }

    const blur_image = async event => {
        
        let img = tf.browser.fromPixels(imageRef.current).toFloat().div(tf.scalar(255)).expandDims();

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
        next();

    };

    const actionButton = {
        uploadState: {action: upload, text: "Upload Image"},
        resizeImg: {action: blur_image, text: "Blur",},
        complete: {action: reset, text: "Reset"}
    };

    const {showImage, showStyleImage, showResults} = machine.states[appState];

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
                <h3>Kenel Size Value</h3>
                <select class = 'value_selecter' id="size_value">
                    <option value="1">Small Blur / 1</option>
                    <option value="3">Middle Blur / 3 </option>
                    <option value="5" selected="selected">Hard Blur / 5</option>
                    <option value="7">Extreme Blur / 7</option>
                </select>
                <h3>Sigma Value</h3>
                <select class = 'value_selecter' id="sigma_value">
                    <option value="0">0.0</option>
                    <option value="0.25" selected="selected">0.25</option>
                    <option value="0.5">0.5</option>
                    <option value="0.75">0.75</option>
                    <option value="1">1.0</option>
                </select>
            </Grid>
            <Button variant="contained" color="secondary" onClick={actionButton['resizeImg'].action || (() => {
                })}>
                    {actionButton['resizeImg'].text}
            </Button>
            {<Canvas/>}
        </div>
        //     <Container fluid>
        //         <Row>
        //             <Col md={3}>
        //                 <Card>
        //                     <Card.Body>Content image</Card.Body>
        //             {showImage && <img src={imageURL} alt="upload-preview" ref={imageRef}/>}
        //             <input
        //                 type="file"
        //                 accept="image/*"
        //                 capture="camera"
        //                 onChange={handleUpload}
        //                 ref={inputRef}
        //             />
        //                 </Card>
        //                 </Col>
        //
        //             <Col>
        //             {showStyleImage && <img src={imageStyleURL} alt="upload-preview" ref={imageStyleRef}/>}
        //             Style image
        //             <input
        //                 type="file"
        //                 accept="image/*"
        //                 capture="camera"
        //                 onChange={handleStyleUpload}
        //                 ref={inputStyleRef}
        //             />
        //                 </Col>
        //             </Row>
        //         <Row>
        //         {
        //             showResults && (
        //                 <ul>
        //                     {results.map(({className, probability}) => (
        //                         <li key={className}>{`${className}: %${(probability * 100).toFixed(
        //                             2
        //                         )}`}</li>
        //                     ))}
        //                 </ul>
        //             )
        //         }
        //         <button onClick={actionButton[appState].action || (() => {
        //         })}>
        //             {actionButton[appState].text}
        //         </button>
        //             </Row>
        //     </Container>
    )
        ;
}

export default ImageBlur;