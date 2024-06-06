class SVGIcon extends HTMLElement {

  //ID of sprite element
  #SPRITE_ID = 'SVG_SPRITE';

  //Public path for icons
  #ICONS_PATH = '/icons';

  constructor() {
    super();
  }

  connectedCallback() {
    const iconName = this.getAttribute('name');
    if(iconName) {
      this.#loadIcon(iconName);
    } else {
      console.error('svg-icon undefined attr name');
    }
  }

  /**
   * Load or use exist icon
   * @param iconName name of icon
   */
  #loadIcon(iconName:string) {
    const spriteEl = document.getElementById(this.#SPRITE_ID);
    //Check if sprite exist
    if(spriteEl === null) {
      return console.error('svg-icon undefined sprite element');
    }

    let icon = spriteEl.querySelector(`[id="${iconName}.svg"]`);
    //If icon not exist - fetch from icons
    if(!icon) {
      //Check exist cache obj
      if(!window[this.#SPRITE_ID]) {
        window[this.#SPRITE_ID] = {};
      }
      //Check if icon already loading
      if(window[this.#SPRITE_ID][iconName]) {
        //Wait exist promise
        window[this.#SPRITE_ID][iconName].then((iconSvg:string) => {
          if(iconSvg) {
            this.#addIconInSprite(iconSvg, iconName, spriteEl);
            icon = spriteEl.querySelector(`[id="${iconName}.svg"]`);
          } else {
            console.error(`svg-icon ${iconName} response undefined`);
          }
        });
      } else {
        //Fetch icons
        window[this.#SPRITE_ID][iconName] = fetch(`${this.#ICONS_PATH}/${iconName}.svg`).then( async (response) => {
          const iconSvg = await response?.text();
          if(iconSvg) {
            this.#addIconInSprite(iconSvg, iconName, spriteEl);
            icon = spriteEl.querySelector(`[id="${iconName}.svg"]`);
          } else {
            console.error(`svg-icon ${iconName} response undefined`);
          }
          return iconSvg;
        }).catch(err => console.error('svg-icon fetch err', err));
      }
    //Use exist icon from sprite
    } 
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    useElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${iconName}.svg`);
    svg.append(useElement);
    this.appendChild(svg);
  }

  /**
   * Add icon to SVG sprite element
   * @param svgContent svg text content from response
   * @param iconName name of icon
   */
  #addIconInSprite(svgContent:string, iconName:string, spriteEl:HTMLElement) {
    //Create template and insert content
    const tmp = document.createElement('template');
      tmp.innerHTML = svgContent;

    //Select svg from inserted content
    const tmpSvg = tmp.content.querySelector('svg'),
      symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');

    if(tmpSvg) {
      //Copy attrs from original svg
      symbol.setAttribute('id', iconName + '.svg');

      if(null !== tmpSvg.getAttribute('viewBox')) {
        symbol.setAttribute('viewBox', tmpSvg.getAttribute('viewBox'));
      }
      if(null !== tmpSvg.getAttribute('fill')) {
        symbol.setAttribute('fill', tmpSvg.getAttribute('fill'));
      }
      symbol.innerHTML = tmpSvg.innerHTML;
    } else {
      console.error(`svg-icon not found svg content for ${iconName}`);
    }

    const spriteDefs = spriteEl.querySelector('defs');
    
    if(spriteDefs) {
      spriteDefs.append(symbol);
    }
  }
}

export default SVGIcon;
