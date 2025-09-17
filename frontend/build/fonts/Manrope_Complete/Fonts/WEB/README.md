# Installing Webfonts
Follow these simple Steps.

## 1.
Put `manrope/` Folder into a Folder called `fonts/`.

## 2.
Put `manrope.css` into your `css/` Folder.

## 3. (Optional)
You may adapt the `url('path')` in `manrope.css` depends on your Website Filesystem.

## 4.
Import `manrope.css` at the top of you main Stylesheet.

```
@import url('manrope.css');
```

## 5.
You are now ready to use the following Rules in your CSS to specify each Font Style:
```
font-family: Manrope-ExtraLight;
font-family: Manrope-Light;
font-family: Manrope-Regular;
font-family: Manrope-Medium;
font-family: Manrope-SemiBold;
font-family: Manrope-Bold;
font-family: Manrope-ExtraBold;
font-family: Manrope-Variable;

```
## 6. (Optional)
Use `font-variation-settings` rule to controll axes of variable fonts:
wght 200.0

Available axes:
'wght' (range from 200.0 to 800.0

