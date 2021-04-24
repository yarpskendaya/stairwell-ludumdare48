# Interior Settings Tweaker

## Glass material
In order to make glass transparant when inside in an interior view, make sure that the material:
- Has ```Blend Type``` set to ```Screen```
- Has an empty, black .png assigned as texture
- Has ```Alpha To Coverage``` disabled

The Tweaker will set the ```Alpha Test``` value to 0 when inside, and back to an original value outside to make the material transparant.