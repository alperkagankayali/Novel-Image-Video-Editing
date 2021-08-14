# Novel-Image-Video-Editing

In order to add a new effect to the project, one needs to do:

1-add the effect as a component under the "Utils" folder

2-add props.handleChange(output_tensor) function to your component. The input parameter of this function should be the output of the effect that is applied. If tf.js is being used, then it should have the format tf.Tensor

3-Import your effect in the effectgrid.js and include it to the switch case.

4-Include it as an option in the homeleftgrid.js. One needs to send and retrieve states when the button is clicked. check how style transfer component handles these things.

5- If you did everything correctly, you should have added a new effect to the system. Congrats!
