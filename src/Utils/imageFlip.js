import React, {useState, useRef, useReducer} from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography} from "@material-ui/core";
import { Tensor3D, Tensor2D, Tensor1D, Tensor4D, Tensor } from '@tensorflow/tfjs';

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

const ImageFlip = (props) => {
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
        setStylizedImage(null);
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

    const flip_image = async event => {
        
        let img = null;
        if (stylizedImage == null)
        {
            img = tf.browser.fromPixels(imageRef.current).toFloat().div(tf.scalar(255)).expandDims();
        }
        else
        {
            img = stylizedImage.expandDims();
        }

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
        next();

    };

    const actionButton = {
        uploadState: {action: upload, text: "Upload Image"},
        resizeImg: {action: flip_image, text: "Flip",},
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
                <h3>Image Flip</h3>
                <select class = 'value_selecter' id="method">
                    <option value="1">Horizontal Flip </option>
                    <option value="2" selected="selected">Vertical Flip </option>
                    <option value="3">Rotation</option>
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

export default ImageFlip;