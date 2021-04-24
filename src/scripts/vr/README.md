# Setting up VR in PlayCanvas

## Load scripts
There's a polyfill that enables WebXR to work. It is contained in these files in the _vr-polyfill_ directory:
```
webxr-polyfill-min.js
webxr-polyfill-patch.js
```
These contain a minified polyfill and a little patch file that initiates the polyfill. 
It is very important that:
- These files should be set to "_Before Engine_" in their "_Loading Type_"
- In the _Script Execution Order_, set these very early, with ```webxr-polyfill-min.js``` before ```webxr-polyfill-patch.js```.

Failing to do so will result in the application:
- Not recognizing WebXR to be supported on a supported device.
- Likely give errors about WebXrPolyFill being undefined.

Note that re-uploading scripts with the ```pic-serve``` command will reset the settings and will require you to reset the "_Loading Type_". That's why I didn't put it into this submodule, and you have to just copy it from another repository.

## Set-up
1. Load scripts as mentioned.
2. Create a button that can be clicked to launch VR.
3. Put ```vr-enabler``` script in scene (i.e. attach to _Root_).
4. Put the main camera within a parent _CameraOffset_ entity.
5. Assign the main camera (not _CameraOffset_) and the button. to the properties of the ```vr-enabler``` script.
6. Attach the ```vr-camera``` script to _CameraOffset_ (```view-manager``` already requires that).
7. Attach the node you want to start the VR session on to ```view-manager```.
8. Every node and in-scene-button that should be interactable needs the ```vr-selectable``` script, the ```rotater``` script and needs the tag "_vr-selectable_" applied

## HTTPS
WebXR requires HTTPS, so whenever things don't seem to work for no reason, maybe check whether you're in a secure link.