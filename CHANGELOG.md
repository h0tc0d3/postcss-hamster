# Changelog

## 1.0.0

- Initial version.

## 1.1.0
- Performance optimization and refactoring.

## 1.2.0
- Add postcss 6 support.
- Add @sanitize - add sanitize.css(fork normalize)
- Update Normalize to v7
- Add @box-sizing-reset - box-sizing reset.
- Add @copy and @paste macros for copy paste css code.
- Add short macros for fontsize like "fs base"
- Add short macros for lineheight() function - lheight().
- Add @hamster reset; for hard reset hamster global settings.
- Add base() function for get base font size fraction.
- Add responsive viewport sizes with unit: vw.
- Add @ihamster alias for @!hamster.(Some IDE swear a @!).
- Fix Helpers.toCamelCase() function bug.
- Split px-fallback to px-fallback for pixels and rem-fallback for rem.
- Update documentation and web demo.

## 1.2.0 - rc3 
- Add use-global: true setting. It's calculate ratio = localFontSize / globalFontSize.
And all value will multiplied with this ration. It's make responsive sizes in em and rem
 without establish baseline.
