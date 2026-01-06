---
title: Using images in markdown with the rm-image component
summary: Using Images markdown - this time using the rm-image custom component
created: 2025-12-21T10:25:00-00:00
published: y
file-type: markdown
style: github
sticky: false
---

# rm-image Component

A flexible image component for markdown content with carousel, positioning, and text wrapping support. Markdown doesn't give you that much control over text wrapping and the like. It certainly does not support multiple images in a carousel. Hopefully this component will improve your pages.


### Basic image
Examples of single images with size control, border and rounded corners. Default is 600px wide, no border and no corner rounding. The markdown source for the samples below is:

```html
<rm-image src="/media/start/sunset_near_oronsay.png" >Sunset near Oronsay</rm-image>
<rm-image src="/media/start/sunset_near_oronsay.png" width="200px">Sunset near Oronsay</rm-image>
<rm-image src="/media/start/sunset_near_oronsay.png" width="200px" rounded="lg">Sunset near Oronsay</rm-image>
<rm-image src="/media/start/russell-cartoon.jpg" ></rm-image>
<rm-image src="/media/start/russell-cartoon.jpg" width="400px" border ></rm-image>
<rm-image src="/media/start/russell-cartoon.jpg" width="200px" border rounded="md"></rm-image>

<rm-image src="https://picsum.photos/seed/demo1/800/400" ></rm-image>
<rm-image src="https://picsum.photos/seed/demo1/800/400" height="240px"></rm-image>
<rm-image src="https://picsum.photos/seed/demo1/800/400" height="160px" border rounded="md"></rm-image>
```

<rm-image src="/media/start/sunset_near_oronsay.png">Sunset near Oronsay</rm-image>
<rm-image src="/media/start/sunset_near_oronsay.png" width="200px" rounded="lg">Sunset near Oronsay</rm-image>

<rm-image src="/media/start/russell-cartoon.jpg" ></rm-image>
<rm-image src="/media/start/russell-cartoon.jpg" width="400px" border ></rm-image>
<rm-image src="/media/start/russell-cartoon.jpg" width="200px" border rounded="md"></rm-image>

The image below does not have a size set and uses the default size of `width="600px"`

<rm-image src="https://picsum.photos/seed/demo1/800/400" ></rm-image>

This image is full size by using `width="100%"`

<rm-image src="https://picsum.photos/seed/demo1/800/400" width="100%"></rm-image>

The image below is reduced in size by using `height="240px"`

<rm-image src="https://picsum.photos/seed/demo1/800/400" width="180px" border></rm-image>

Same picture with height reduced to `height="160px"` with borders and rounded corners `rounded="md"`.

<rm-image src="https://picsum.photos/seed/demo1/800/400" height="160px" border rounded="md"></rm-image>

Notice how some images look better with a border. With a darker image on a lighter background, a border is not needed.


### Multiple images - the carousel

The markdown source for the samples below is:

```html
<rm-image src='["https://picsum.photos/seed/slide1/600/400", 
"https://picsum.photos/seed/slide2/600/400", 
"https://picsum.photos/seed/slide3/600/400",
"/media/start/russell-cartoon.jpg", 
"https://picsum.photos/seed/slide1/800/400", 
"/media/start/sunset_near_oronsay.png"  ]' 
width="480px"  border rounded="lg">Demo images - mixed local and remote sources</rm-image>
```

<rm-image src='["https://picsum.photos/seed/slide1/600/400", 
"https://picsum.photos/seed/slide2/600/400", 
"https://picsum.photos/seed/slide3/600/400",
"/media/start/russell-cartoon.jpg", 
"https://picsum.photos/seed/slide1/800/400", 
"/media/start/sunset_near_oronsay.png"  ]' width="480px"  border rounded="lg">Demo images - mixed local and remote sources</rm-image>

Note the first three image work best because they have the same proportions. The later three images cause *jumps* in the rendering as they have different proportions.

### Text wrapping
The `<rm-image>` component also gives you control over text wrapping. Markdown images are usually rendered in a 'block' with no text wrapping.

<rm-image src="/media/start/sunset_near_oronsay.png" width="200px" rounded="lg" wrap="wrap" position="left" >Sunset near Oronsay</rm-image> For this we need some long text. Appropriately orchestrate leading-edge leadership skills via long-term high-impact "outside the box" thinking. Distinctively seize vertical potentialities with mission-critical mindshare. Efficiently parallel task scalable quality vectors for 24/365 infomediaries. Continually mesh multimedia based web services before one-to-one models. Continually procrastinate pandemic content whereas sticky best practices.Efficiently disintermediate interdependent portals without exceptional expertise.

Conveniently promote timely synergy through transparent process improvements. Continually cultivate  catalysts for change through parallel experiences. Progressively streamline focused e-markets with impactful initiatives. Assertively cultivate client centred customer service rather than high-quality growth strategies. Efficiently productive empowered bandwidth without viral manufactured products.

The markdown for this is:
```html
<rm-image src="/media/start/sunset_near_oronsay.png" width="200px" rounded="lg" 
wrap="wrap" position="left" >Sunset near Oronsay</rm-image>
```

The text wrap position can be set to the right.

<rm-image src="/media/start/sunset_near_oronsay.png" width="400px" rounded="lg" wrap="wrap" position="right" >Sunset near Oronsay</rm-image> For this we need some long text. Appropriately orchestrate leading-edge leadership skills via long-term high-impact "outside the box" thinking. Distinctively seize vertical potentialities with mission-critical mindshare. Efficiently parallel task scalable quality vectors for 24/365 infomediaries. Continually mesh multimedia based web services before one-to-one models. Continually procrastinate pandemic content whereas sticky best practices.Efficiently disintermediate interdependent portals without exceptional expertise.

Conveniently promote timely synergy through transparent process improvements. Continually cultivate  catalysts for change through parallel experiences. Progressively streamline focused e-markets with impactful initiatives. Assertively cultivate client-centred customer service rather than high-quality growth strategies. Efficiently productive empowered bandwidth without viral manufactured products.


The text wrap position can be set to the `wrap="break"`.<rm-image src="/media/start/sunset_near_oronsay.png" width="240px" rounded="lg" wrap="break" position="center" >Sunset near Oronsay</rm-image> It breaks the flow at the point you insert the `rm-image` tag.


#### It also works with carousels
<rm-image src='["https://picsum.photos/seed/slide1/600/400", 
"https://picsum.photos/seed/slide2/600/400", 
"https://picsum.photos/seed/slide3/600/400" ]' width="480px"  border rounded="lg" wrap="wrap" position="right"> Demo images - all the same proportion</rm-image>For this we need some long text. Appropriately orchestrate leading-edge leadership skills via long-term high-impact "outside the box" thinking. Distinctively seize vertical potentialities with mission-critical mindshare. Efficiently parallel task scalable quality vectors for 24/365 infomediaries. Continually mesh multimedia based web services before one-to-one models. Continually procrastinate pandemic content whereas sticky best practices.Efficiently disintermediate interdependent portals without exceptional expertise.
Conveniently promote timely synergy through transparent process improvements. Continually cultivate catalysts for change through parallel experiences. Progressively streamline focused e-markets with impactful initiatives. Assertively cultivate client-centred customer service rather than high-quality growth strategies. Efficiently productive empowered bandwidth without viral manufactured products.

Seamlessly administrate one-to-one convergence whereas optimal core competencies. Holistic extend long-term high-impact potentialities with 24/365 processes. Dramatically empower cost effective outsourcing without sustainable manufactured products. Intrinsic disseminate high-payoff data through corporate scenarios. innovate 24/7 web services rather than bleeding-edge best practices.

Conceptualize web-enabled users with clicks-and-mortar portals. Professionally maintain sticky architectures through bricks-and-clicks process improvements. Distinctively matrix  niches and strategic synergy. Uniquely  professional bandwidth rather than equity invested networks. Completely empower performance based "outside the box" thinking after market positioning benefits.

Conveniently coordinate open-source applications after vertical intellectual capital. Conveniently enhance installed base infrastructures and global core competencies. Authoritatively.
