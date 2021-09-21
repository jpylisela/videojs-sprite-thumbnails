import videojs from 'video.js';
import window from 'global/window';

/**
 * Set up sprite thumbnails for a player.
 *
 * @function spriteThumbs
 * @param {Player} player
 *        The current player instance.
 * @param {Object} options
 *        Configuration options.
 */
const spriteThumbs = (player, options) => {
  const url = options.url;
  const height = options.height;
  const width = options.width;

  const sprite = new window.Image();
  const log = player.spriteThumbnails().log;

  const dom = videojs.dom || videojs;
  const controls = player.controlBar;
  const progress = controls.progressControl;
  const seekBar = progress.seekBar;
  const mouseTimeDisplay = seekBar.mouseTimeDisplay;

  const tooltipStyle = (obj) => {
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      const ttstyle = mouseTimeDisplay.timeTooltip.el().style;

      if (val !== '') {
        ttstyle.setProperty(key, val);
      } else {
        ttstyle.removeProperty(key);
      }
    });
  };

  const resetMouseTooltip = () => {
    tooltipStyle({
      'width': '',
      'height': '',
      'background-image': '',
      'background-repeat': '',
      'background-position': '',
      'background-size': '',
      'top': '',
      'color': '',
      'text-shadow': '',
      'border': '',
      'margin': ''
    });
  };

  const spriteready = () => {
    const ready = url.length && height && width && mouseTimeDisplay;

    resetMouseTooltip();
    if (!ready) {
      ['url', 'width', 'height'].forEach((key) => {
        if (!options[key] || key === 'url' && !options[key].length) {
          log('no spriteThumbnails ' + key + ' given');
        }
      });
    }
    return ready;
  };

  const hijackMouseTooltip = (evt) => {
    const imgWidth = sprite.naturalWidth;
    const imgHeight = sprite.naturalHeight;
    const seekBarEl = seekBar.el();

    if (sprite.complete && imgWidth && imgHeight) {
      let position = dom.getPointerPosition(seekBarEl, evt).x * player.duration();

      position = position / options.interval;

      const responsive = options.responsive;
      const playerWidth = player.currentWidth();
      const scaleFactor = responsive && playerWidth < responsive ?
        playerWidth / responsive : 1;
      const columns = imgWidth / width;
      const scaledWidth = width * scaleFactor;
      const scaledHeight = height * scaleFactor;
      const cleft = Math.floor(position % columns) * -scaledWidth;
      const ctop = Math.floor(position / columns) * -scaledHeight;
      const bgSize = (imgWidth * scaleFactor) + 'px ' +
                     (imgHeight * scaleFactor) + 'px';
      const controlsTop = dom.findPosition(controls.el()).top;
      const seekBarTop = dom.findPosition(seekBarEl).top;
      // top of seekBar is 0 position
      const topOffset = -scaledHeight - Math.max(0, seekBarTop - controlsTop);

      tooltipStyle({
        'width': scaledWidth + 'px',
        'height': scaledHeight + 'px',
        'background-image': 'url(' + url + ')',
        'background-repeat': 'no-repeat',
        'background-position': cleft + 'px ' + ctop + 'px',
        'background-size': bgSize,
        'top': topOffset + 'px',
        'color': '#fff',
        'text-shadow': '1px 1px #000',
        'border': '1px solid #000',
        'margin': '0 1px'
      });
    } else {
      resetMouseTooltip();
    }
  };

  player.on('loadstart', () => {
    log.level(videojs.log.level());
  });

  // preload sprite if completely configured at plugin level
  if (spriteready()) {
    sprite.src = url;
    progress.on('mousemove', hijackMouseTooltip);
    progress.on('touchmove', hijackMouseTooltip);
  }
  player.addClass('vjs-sprite-thumbnails');
};

export default spriteThumbs;
