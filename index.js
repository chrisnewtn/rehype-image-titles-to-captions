import { select, selectAll } from 'hast-util-select';
import { h } from 'hastscript';
import { findParent } from 'hast-util-find-parent';

/**
 * @typedef {import('hast').Root} Root
 *
 * @typedef Options
 *  Configuration.
 * @property {string} [pictureSelector]
 *  CSS selector for `<picture>` elements.
 * @property {string} [imgSelector]
 *  CSS selector for `<img>` elements.
 * @property {boolean} [deleteTitles]
 *  Whether or not to delete the titles of images that have had captions
 *  created for them.
 */

/** @type {Options} */
const defaultOptions = {
  pictureSelector: undefined,
  imgSelector: 'img',
  deleteTitles: true
};

/**
 * A plugin that takes image titles and turns them into figcaptions.
 *
 * Markdown only lets you specify a title for an image, not a caption, but they
 * are functionally equivilant.
 *
 * Titles are only visible on mouseover, so rendering a visible caption is more
 * accessible for all users across all devices.
 */
export function imageTitlesToCaptions(options = defaultOptions) {
  const imgSelector = options.imgSelector || 'img';
  const pictureSelector = options.pictureSelector || imgSelector;
  const deleteTitles = Object.hasOwn(options, 'deleteTitles') ? options.deleteTitles : true;

  /**
   * @param {Root} tree
   *  The Document tree.
   */
  return tree => {
    // Select all e.g. pictures with images with titles.
    for (const outerEl of selectAll(pictureSelector, tree)) {
      // Get the picture's img element, or use the img itself if it already is one.
      const imgEl = outerEl.tagName === 'img' ? outerEl : select(imgSelector, outerEl);

      // Bail out if the picture has no img.
      if (!imgEl) {
        continue;
      }

      // The image's title property if it has one.
      const title = imgEl.properties.title;

      // Ignore images with empty title properties.
      if (typeof title !== "string" || title.length === 0) {
        continue;
      }

      // Create the new figure element and set the title as its figcaption.
      const figureEl = h('figure', [
        outerEl,
        h('figcaption', title)
      ]);

      const outerElParentEl = findParent(outerEl, tree);

      // This shouldn't be possible to hit as we already found `outerEl` in the
      // tree and the root is its ultimate parent even if nothing else is.
      if (!outerElParentEl) {
        throw new Error(`Could not find parent of ${outerEl.tagName}`);
      }

      // Replace the picture or img element in the tree with the new figure element.
      outerElParentEl.children.splice(
        outerElParentEl.children.indexOf(outerEl),
        1,
        figureEl
      );

      if (deleteTitles) {
        // Delete the title on the image as it is now duplicate data.
        delete imgEl.properties.title;
      }
    }
  };
}
