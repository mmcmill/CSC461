<h1> WebGl Model Viewer </h1>
A basic model viewer made from scratch with WebGL and JavaScript. User can
<ul>
  <li>Translate and rotate the camera along all 3 axes</li>
  <li>Select models to translate and rotate along all 3 axes, as well as edit ambient, diffuse, specular lighting values</li>
  <li>Toggle shader processing on/off</li>
</ul>
Run the model viewer by downloading the "Main" folder and running index.html.
<h2>Controls</h2>
<h3>Camera Controls</h3>
<h4>Camera Movement</h4>
<ul>
  <li>w - translate forward</li>
  <li>s - translate backward</li>
  <li>a - translate left</li>
  <li>d - translate right</li>
  <li>q - translate upward</li>
  <li>e - translate downward</li>
  <li>W - rotate downward</li>
  <li>S - rotate upward</li>
  <li>A - rotate left</li>
  <li>D - rotate right</li>
  <li>Q - rotate counterclockwise</li>
  <li>E - rotate clockwise</li>
  <li>Escape - reset view</li>
</ul>
<h4>Camera Settings</h4>
<ul>
  <li>, - toggle perspective On</li>
  <li>= - toggle perspective Off</li>
  <li>b - Blinn-Phong on, Light map on</li>
  <li>m - Blinn-Phong off, Light map on</li>
  <li>u - Blinn-Phong and Light Map off</li>
</ul>

<h3>Model Controls</h3>
<h4>Model Selection</h4>
<ul>
  <li>Left arrow key - select previous model</li>
  <li>Right arrow key - select next model</li>
  <li>Spacebar - deselect model</li>
</ul>

<h4>Model Movement</h4>
While a model is selected,
<ul>
  <li>k - translate left</li>
  <li>; - translate right</li>
  <li>l - translate back</li>
  <li>o - translate forward</li>
  <li>i - translate up</li>
  <li>p - translate down</li>
  <li>K - rotate left</li>
  <li>: - rotate right</li>
  <li>L - rotate up</li>
  <li>O - rotate down</li>
  <li>I - rotate counterclockwise</li>
  <li>P - rotate clockwise</li>
  <li>Backspace - reset model position</li>
</ul>

<h4>Model Settings</h4>
While a model is selected,
<ul>
  <li>n - adjust luminosity</li>
  <li>numpad1 - adjust model's ambient lighting</li>
  <li>numpad2 - adjust model's diffuse lighting</li>
  <li>numpad3 - adjust model's specular lighting</li>
</ul>  
