PROBLEM:  ellipses in the html cannot be looked up in the localization.js file for some reason.  I cannot devise a matching scheme.

I've tried using the ellipses in the HTML code, adding the ellipses to the lookup in te localization.js file, doesn't work.

So, last ditch is to simply use three '.'s and do the conversion in the java code to the html ellipses ("\u2026").  This is working for now.

DO NOT USE THE ELLIPSES IN THE HTML CODE.  IT WILL FAIL TO LOCALIZE!!!

THIS SCRIPT ALSO NEEDED TO CONVERT LATIN UNICODE CHARACTERS TO THEIR HTML UNICODE TAGS, SO FOR CHARS BETWEEN 160 AND 255, INCLUSIVE, WE MAP TO THE UNICODE STRING "\U00XX"
fOR EXMAPLE E WITH A ^ BECOMES "\U00EA".