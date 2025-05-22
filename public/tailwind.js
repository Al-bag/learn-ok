const elements = document.querySelectorAll('[class]');
function allIsHere() {
  elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(cls){
   case 'flex-col':
    el.style.flexDirection  = 'column';
    break;
   case 'flex-row':
    el.style.flexDirection = 'row';
    break;
   }

})
})


 elements.forEach((el, index) => {  
 const classList = el.className.split(/\s+/);

 classList.forEach(cls => {
switch (true) {
//paddings
case cls === 'p-px' :
        el.style.padding = '1px';
        break;
//margins
case cls === 'm-px' :
        el.style.margin = '1px';
        break;

case cls === 'm-auto' :
        el.style.margin = 'auto';
        break;

//padding left and right
case cls === 'px-px' :
        el.style.paddingLeft = '1px';
        el.style.paddingRight = '1px';
        break;

//margin left and right
case cls === 'mx-px' :
        el.style.marginLeft = '1px';
        el.style.marginRight = '1px';
        break;

case cls === 'mx-auto' :
        el.style.marginLeft = 'auto';
        el.style.marginRight = 'auto';
        break;

//padding top and bottom
case cls === 'py-px' :
        el.style.paddingTop = '1px';
        el.style.paddingBottom = '1px';
        break;

//margin top and bottom
case cls === 'my-px' :
        el.style.marginTop = '1px';
        el.style.marginBottom = '1px';
        break;

case cls === 'my-auto' :
        el.style.marginTop = 'auto';
        el.style.marginBottom = 'auto';
        break;

//padding top
case cls === 'pt-px' :
        el.style.paddingTop = '1px';
        break;

//padding right
case cls === 'pr-px' :
        el.style.paddingRight = '1px';
        break;

//padding bottom
case cls === 'pb-px' :
        el.style.paddingBottom = '1px';
        break;

//padding left
case cls === 'pl-px' :
        el.style.paddingLeft = '1px';
        break;

//margin top
case cls === 'mt-px' :
        el.style.marginTop = '1px';
        break;

case cls === 'mt-auto' :
        el.style.marginTop = 'auto';
        break;

//margin right
case cls === 'mr-px' :
        el.style.marginRight = '1px';
        break;

case cls === 'mr-auto' :
        el.style.marginRight = 'auto';
        break;

//margin bottom
case cls === 'mb-px' :
        el.style.marginBottom = '1px';
        break;

case cls === 'mb-auto' :
        el.style.marginBottom = 'auto';
        break;

//margin left
case cls === 'ml-auto' :
        el.style.marginLeft = 'auto';
        break;

case cls === 'ml-px' :
        el.style.marginLeft = '1px';
        break;

}


//height
switch (cls) {
  case 'h-px':
    el.style.height = '1px';
    break;
  case 'h-auto':
    el.style.height = 'auto';
    break;
  case 'h-full':
    el.style.height = '100%';
    break;
  case 'h-screen':
    el.style.height = '100vh';
    break;
}

//switch for width
switch (cls) {
  case 'w-px':
    el.style.width = '1px';
    break;
  case 'w-auto':
    el.style.width = 'auto';
    break;
  case 'w-full':
    el.style.width = '100%';
    break;
  case 'w-screen':
    el.style.width = '100vw';
    break;
}

// hover effect

switch(true){
case cls.startsWith('hover:'):{
const main = cls.slice(6);
el.addEventListener('mouseenter',()=>{
el.classList.add(main)
})
el.addEventListener('mouseleave',()=>{
el.classList.remove(main)
})
}
}

});
});
}

allIsHere()


// elements.forEach(el => {
//   const classList = el.className.split(/\s+/);

//   classList.forEach(cls => {

//     // Handle hover effects
//     if (cls.startsWith('hover:')) {
//       const hoverCls = cls.slice(6);

//       el.addEventListener('mouseenter', () => {
//         applyHoverStyle(el, hoverCls);
//       });

//       el.addEventListener('mouseleave', () => {
//         removeHoverStyle(el, hoverCls);
//       });
//     }
//   });
// });

// // Helper functions
// function applyHoverStyle(el, cls) {
//   // Background color: hover:bg-[red]
//   if (cls.startsWith('bg-[') && cls.endsWith(']')) {
//     const bg = cls.slice(4, -1);
//     el.dataset.originalBg = el.style.backgroundColor;
//     el.style.backgroundColor = bg;
//   }

//   // Text color: hover:text-[blue]
//   if (cls.startsWith('text-[') && cls.endsWith(']')) {
//     const color = cls.slice(6, -1);
//     el.dataset.originalColor = el.style.color;
//     el.style.color = color;
//   }
// }

// function removeHoverStyle(el, cls) {
//   // Reset background
//   if (cls.startsWith('bg-[') && cls.endsWith(']') && el.dataset.originalBg !== undefined) {
//     el.style.backgroundColor = el.dataset.originalBg;
//   }

//   // Reset text color
//   if (cls.startsWith('text-[') && cls.endsWith(']') && el.dataset.originalColor !== undefined) {
//     el.style.color = el.dataset.originalColor;
//   }
// }

//width
function forWidth() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('w-'):
        const width = cls.slice(2) / 4;
        el.style.width = `${width}rem`;
        break;
}
})
})
}
forWidth()

//height
function forHeight() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('h-'):
        const height = cls.slice(2) / 4;
        el.style.height = `${height}rem`;
        break;
}
})
})
}
forHeight()

//margin
function forMargin() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('m-'):
        const margin = cls.slice(2) / 4;
        el.style.margin = `${margin}rem`;
        break;
}
})
})
}
forMargin()

//margin top and bottom
function forMarginTopAndBottom() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('my-'):
        const margin = cls.slice(3) / 4;
        el.style.marginTop = `${margin}rem`;
        el.style.marginBottom = `${margin}rem`;
        break;
}
})
})
}
forMarginTopAndBottom()

//margin left and right
function forMarginLeftAndRight() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('mx-'):
        const margin = cls.slice(3) / 4;
        el.style.marginLeft = `${margin}rem`;
        el.style.marginRight = `${margin}rem`;
        break;
}
})
})
}
forMarginLeftAndRight()

//margin top
function forMarginTop() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('mt-'):
        const margin = cls.slice(3) / 4;
        el.style.marginTop = `${margin}rem`;
        break;
}
})
})
}
forMarginTop()

//margin right
function forMarginRight() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('mr-'):
        const margin = cls.slice(3) / 4;
        el.style.marginRight = `${margin}rem`;
        break;
}
})
})
}
forMarginRight()

//margin bottom
function forMarginBottom() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('mb-'):
        const margin = cls.slice(3) / 4;
        el.style.marginBottom = `${margin}rem`;
        break;
}
})
})
}
forMarginBottom()

//margin left
function forMarginLeft() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('ml-'):
        const margin = cls.slice(3) / 4;
        el.style.marginBottom = `${margin}rem`;
        break;
}
})
})
}
forMarginLeft()


//padding
function forPadding() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('p-'):
        const padding = cls.slice(2) / 4;
        el.style.padding = `${padding}rem`;
        break;
      }
})
})
}

forPadding()

//padding top and bottom
function forPaddingTopAndBottom() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('py-'):
        const padding = cls.slice(3) / 4;
        el.style.paddingTop = `${padding}rem`;
        el.style.paddingBottom = `${padding}rem`;
        break;
}
})
})
}

forPaddingTopAndBottom()

//padding left and right
function forPaddingLeftAndRight() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('px-'):
        const padding = cls.slice(3) / 4;
        el.style.paddingLeft = `${padding}rem`;
        el.style.paddingRight = `${padding}rem`;
        break;
}
})
})
}

forPaddingLeftAndRight()

//padding top
function forPaddingTop() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('pt-'):
        const padding = cls.slice(3) / 4;
        el.style.paddingTop = `${padding}rem`;
        break;
}
})
})
}
forPaddingTop()

//padding right
function forPaddingRight() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('pr-'):
        const padding = cls.slice(3) / 4;
        el.style.paddingRight = `${padding}rem`;
        break;
}
})
})
}
forPaddingRight()

//padding bottom
function forPaddingBottom() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('pb-'):
        const padding = cls.slice(3) / 4;
        el.style.paddingBottom = `${padding}rem`;
        break;
}
})
})
}
forPaddingBottom()

//padding left
function forPaddingLeft() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('pl-'):
        const padding = cls.slice(3) / 4;
        el.style.paddingLeft = `${padding}rem`;
        break;
}
})
})
}
forPaddingLeft()

// z-index
function forzIndex() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('z-'):
        const zIndex = cls.slice(2);
        el.style.zIndex = `${zIndex}`;
  // case 'z-auto':
  //   el.style.zIndex = 'auto';
  //   break;
}
})
})
}

forzIndex();

// text aligns
function forTextAligns() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(cls){
  case 'text-left':
    el.style.textAlign = 'left';
    break;
  case 'text-center':
    el.style.textAlign = 'center';
    break;
  case 'text-right':
    el.style.textAlign = 'right';
    break;
  case 'text-justify':
    el.style.textAlign = 'justify';
    break;
  case 'text-start':
    el.style.textAlign = 'start';
    break;
  case 'text-end':
    el.style.textAlign = 'end';
    break;
}
})
})
}

forTextAligns();

// displays
function forDisplay() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(cls){
  case 'block':
    el.style.display = 'block';
    break;
  case 'inline-block':
    el.style.display = 'inline-block';
    break;
  case 'inline':
    el.style.display = 'inline';
    break;
  case 'flex':
    el.style.display = 'flex';
    break;
  case 'inline-flex':
    el.style.display = 'inline-flex';
    break;
  case 'grid':
    el.style.display = 'grid';
    break;
  case 'inline-grid':
    el.style.display = 'inline-grid';
    break;
  case 'hidden':
    el.style.display = 'none';
    break;
}
})
})
}

forDisplay();

// align-items
function forAlignItems() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(cls){
  case 'items-start':
    el.style.alignItems = 'flex-start';
    break;
  case 'items-center':
    el.style.alignItems = 'center';
    break;
  case 'items-end':
    el.style.alignItems = 'flex-end';
    break;
  case 'items-baseline':
    el.style.alignItems = 'baseline';
    break;
  case 'items-stretch':
    el.style.alignItems = 'stretch';
    break;    
}

})
})
}

forAlignItems();

// align-content
function forAlignContent() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(cls){
  case 'content-start':
    el.style.alignContent = 'flex-start';
    break;
  case 'content-center':
    el.style.alignContent = 'center';
    break;
  case 'content-end':
    el.style.alignContent = 'flex-end';
    break;
  case 'content-between':
    el.style.alignContent = 'space-between';
    break;
  case 'content-around':
    el.style.alignContent = 'space-around';
    break;
  case 'content-evenly':
    el.style.alignContent = 'space-evenly';
    break;
}
})
})
}

forAlignContent();

// justify-contents
function forJustifyContent() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(cls){
  case 'justify-start':
    el.style.justifyContent = 'flex-start';
    break;
  case 'justify-center':
    el.style.justifyContent = 'center';
    break;
  case 'justify-end':
    el.style.justifyContent = 'flex-end';
    break;
  case 'justify-between':
    el.style.justifyContent = 'space-between';
    break;
  case 'justify-around':
    el.style.justifyContent = 'space-around';
    break;
  case 'justify-evenly':
    el.style.justifyContent = 'space-evenly';
    break;

}
})
})
}
forJustifyContent();

// positions
function forPosition() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(cls){
  case 'static':
    el.style.position = 'static';
    break;
  case 'relative':
    el.style.position = 'relative';
    break;
  case 'absolute':
    el.style.position = 'absolute';
    break;
  case 'fixed':
    el.style.position = 'fixed';
    break;
  case 'sticky':
    el.style.position = 'sticky';
    break;
}

})
})
}

forPosition();

// font-weight
function forFontWeight() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(cls){
  case 'font-thin':
    el.style.fontWeight = '100';
    break;
  case 'font-light':
    el.style.fontWeight = '300';
    break;
  case 'font-normal':
    el.style.fontWeight = '400';
    break;
  case 'font-medium':
    el.style.fontWeight = '500';
    break;
  case 'font-semibold':
    el.style.fontWeight = '600';
    break;
  case 'font-bold':
    el.style.fontWeight = '700';
    break;
  case 'font-extrabold':
    el.style.fontWeight = '800';
    break;
  case 'font-black':
    el.style.fontWeight = '900';
    break;
}
})
})
}
forFontWeight()

//overflow
function forOverflow() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('overflow-x-'):
        const overflowX = cls.slice(11);
        el.style.overflowX = `${overflowX}`;
        break;
case cls.startsWith('overflow-y-'):
        const overflowY = cls.slice(11);
        el.style.overflowY = `${overflowY}`;
        break;
case cls.startsWith('overflow-'):
        const overflow = cls.slice(9);
        el.style.overflow = overflow;
        break;
}
})
})
}
forOverflow()

//gap
function forGap() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
case cls.startsWith('gap-'):
        const gap = cls.slice(4) / 4;
        el.style.gap = `${gap}rem`;
        break;
}
})
})
}
forGap()

//font size
function forFontSize() {
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch (cls) {
  case 'text-xs':
    el.style.fontSize = '0.75rem';
    break;
  case 'text-sm':
    el.style.fontSize = '0.875rem';
    break;
  case 'text-base':
    el.style.fontSize = '1rem';
    break;
  case 'text-lg':
    el.style.fontSize = '1.125rem';
    break;
  case 'text-xl':
    el.style.fontSize = '1.25rem';
    break;
  case 'text-2xl':
    el.style.fontSize = '1.5rem';
    break;
  case 'text-3xl':
    el.style.fontSize = '1.875rem';
    break;
  case 'text-4xl':
    el.style.fontSize = '2.25';
    break;
  case 'text-5xl':
    el.style.fontSize = '3rem';
    break;
  case 'text-6xl':
    el.style.fontSize = '3.75rem';
    break;
    case 'text-7xl':
    el.style.fontSize = '4.5rem';
    break;
  case 'text-8xl':
    el.style.fontSize = '6rem';
    break;
  case 'text-9xl':
    el.style.fontSize = '8rem';
    break;
}
})
})
}
forFontSize();

// customize background color
function customizeBackgroundColor(){
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
     case cls.startsWith('bg-[') && cls.endsWith(']'):
                const backColor = cls.slice(4,-1);
                el.style.backgroundColor = backColor;
     break;
}
})
})       
}

customizeBackgroundColor();

//customize text color
function customizeTextColor(){
elements.forEach(el =>{
const classList = el.className.split(/\s+/);
classList.forEach(cls =>{
switch(true){
    case cls.startsWith('text-[') && cls.endsWith(']'):
        const textColor = cls.slice(6,-1);
        el.style.color = textColor;
     break;
}
})
})       
}

customizeTextColor();

// function for() {
// elements.forEach(el =>{
// const classList = el.className.split(/\s+/);
// classList.forEach(cls =>{

// })
// })
// }
