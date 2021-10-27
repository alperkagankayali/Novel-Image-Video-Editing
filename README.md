# Novel-Image-Video-Editing

This project aims to mimic Adobe Photoshop effects and various other ones using Deep Learning models and algorithms. 

## How to install

These instructions will show you how to install the project. 

### Prerequisites

- [Node JS](https://nodejs.org/en/download/)

### Installing

### Linux or Mac

First, open your terminal. 

Then, clone the project as such

```
git clone <url_of_the_project>
```

Then, change directory to the project's directory
```
cd Novel-Image-Video-Editing
```

Finally, install the dependencies using Node

```
npm install
```
### Windows

First, open your command prompt and check whether you have git. 

```
git version
```

should return the version of git you have.

Then, clone the project as such

```
git clone <url_of_the_project>
```

Then, change directory to the project's directory
```
cd Novel-Image-Video-Editing
```

Finally, install the dependencies using Node

```
npm install
```

Note: If Command Prompt responds as "'npm' is not recognized as an internal or external command, operable program or batch file.", you have to install Node.js, restart your Command Prompt and try again.

## How to run

If you have followed the steps and did not encounter any errors. You are ready to run the project! Simply run this command in your terminal:

```
npm start
```

which will run the project. The project will be displayed here:

https://localhost:3000/

## Future Work

* Implement Generative Network in tfjs to convert face generation into
different style (Cartoon style, Artistic Style. etc).
* Implement StyleGAN tfjs model to generate Faces from random latent
space by user. User can colorize small rectangles drawn by programs, to make customizable latent space and application will be able to
generate high resolution (1024x1024) realistic face, based on that input. This application will be used just for fun and user can also observe
which rectangle will affect what (maybe skin color, backgorund, etc ... ) 
* Implement new version of super resolution model ESRGAN, which can
increase resolution of the image up to 4x, for better and more acurate resizing (generate 256x256 from 64x64)
* Add upload and algorithm computations on video
* The Design can be improved by a professional graphics designer
* More effects can be added
* More interactive Applied Effects section can be done, for example adding a
drag and drop feature to this section.
* Currently this implementation allows users to create only one network of
applied effects. Using multiple layer networks for different images might be
allowed.
* If a layer is updated or removed, that update should be applied to all of the
successor layers that are created. The reason why this is not implemented
is because predictions for all these layers take a lot of time and it really
affects user experience negatively.
* Can implement step to make small model run on CPU and big one on GPU (noting memory and compute power of users GPU and CPU), to fully utilize the computational power. But generally, when memory is getting full by one tab of browser it crashes automatically. 

## Limitations, Structure and Possible Alternatives of the Project

### Limitations

* Computation power is highly dependent on the browser that we are using. To run TFjs on a GPU one needs to make sure that the browser can run WebGL in the background. Which is tricky for some of the browsers. Because they are generally optimized to run on CPU because of the speed. On Chrome it's easier, but one has to do a lot of settings adjustments to run it on GPU and even though full usage is not guaranteed. As some TFjs function implementations do not include any backend conversion (such as RNNs). 
* WebGL uses shaders which result in additional requests and client-side load/compile-time and also adds additional computations on the CPU, which just stops the application for some time and the user cannot do anything except for waiting, (which for the big model that we wanted to have was around 30 sec).
* Another caveat when using the WebGL backend is the need for explicit memory management. WebGLTextures, which is where Tensor data is ultimately stored, are not automatically garbage collected by the browser.
* WebGL might only support 16-bit floating-point textures. However, most machine learning models are trained with 32-bit floating-point weights and activations. This can cause problems when converting the model from 32 bit to 16 bit.
* WebGL format does not support more than 4-dimensional multiplications. So, when there are very deep advanced generative models, the only way to run them on TFjs is through the CPU.
* TFjs tries to optimize a lot of WebGL weaknesses using cache memory so that the second time it runs faster. But in order to achieve that it tries to store all models in the memory. This makes the computer lag as memory is filled with the model and if the user wants to use a different model the process becomes slower.
* Built and tested on a specific browser version might completely fail on the next version (which happened to us and had to rebuild all the models again, with loading step and driver access configuration)
* Computations only support NHWC format, so one must convert the initial model to NHWC format and then transfer it to TFjs. This process can be very tricky for open-sourced models because one has to do layer inspections and change all trained model formats (shape of every weight and biases in the model).

### The Structure of the Project and Possible Alternatives for the Design Choices

1. Redux is used inside the effects for the state transition since there were a lot of effects
2. OOP structure is used between the grids.
3. Material-UI is used for the interface
4. React's default state handling is used for the grids since there were not a lot of state changes
5. We used the singleton pattern for the grids that we have. This was not preferred for the effects since there can be multiple instances of the same effect.
6. We used the "crypto" library to create random ids of 4 bytes of hexadecimal to each of the effects that are created.
7. We used class components to create the grids.
8. We used functional components to create the effects
9. We used different in-built functions such as componentDidMount, componentDidUpdate and useEffect. The intention was to update the corresponding states each time there was a change in the respective area.
10. We used our own CSS to create a very basic design.
11. We followed React.js customs about a parent sending its either state or its function to the child and child reading them.

### Internal Workflow of the System

1. Homepage is loaded. If the user tries to save an effect, there will be a warning popping up since there is not any effect that is selected.
2. Client selects an effect. The name of the effect is being sent to the Homepage component, then it is being sent to the middle component by the Homepage component
3. Respective effect is being loaded by the middle component.
4. The user makes their changes for a specific effect. Each change makes the corresponding effect component move to another state.
5. If the client clicks on "Save Effect", the state of that effect; including its variables, is being sent to the middle component.
6. Middle Component stores the state of that effect with an id in a dictionary.
7. The updated dictionary is being sent to the Homepage component. Then, the Homepage component sends the dictionary to the right component so that the right component can display the updated dictionary.
8. Right component displays the updated dictionary.
9. If the client clicks on an effect in the right component, the id of the effect is being sent to the Homepage component. Then, the Homepage component sends this id to the middle component.
10. Middle component searches the effect with the respective id in the dictionary, finds it and rerenders itself so that it displays the selected effect.
11. If an effect is finalized and it is being saved, the last edited image is being set to this finalized image. Thus, if another effect is selected, this effect will take this last edited image as its input and it will apply the effects to this image.
12. If the client clicks on the "Remove Filter" button of an effect, the id of that effect is being sent to the Homepage component. Then, the middle component receives the id from the Homepage component. Then, it finds that effect and deletes it from the dictionary.




