import React, {useState, useRef, useReducer, useEffect} from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography} from "@material-ui/core";

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
    const [initialCalled, setInitialCalled] = useState(true);
    const [imageStyleURL, setImageStyleURL] = useState(null);
    const [previousImage, setPreviousImage] = useState(null);
    const [styleModel, setStyleModel] = useState(null);
    const [styleVector, setStyleVector] = useState(null);
    const [stylizedImage, setStylizedImage] = useState(null);
    const [resizeModel, setResizeModel] = useState(null);
    const [transformerModel, setTransformetModel] = useState(null);
    const imageRef = useRef();
    const imageStyleRef = useRef();
    const inputRef = useRef();
    const inputStyleRef = useRef();
    const ready = false;

    const reducer = (state, event) =>
        machine.states[state].on[event] || machine.initial;

    const [appState, dispatch] = useReducer(reducer, machine.initial);

     useEffect(() => {    // Update the document title using the browser API    
        if(initialCalled){
            if(Object.keys(props.output_tensor).length != 0){
                console.log("sa as ben geldim");
                setPreviousImage(props.output_tensor.clone());
            }
            props.handleChange({});
            
            setInitialCalled(false);
        }
          });

    const next = () => dispatch("next");

    const loadModel = async () => {
        next()
        const transformerModel = await tf.loadGraphModel('saved_model_transformer_separable_js/model.json')
        setTransformetModel(transformerModel)
        next()
    }

    const loadStyleModel = async () => {
        const model = await tf.loadGraphModel('saved_model_style_js/model.json');
        console.log(model);
        setStyleModel(model);
        next()
    }

    const identify = async () => {
        var stylized = null;
        console.log(previousImage, "sa as sa as");
        if(previousImage != null){
            stylized = await tf.tidy(() => {
                return transformerModel.predict([previousImage.div(tf.scalar(255)).expandDims(), styleVector]).squeeze();
            })
        }
        else{
            console.log(tf.browser.fromPixels(imageStyleRef.current), "this is default");
            stylized = await tf.tidy(() => {
                return transformerModel.predict([tf.browser.fromPixels(imageStyleRef.current).toFloat().div(tf.scalar(255)).expandDims(), styleVector]).squeeze();
            })
        }
        
        console.log("I predicted something")
        props.handleChange(stylized);
        //console.log(stylized)
        setStylizedImage(stylized)
        next();

    };

    const computeStyleVector = async () => {
        next();
        console.log(imageRef.current);
        const bottleneck = await tf.tidy(() => {
            return styleModel.predict(tf.browser.fromPixels(imageRef.current).toFloat().div(tf.scalar(255)).expandDims());
        })
        console.log(bottleneck);
        setStyleVector(bottleneck)
        next();
        if(previousImage != null)
            next();
    };


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

    const upload = () => {
        if(previousImage === null)
            inputRef.current.click();
        else
            next();
    }

    const styleUpload = () => inputStyleRef.current.click();

    async function getImage(url) {
        var img = new Image();
        img.src = url;

        img.onload = () => {
            return tf.browser.fromPixels(img).toFloat();
        }
    }

    const handleResizeImage = async event => {
        
        //const model = await tf.loadGraphModel('esrgan/model.json');
        const model = await tf.loadGraphModel('dcscn/model.json');
    
        setResizeModel(model);

        //const img = getImage(imageURL);
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

        console.log(resized.shape, img.shape)
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
        console.log(resized_image);
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

    const {showImage, showStyleImage, showResults} = machine.states[appState];

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

export default SuperResolution;