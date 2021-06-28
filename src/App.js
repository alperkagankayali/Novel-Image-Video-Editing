import "./App.css";
import Homepage from "./Pages/Homepage";
import React, {useState, useRef, useReducer} from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import {Button, Grid, Typography} from "@material-ui/core";

const App = () => {
    return <Homepage />;
}

export default App;
