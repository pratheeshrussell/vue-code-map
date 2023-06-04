# vue-code-map 

> **Warning**
> This is just a proof of concept release and is not suitable for use

The purpose of this extension is to generate a simple code flow map from vue code.

## How to use
* Open a .vue file  
* Open command Palette  
* search for command `Show Vue Map`  

## Features

* So far only options api is supported. And very few directives are supported


## Known Issues

* Not able to differentiate between if and else-if statements in script functions

## TO DO
* handling computed props in a simillar way to methods - problem is to handle with and without getter/setter function
* handling watchers props in a simillar way to methods - problem is to handle with and without handler function
* add support for composition
* refactor the code - at this rate I wont understand what is written in after 2 days

## Installing the extension
* Go to the releases page  
* Download the vsix file  
* Run command  
```
code --install-extension vue-code-map-0.0.1-POC.vsix
```

## Release Notes

### 0.0.1
Just a proof of concept release
