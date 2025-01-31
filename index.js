import { select, selectAll } from 'hast-util-select';
import { h } from 'hastscript';
import { findParent } from 'hast-util-find-parent';

/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Parent} Parent
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

/**
 * Predicate function for ensuring the passed element is an {@link Element}
 * @param {Element | Parent | null} element
 * @returns {element is Element}
 */
function isElement(element) {
  return !!element && 'children' in element && Array.isArray(element.children);
}

/**
 * Predicate function for ensuring the passed element is an {@link Element} and
 * has the passed `tagName`.
 * @param {Element | Parent | null} element
 * @param {string} tagName
 * @returns {element is Element}
 */
function isTag(element, tagName) {
  return isElement(element) && element.tagName === tagName;
}

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

      let replacedOuterOuterParent = false;

      // If the parent is a `<p>` element, `<p>` elements cannot have a `<figure>`
      // as a child, so try placing it further up the tree.
      if (isTag(outerElParentEl, 'p')) {
        const outerOuterParent = findParent(outerElParentEl, tree);

        // Try placing the `<figure>` further up the tree. If the parent of the
        // parent is _also_ a `<p>` then just give up and place it in the
        // immediate paragraph as before. The browser will cope, but possibly not
        // in an acceptable way.
        if (isElement(outerOuterParent) && outerOuterParent.tagName !== 'p') {
          const immediateParentIsEmpty = outerElParentEl.children.every(el => {
            if (el === outerEl) {
              return true;
            }
            if (el.type === 'text') {
              return el.value.trim() === ''
            }
            return false;
          });

          if (immediateParentIsEmpty) {
            // If the parent of the `<figure>` is otherwise empty without the `<figure>`,
            // replace the now empty parent with the `<figure>`.
            outerOuterParent.children.splice(
              outerOuterParent.children.indexOf(outerElParentEl),
              1,
              figureEl
            );
          } else {
            // Otherwise, remove the original image from its parent, and place the
            // `<figure>` after that parent.
            outerOuterParent.children.splice(
              outerOuterParent.children.indexOf(outerElParentEl) + 1,
              0,
              figureEl
            );
            outerElParentEl.children.splice(
              outerElParentEl.children.indexOf(outerEl),
              1
            );
          }
          replacedOuterOuterParent = true;
        }
      }

      if (!replacedOuterOuterParent) {
        // If none of that `<p>` stuff was necessary or possible, just replace
        // the picture or img element in the tree with the new figure element.
        outerElParentEl.children.splice(
          outerElParentEl.children.indexOf(outerEl),
          1,
          figureEl
        );
      }

      if (deleteTitles) {
        // Delete the title on the image as it is now duplicate data.
        delete imgEl.properties.title;
      }
    }
  };
}
