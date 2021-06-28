import "../App.css"
import React, {useState, useRef, useReducer} from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography} from "@material-ui/core";

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

const StyleTransfer = () => {
    const [results, setResults] = useState([]);
    const [imageURL, setImageURL] = useState(null);
    const [imageStyleURL, setImageStyleURL] = useState(null);
    const [model, setModel] = useState(null);
    const [styleVector, setStyleVector] = useState(null);
    const [stylizedImage, setStylizedImage] = useState(null);
    const [transformerModel, setTransformetModel] = useState(null)
    const imageRef = useRef();
    const imageStyleRef = useRef();
    const inputRef = useRef();
    const inputStyleRef = useRef();

    const reducer = (state, event) =>
        machine.states[state].on[event] || machine.initial;

    const [appState, dispatch] = useReducer(reducer, machine.initial);

    const next = () => dispatch("next");

    const loadModel = async () => {
        next()
        const transformerModel = await tf.loadGraphModel('saved_model_transformer_separable_js/model.json')
        setTransformetModel(transformerModel)
        next()
    }

    const loadStyleModel = async () => {
        next()
        const model = await tf.loadGraphModel('saved_model_style_js/model.json');
        setModel(model);
        next()
    }

    const identify = async () => {
        next()
        const stylized = await tf.tidy(() => {
            return transformerModel.predict([tf.browser.fromPixels(imageStyleRef.current).toFloat().div(tf.scalar(255)).expandDims(), styleVector]).squeeze();
        })
        console.log("I predicted something")
        setStylizedImage(stylized)
        next();
    };

    const computeStyleVector = async () => {
        next();
        const bottleneck = await tf.tidy(() => {
            return model.predict(tf.browser.fromPixels(imageRef.current).toFloat().div(tf.scalar(255)).expandDims());
        })
        setStyleVector(bottleneck)
        next();
    };


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

    const reset = async () => {
        setResults([]);
        next();
    };

    const upload = () => inputRef.current.click();

    const styleUpload = () => inputStyleRef.current.click();

    async function getImage(url) {
        var img = new Image();
        img.src = url;

        img.onload = () => {
            return tf.browser.fromPixels(img).toFloat();
        }
    }

    const handleUpload = event => {
        const {files} = event.target;
        if (files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            // contentImage = getImage(imageRef.current)
            setImageURL(url);
            next();
        }
    };

    const handleStyleUpload = event => {
        const {files} = event.target;
        if (files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            // styleImage = getImage(url)
            setImageStyleURL(url);
            next();
        }
    };

    const actionButton = {
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

    const {showImage, showStyleImage, showResults} = machine.states[appState];

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
                        <input
                            type="file"
                            accept="image/*"
                            capture="camera"
                            onChange={handleStyleUpload}
                            ref={inputStyleRef}
                        />
                    </Grid>
                </Grid>
                {showResults && <Canvas/>}
                <Button variant="contained" color="secondary" onClick={actionButton[appState].action || (() => {
                })}>
                    {actionButton[appState].text}
                </Button>
            </Grid>
        </Grid>
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

export default StyleTransfer;
