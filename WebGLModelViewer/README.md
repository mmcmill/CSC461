<h1> WebGl Model Viewer </h1>
A basic model viewer made from scratch with WebGL and JavaScript. User can 
<ul> 
  <li>Translate and rotate the camera along all 3 axes</li>
  <li>Select models to translate and rotate along all 3 axes, as well as edit ambient, diffuse, specular lighting values</li>
  <li>Toggle shader processing on/off</li>
</ul>

<h2>Controls</h2>
<h3>Camera Controls</h3>
<h4>Camera Movement</h4>
<ul>
  <li>w - Translate forward</li>
  <li>s - Translate backward</li>
  <li>a - Translate left</li>
  <li>d - Translate right</li>
  <li>q - Translate upward</li>
  <li>e - Translate downward</li>
  <li>W - Rotate downward</li>
  <li>S - Rotate upward</li>
  <li>A - Rotate left</li>
  <li>D - Rotate right</li>
  <li>Q - Rotate counterclockwise</li>
  <li>E - Rotate clockwise</li>
  <li>Escape - Reset view</li>
</ul>
<h4>Camera Settings</h4>
<ul>
  <li>, - Toggle perspective on</li>
  <li>= - Toggle perspective off</li>
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
  <li>k - Translate left</li>
  <li>; - Translate right</li>
  <li>l - Translate back</li>
  <li>o - Translate forward</li>
  <li>i - Translate up</li>
  <li>p - Translate down</li>
  <li>K - Rotate left</li>
  <li>: - Rotate right</li>
  <li>L - Rotate up</li>
  <li>O - Rotate down</li>
  <li>I - Rotate counterclockwise</li>
  <li>P - Rotate clockwise</li>
  <li>Backspace - Reset model position</li>
</ul>

<h4>Model Settings</h4>
While a model is selected,
<ul>
  <li>n - Adjust luminosity</li>
  <li>numpad1 - Adjust model's ambient lighting</li>
  <li>numpad2 - Adjust model's diffuse lighting</li>
  <li>numpad3 - Adjust model's specular lighting</li>
</ul>  
