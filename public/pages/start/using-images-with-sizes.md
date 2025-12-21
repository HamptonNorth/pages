---
title: Using images in markdown and controlling the size
summary: Using Images markdown - this time with size contol using the &ltimage&gt tag
created: 2025-12-21T10:25:00-00:00
published: y
file-type: markdown
style: github
sticky: false
---

# Using images markdown

This a good link for an explanation [DigitalOcean](https://www.digitalocean.com/community/tutorials/markdown-markdown-images)

The easiest way to control the size of an image is to warp it in an `<img>` HTML tag. The syntax is:

```html
<img title="Redmug logo" alt="redmug logo" src="/media/start/redmug_logo_316x316.png" style="width: 80px; height: 80px;">
```

This will be rendered as:
<img title="Redmug logo" alt="Redmug logo" src="/media/start/redmug_logo_316x316.png" style="width: 80px; height: 80px;">

. . . and making the Orosay image 300px wide
```html

<img title="Sunset at Oronsay near Tobermory" 
  alt="Sunset at Oronsay near Tobermory" 
  src="/media/start/sunset_near_oronsay.png" 
  style="width: 300px; ">                    # only one dimension avoids distortion

```
This will be rendered as:



<img title="Sunset at Oronsay near Tobermory" alt="Sunset at Oronsay near Tobermory" src="/media/start/sunset_near_oronsay.png" style="width: 300px; ">

> When both dimensions are provided as below, the image is distorted.  

<img title="Sunset at Oronsay near Tobermory" alt="Sunset at Oronsay near Tobermory" src="/media/start/sunset_near_oronsay.png" style="width: 300px; height: 100px;">
The two example images above use relative referencing with the images stored locally on the server. 

External images are also supported by using the complete url. In the browser, right click and `Copy image address` is your friend for this. Here is another example. This show the position of Tally Ho passing Guatemala, December 2005. The heighth is set to 320px, the image is centered, borderd and has vertical padding.

```html

<div style="text-align: center; padding-top: 12px; padding-bottom: 32px">
    <img title="Tally Ho near Guatemala, December 2005" 
    src="https://ci3.googleusercontent.com/meips/ADKq_Nb8LJ3irMzLkdpRld6SdMe0FFMhfnT9MwukQKOw98JfoA8v1RWdFdERpql9W6ZYcBPPkLaqJIPH9pi5aXCN4HRDh_4zvAaD9JhWAeEcSu7slkdQycZVAvdBjCwXYZObpZFjZ4WkP4sR2v5S8rbvMM7FX_-kBOpEnLEm8og8VCj4A9U7dpf_P1YCyY1YA_3EEA23T_9bH7jfSyxVMwG9gwI_bO5dSmKJ7D0m_V3F6yVhblHK1hST3PsPZlSkFZZJHyg7945qBPGUZlUFUQ2REfL__2fbgFWckx8ycJuCraAHBmNERp6U=s0-d-e1-ft#https://c10.patreonusercontent.com/4/patreon-media/p/post/146356537/b876c729f7aa4595a06334cd679dabd4/eyJ3IjoxMDgwfQ%3D%3D/1.JPG?token-hash=2JrCRb6EK0MJR8VZdHBPxkXY9XGzSqB23nsK5yHPDTI%3D&token-time=4919961600" 
    style="display: block; margin: 0 auto; height: 320; border:solid; border-color:navy">
</div>

```
This will be rendered as:
<div style="text-align: center; padding-top: 12px; padding-bottom: 32px">
    <img title="Tally Ho near Guatemala, December 2005" src="https://ci3.googleusercontent.com/meips/ADKq_Nb8LJ3irMzLkdpRld6SdMe0FFMhfnT9MwukQKOw98JfoA8v1RWdFdERpql9W6ZYcBPPkLaqJIPH9pi5aXCN4HRDh_4zvAaD9JhWAeEcSu7slkdQycZVAvdBjCwXYZObpZFjZ4WkP4sR2v5S8rbvMM7FX_-kBOpEnLEm8og8VCj4A9U7dpf_P1YCyY1YA_3EEA23T_9bH7jfSyxVMwG9gwI_bO5dSmKJ7D0m_V3F6yVhblHK1hST3PsPZlSkFZZJHyg7945qBPGUZlUFUQ2REfL__2fbgFWckx8ycJuCraAHBmNERp6U=s0-d-e1-ft#https://c10.patreonusercontent.com/4/patreon-media/p/post/146356537/b876c729f7aa4595a06334cd679dabd4/eyJ3IjoxMDgwfQ%3D%3D/1.JPG?token-hash=2JrCRb6EK0MJR8VZdHBPxkXY9XGzSqB23nsK5yHPDTI%3D&token-time=4919961600" style="display: block; margin: 0 auto; height: 320px; border:solid; border-color:navy">
</div>


Notice the semi-colons between the inline CSS `selectors:property` pairs. 

There comes a point where you replace `markdown` completely with `HTML`. That's enough inline styling.
